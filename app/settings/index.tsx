import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { Layout } from '../../src/theme';

export default function SettingsScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const menuItems = [
        { icon: 'person-outline', label: 'Profile', route: '/(tabs)/profile' },
        { icon: 'notifications-outline', label: 'Notifications', route: '/(tabs)/alerts' },
        { icon: 'moon-outline', label: 'Appearance', route: '/settings/appearance' },
        { icon: 'help-circle-outline', label: 'Help & Support', route: '/settings/help' },
        { icon: 'log-out-outline', label: 'Log Out', route: '/(auth)/login', color: colors.error },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Settings</Text>
            </View>

            <View style={styles.menu}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => item.route && router.push(item.route as any)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconBox, { backgroundColor: item.color ? item.color + '20' : colors.background }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color || colors.primary} />
                            </View>
                            <Text style={[styles.menuItemLabel, { color: item.color || colors.text.primary }]}>
                                {item.label}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                ))}
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
    menu: {
        padding: Layout.padding,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
});
