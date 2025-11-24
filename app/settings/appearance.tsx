import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { Layout } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function AppearanceScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    loadHapticsPreference();
  }, []);

  const loadHapticsPreference = async () => {
    const enabled = await HapticsService.isEnabled();
    setHapticsEnabled(enabled);
  };

  const toggleHaptics = async () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    await HapticsService.setEnabled(newValue);
    if (newValue) {
      await HapticsService.light(); // Give feedback when enabling
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Appearance</Text>
      </View>

      <View style={styles.content}>
        <View
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
              Enable dark theme for the app
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View
          style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Haptic Feedback</Text>
            <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
              Enable vibration on button press
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={toggleHaptics}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    padding: Layout.padding,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
});
