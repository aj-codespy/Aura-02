import { Amplify } from 'aws-amplify';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  LogBox,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { NetworkBanner } from '../src/components/ui/NetworkBanner';
import { initDatabase } from '../src/database';
import { DeviceSyncService } from '../src/services/deviceSync';
import { initSentry } from '../src/services/errorTracking';
import { NotificationService } from '../src/services/notifications';
// Use example file as fallback for CI/CD (aws-exports.js is gitignored)
let awsConfig;
try {
  awsConfig = require('../src/constants/aws-exports').default;
} catch {
  awsConfig = require('../src/constants/aws-exports.example').default;
}

// @ts-ignore
Amplify.configure(awsConfig);

// Initialize error tracking
initSentry();

// Ignore specific warnings for Expo Go
LogBox.ignoreLogs(['expo-notifications: Android Push notifications', 'Require cycle:']);

export default function RootLayout() {
  const [isDbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const setupRunning = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    if (!setupRunning.current) {
      setupRunning.current = true;
      setup();
    }

    // Setup notification listener
    const subscription = NotificationService.setupNotificationListener(notification => {
      // Navigate to alerts screen when notification is tapped
      const data = notification.request.content.data;
      if (data.alertId || data.type === 'alert') {
        router.push('/(tabs)/alerts');
      }
    });

    // Setup AppState listener for background/foreground
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      DeviceSyncService.stopBackgroundSync();
      subscription?.remove();
      appStateSubscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to foreground
      console.log('App foregrounded - resuming sync');
      DeviceSyncService.resume();
    } else if (nextAppState.match(/inactive|background/)) {
      // App has gone to background
      console.log('App backgrounded - pausing sync');
      DeviceSyncService.pause();
    }

    appState.current = nextAppState;
  };

  const setup = async () => {
    try {
      setInitError(null);
      await initDatabase();
      console.log('✅ Success: Database & Tables are ready.');

      // Request notification permissions
      await NotificationService.requestPermissions();

      setDbReady(true);

      // Start Background Sync AFTER DB is ready
      // Wait 2 seconds to ensure everything is settled
      setTimeout(() => {
        DeviceSyncService.startBackgroundSync();
      }, 2000);
    } catch (e) {
      console.error('❌ Error: Database failed to load.', e);
      setInitError('Failed to initialize database. Please restart the app.');
      setupRunning.current = false; // Allow retry
    }
  };

  // 2. Show a Loading Screen while DB is setting up
  if (!isDbReady && !initError) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Initializing Aura Brain...</Text>
      </View>
    );
  }

  // Show Error Screen if Init Failed
  if (initError) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: 'red', marginBottom: 20 }]}>{initError}</Text>
        <Text style={styles.text} onPress={setup}>
          Tap to Retry
        </Text>
      </View>
    );
  }

  // 3. Once Ready, Render the App Navigation
  return (
    <>
      <NetworkBanner />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
        <Stack.Screen name="settings/appearance" options={{ headerShown: false }} />
        <Stack.Screen name="settings/help" options={{ headerShown: false }} />
        <Stack.Screen name="settings/servers" options={{ headerShown: false }} />
        <Stack.Screen name="settings/advanced" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
});
