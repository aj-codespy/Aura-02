import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const HAPTICS_KEY = 'haptics_enabled';

const isEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(HAPTICS_KEY);
    return value !== 'false'; // Default to enabled
  } catch {
    return true;
  }
};

export const HapticsService = {
  light: async () => {
    if (await isEnabled()) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  medium: async () => {
    if (await isEnabled()) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  heavy: async () => {
    if (await isEnabled()) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },
  success: async () => {
    if (await isEnabled()) {
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },
  error: async () => {
    if (await isEnabled()) {
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  warning: async () => {
    if (await isEnabled()) {
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },
  isEnabled,
  setEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(HAPTICS_KEY, enabled.toString());
  },
};
