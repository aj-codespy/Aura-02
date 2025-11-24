import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';

export type PermissionType = 'camera' | 'notifications' | 'localNetwork';

export interface PermissionStatus {
    granted: boolean;
    canAskAgain: boolean;
}

export const PermissionsManager = {
    // Check camera permission
    checkCamera: async (): Promise<PermissionStatus> => {
        const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
        return {
            granted: status === 'granted',
            canAskAgain,
        };
    },

    // Request camera permission
    requestCamera: async (): Promise<boolean> => {
        const { status } = await Camera.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Camera Permission Required',
                'Please enable camera access in Settings to scan QR codes.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
            return false;
        }

        return true;
    },

    // Check notification permission
    checkNotifications: async (): Promise<PermissionStatus> => {
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        return {
            granted: status === 'granted',
            canAskAgain,
        };
    },

    // Request notification permission
    requestNotifications: async (): Promise<boolean> => {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Notification Permission Required',
                'Please enable notifications in Settings to receive alerts.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
            return false;
        }

        return true;
    },

    // Check if all critical permissions are granted
    checkAllCritical: async (): Promise<{ camera: boolean; notifications: boolean }> => {
        const camera = await PermissionsManager.checkCamera();
        const notifications = await PermissionsManager.checkNotifications();

        return {
            camera: camera.granted,
            notifications: notifications.granted,
        };
    },

    // Request all permissions at once (for onboarding)
    requestAll: async (): Promise<void> => {
        // Request notifications first (less intrusive)
        const notifStatus = await PermissionsManager.checkNotifications();
        if (!notifStatus.granted && notifStatus.canAskAgain) {
            await PermissionsManager.requestNotifications();
        }

        // Camera will be requested when needed (QR scanning)
    },

    // Show permission denied alert with instructions
    showPermissionDeniedAlert: (type: PermissionType) => {
        const messages = {
            camera: {
                title: 'Camera Access Required',
                message: 'To scan QR codes and pair devices, please enable camera access in your device settings.',
            },
            notifications: {
                title: 'Notifications Required',
                message: 'To receive critical alerts about your devices, please enable notifications in your device settings.',
            },
            localNetwork: {
                title: 'Local Network Access Required',
                message: 'To discover and control devices on your network, please enable local network access in your device settings.',
            },
        };

        const { title, message } = messages[type];

        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
    },
};
