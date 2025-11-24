import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { Repository, Server } from '../../src/database/repository';
import { DeviceSyncService } from '../../src/services/deviceSync';
import { Colors, Layout } from '../../src/theme';

export default function ServersScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [servers, setServers] = useState<Server[]>([]);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        loadServers();
    }, []);

    const loadServers = async () => {
        const data = await Repository.getServers();
        setServers(data);
    };

    const handleRescan = async () => {
        setScanning(true);
        try {
            await DeviceSyncService.discoverDevices();
            await loadServers();
            Alert.alert('Success', 'Network scan completed');
        } catch (error) {
            Alert.alert('Error', 'Failed to scan network');
        } finally {
            setScanning(false);
        }
    };

    const handleDeleteServer = (server: Server) => {
        Alert.alert(
            'Delete Server',
            `Are you sure you want to remove ${server.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // Note: Repository doesn't have deleteServer yet, we'll need to add it
                        // For now, just reload
                        await loadServers();
                    },
                },
            ]
        );
    };

    const renderServer = ({ item }: { item: Server }) => (
        <View style={[styles.serverCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.serverInfo}>
                <View style={styles.serverHeader}>
                    <Text style={[styles.serverName, { color: colors.text.primary }]}>{item.name}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: item.status === 'online' ? Colors.success : Colors.error },
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[styles.serverIp, { color: colors.text.secondary }]}>{item.local_ip_address}</Text>
                <Text style={[styles.serverLastSeen, { color: colors.text.secondary }]}>
                    Last seen: {new Date(item.last_seen).toLocaleString()}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteServer(item)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: colors.card }]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Servers</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.rescanButton, { backgroundColor: colors.primary }]}
                    onPress={handleRescan}
                    disabled={scanning}
                >
                    {scanning ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="scan" size={20} color="#FFF" />
                            <Text style={styles.rescanText}>Scan Network</Text>
                        </>
                    )}
                </TouchableOpacity>

                <FlatList
                    data={servers}
                    renderItem={renderServer}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                                No servers found. Tap &quot;Scan Network&quot; to discover devices.
                            </Text>
                        </View>
                    }
                />
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
        flex: 1,
        padding: Layout.padding,
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    rescanText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        gap: 12,
    },
    serverCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    serverInfo: {
        flex: 1,
    },
    serverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    serverName: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    serverIp: {
        fontSize: 14,
        marginBottom: 2,
    },
    serverLastSeen: {
        fontSize: 12,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
    },
});
