import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeviceSyncService } from '../../src/services/deviceSync';
import { Colors, Layout } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function AddDeviceScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    HapticsService.medium();
    setScanning(true);

    // Simulate scanning delay and discovery
    try {
      await DeviceSyncService.discoverDevices();
      setScanned(true);
      HapticsService.success();
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error(error);
      HapticsService.error();
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
      </SafeAreaView>

      <View style={styles.cameraContainer}>
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer} />
        </View>

        {scanned ? (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            <Text style={styles.statusText}>Device Paired!</Text>
          </View>
        ) : (
          <View style={styles.controlsContainer}>
            <Text style={styles.instructionText}>
              Align the QR code within the frame to pair your device.
            </Text>
            <TouchableOpacity
              style={styles.simulateButton}
              onPress={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.simulateButtonText}>Simulate Scan</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.padding,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 280,
  },
  focusedContainer: {
    width: 280,
    height: 280,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.primary,
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    opacity: 0.8,
  },
  simulateButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 180,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 40,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
});
