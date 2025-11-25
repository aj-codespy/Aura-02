import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Logger } from './logger';

// Safely import expo-notifications
let Notifications: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
} catch (e) {
  Logger.warn('expo-notifications module not found', e);
}

// Configure notification behavior if module is available
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    Logger.warn('Failed to set notification handler', e);
  }
}

export const NotificationService = {
  // Request notification permissions
  requestPermissions: async (): Promise<boolean> => {
    if (!Notifications) return false;

    try {
      // Check if physical device
      if (!Device.isDevice) {
        Logger.info('Notifications only work on physical devices');
        return false;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Logger.warn('Notification permission denied');
        return false;
      }

      // Store permission status
      await AsyncStorage.setItem('notificationPermission', 'granted');

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('critical-alerts', {
          name: 'Critical Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });
      }

      Logger.info('✅ Notification permissions granted');
      return true;
    } catch (error) {
      Logger.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Check if permissions are granted
  hasPermission: async (): Promise<boolean> => {
    if (!Notifications) return false;

    try {
      const stored = await AsyncStorage.getItem('notificationPermission');
      if (stored === 'granted') {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
      }
      return false;
    } catch {
      return false;
    }
  },

  // Send local notification for critical alert
  sendAlertNotification: async (
    title: string,
    body: string,
    data?: { alertId?: number; nodeId?: number }
  ): Promise<void> => {
    if (!Notifications) return;

    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        Logger.warn('No notification permission, skipping notification');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'alert',
        },
        trigger: null, // Send immediately
      });

      Logger.info('📬 Notification sent:', title);
    } catch (error) {
      Logger.error('Error sending notification:', error);
    }
  },

  // Send notification for device status change
  sendDeviceNotification: async (deviceName: string, status: 'on' | 'off'): Promise<void> => {
    if (!Notifications) return;

    const hasPermission = await NotificationService.hasPermission();
    if (!hasPermission) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Device Status Changed',
          body: `${deviceName} is now ${status.toUpperCase()}`,
          data: { type: 'device_status' },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      Logger.warn('Failed to send device notification', error);
    }
  },

  // Cancel all notifications
  cancelAllNotifications: async (): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      Logger.warn('Failed to cancel notifications', error);
    }
  },

  // Set up notification response listener
  setupNotificationListener: (onNotificationTap: (notification: any) => void) => {
    if (!Notifications) return null;

    try {
      const subscription = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          onNotificationTap(response.notification);
        }
      );
      return subscription;
    } catch (error) {
      Logger.warn('Failed to setup notification listener', error);
      return null;
    }
  },

  // Badge management
  setBadgeCount: async (count: number): Promise<void> => {
    if (!Notifications) return;

    if (Platform.OS === 'ios') {
      try {
        await Notifications.setBadgeCountAsync(count);
      } catch (error) {
        Logger.warn('Failed to set badge count', error);
      }
    }
  },

  clearBadge: async (): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      Logger.warn('Failed to clear badge', error);
    }
  },
};
