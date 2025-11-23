import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Colors, Layout, Typography } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function DevicesScreen() {
    const router = useRouter();

    const categories = [
        { id: 'assembly1', name: 'Assembly Line 1', icon: 'settings-outline', status: '8 of 10 devices online' },
        { id: 'assembly2', name: 'Assembly Line 2', icon: 'settings-outline', status: '15 of 15 devices online' },
        { id: 'power', name: 'Power Distribution', icon: 'flash-outline', status: 'All systems nominal' },
        { id: 'lighting', name: 'Workshop Lighting', icon: 'bulb-outline', status: '3 devices unreachable' },
    ];

    const handlePress = useCallback((id: string) => {
        HapticsService.light();
        router.push(`/devices/${id}`);
    }, [router]);

    const handleAddDevice = useCallback(() => {
        HapticsService.medium();
        router.push('/devices/add');
    }, [router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Devices</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Device</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Categories</Text>

                <View style={styles.grid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.gridItem}
                            onPress={() => handlePress(cat.id)}
                        >
                            <Card style={styles.card}>
                                <Ionicons name={cat.icon as any} size={32} color={Colors.primary} style={styles.icon} />
                                <Text style={styles.cardTitle}>{cat.name}</Text>
                                <Text style={styles.cardStatus}>{cat.status}</Text>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Unlinked Devices</Text>
                <TouchableOpacity onPress={() => HapticsService.light()}>
                    <Card style={styles.unlinkedCard}>
                        <Ionicons name="link-outline" size={24} color={Colors.text.secondary} />
                        <View>
                            <Text style={styles.unlinkedTitle}>View Unlinked</Text>
                            <Text style={styles.unlinkedSubtitle}>2 devices</Text>
                        </View>
                    </Card>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.padding,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.primary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    content: {
        padding: Layout.padding,
    },
    sectionTitle: {
        ...Typography.subHeader,
        marginBottom: 12,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    gridItem: {
        width: '48%',
    },
    card: {
        alignItems: 'center',
        padding: 24,
        height: 160,
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        color: Colors.text.primary,
    },
    cardStatus: {
        fontSize: 12,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    unlinkedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        borderStyle: 'dashed',
        borderColor: Colors.text.secondary,
    },
    unlinkedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    unlinkedSubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
});
