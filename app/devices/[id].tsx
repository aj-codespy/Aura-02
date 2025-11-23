import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { Node, Repository } from '../../src/database/repository';
import { DeviceSyncService } from '../../src/services/deviceSync';
import { Colors, Layout } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function DeviceListScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [devices, setDevices] = useState<Node[]>([]);
    const [categoryName, setCategoryName] = useState('Devices');

    useEffect(() => {
        const nameMap: Record<string, string> = {
            'assembly1': 'Assembly Line 1',
            'assembly2': 'Assembly Line 2',
            'power': 'Power Distribution',
            'lighting': 'Workshop Lighting',
        };

        let targetCategory = 'Devices';
        if (typeof id === 'string') {
            targetCategory = nameMap[id] || 'Devices';
            setCategoryName(targetCategory);
        }

        loadDevices(targetCategory);
    }, [id]);

    const loadDevices = async (category: string) => {
        let nodes: Node[] = [];
        if (category === 'Devices') {
            nodes = await Repository.getAllNodes();
        } else {
            nodes = await Repository.getNodesByCategory(category);
        }
        setDevices(nodes);
    };

    const toggleDevice = async (nodeId: number, currentStatus: string) => {
        HapticsService.medium();
        const newStatus = currentStatus === 'on' ? 'off' : 'on';

        // Optimistic update
        setDevices(prev => prev.map(d =>
            d.id === nodeId ? { ...d, status: newStatus } : d
        ));

        // Call API
        try {
            await DeviceSyncService.toggleNode(nodeId, newStatus);
        } catch (error) {
            console.error('Failed to toggle device:', error);
            // Revert on failure
            setDevices(prev => prev.map(d =>
                d.id === nodeId ? { ...d, status: currentStatus as any } : d
            ));
        }
    };

    const renderItem = ({ item }: { item: Node }) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <View style={styles.statusRow}>
                        <StatusBadge status={item.status === 'on' ? 'online' : 'offline'} />
                    </View>
                </View>
                <Switch
                    value={item.status === 'on'}
                    onValueChange={() => toggleDevice(item.id, item.status)}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={'#FFF'}
                />
            </View>

            <View style={styles.divider} />

            <Text style={styles.usageText}>
                Usage Today: {(Math.random() * 10).toFixed(1)} kWh
            </Text>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    HapticsService.light();
                    router.back();
                }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={devices}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
            />
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
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    list: {
        padding: Layout.padding,
        gap: 12,
    },
    card: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: 12,
    },
    usageText: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
});
