import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  // Request notification permissions
  requestPermissions: async (): Promise<boolean> => {
    try {
      // Check if physical device
      if (!Device.isDevice) {
        console.log('Notifications only work on physical devices');
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
        console.log('Notification permission denied');
        await AsyncStorage.setItem('notificationPermission', 'denied');
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

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Check if permissions are granted
  hasPermission: async (): Promise<boolean> => {
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
    try {
      const hasPermission = await NotificationService.hasPermission();
      if (!hasPermission) {
        console.log('No notification permission, skipping notification');
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

      console.log('📬 Notification sent:', title);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  // Send notification for device status change
  sendDeviceNotification: async (deviceName: string, status: 'on' | 'off'): Promise<void> => {
    const hasPermission = await NotificationService.hasPermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Device Status Changed',
        body: `${deviceName} is now ${status.toUpperCase()}`,
        data: { type: 'device_status' },
        sound: 'default',
      },
      trigger: null,
    });
  },

  // Cancel all notifications
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  },

  // Set up notification response listener
  setupNotificationListener: (
    onNotificationTap: (notification: Notifications.Notification) => void
  ) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        onNotificationTap(response.notification);
      }
    );

    return subscription;
  },

  // Badge management
  setBadgeCount: async (count: number): Promise<void> => {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  },

  clearBadge: async (): Promise<void> => {
    await Notifications.setBadgeCountAsync(0);
  },
};
