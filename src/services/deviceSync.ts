import { Repository } from '../database/repository';
import { HardwareService } from './hardware';

// Flag to switch between Mock and Real Hardware
const USE_MOCK = true; // Set to false to use real hardware

// Mock Hardware API (Kept for fallback/testing)
export const MockHardware = {
    _forcedTemp: null as number | null,
    setForcedTemp: (temp: number | null) => { MockHardware._forcedTemp = temp; },

    getStatus: async (ip: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const isOnline = Math.random() > 0.1;
        return isOnline ? 'online' : 'offline';
    },

    getNodes: async (ip: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return [
            { name: 'Fan 1', type: 'FAN', category: 'Assembly Line 1', status: 'on', temperature: MockHardware._forcedTemp ?? 45.5 },
            { name: 'Light 1', type: 'LIGHT', category: 'Workshop Lighting', status: 'off', temperature: 25.0 },
            { name: 'Motor 1', type: 'MOTOR', category: 'Assembly Line 2', status: 'on', temperature: MockHardware._forcedTemp ?? 85.2 },
            { name: 'Drill Press', type: 'MOTOR', category: 'Assembly Line 1', status: 'off', temperature: 30.0 },
            { name: 'Main Breaker', type: 'SWITCH', category: 'Power Distribution', status: 'on', temperature: 40.0 }
        ];
    }
};

export const DeviceSyncService = {
    syncAll: async (): Promise<void> => {
        console.log('Starting Device Sync...');
        const servers = await Repository.getServers();

        // Seed if empty (Mock Mode only)
        if (servers.length === 0 && USE_MOCK) {
            await Repository.upsertServer('Main Server', '192.168.1.100', 'online');
            return DeviceSyncService.syncAll();
        }

        for (const server of servers) {
            try {
                let status = 'offline';
                let nodes: any[] = [];

                if (USE_MOCK) {
                    status = await MockHardware.getStatus(server.ip_address);
                    if (status === 'online') {
                        nodes = await MockHardware.getNodes(server.ip_address);
                    }
                } else {
                    // Real Hardware Sync
                    const serverStatus = await HardwareService.getServerStatus(server.ip_address);
                    if (serverStatus) {
                        status = 'online';
                        // Update server details
                        await Repository.upsertServer(serverStatus.serverName, server.ip_address, 'online');

                        // Fetch Nodes
                        const linkedNodes = await HardwareService.getLinkedNodes(server.ip_address);
                        // Map API response to our DB schema
                        // Note: API doesn't return category/type yet, so we might default them or need to enhance API
                        nodes = linkedNodes.map(n => ({
                            name: n.nodeName,
                            type: 'GENERIC', // Default
                            category: 'Uncategorized', // Default
                            status: n.state, // 'on' | 'off'
                            temperature: 0 // API doesn't return temp in getLinkedNodes
                        }));

                        // Fetch Data Sync (Energy/Temp)
                        // In a real app we'd track lastSyncTimestamp per server
                        const syncData = await HardwareService.syncData(server.ip_address, 0);
                        if (syncData && syncData.newData) {
                            for (const d of syncData.newData) {
                                // Find node by ID (we need to map API ID to DB ID, for now assume name matching or similar?)
                                // The API returns string IDs ("NODE_ID_..."), DB uses numbers.
                                // We need a mapping table or change DB to use string IDs.
                                // For this iteration, we'll skip complex data mapping to avoid breaking schema changes mid-flight.
                            }
                            // Ack
                            await HardwareService.acknowledgeData(server.ip_address, syncData.latestTimestamp);
                        }
                    } else {
                        status = 'offline';
                    }
                }

                // Update Server Status in DB
                if (USE_MOCK) { // In real mode we updated it above with name
                    await Repository.upsertServer(server.name, server.ip_address, status);
                }

                if (status === 'online') {
                    for (const node of nodes) {
                        // Upsert node
                        const nodeId = await Repository.upsertNode(
                            server.id,
                            node.name,
                            node.type,
                            node.category,
                            node.status,
                            node.temperature
                        );

                        // Logic / Alerts - only create if temperature is high AND no recent alert exists
                        if (node.temperature > 80) {
                            const recentAlerts = await Repository.getUnreadAlerts();
                            const hasRecentAlert = recentAlerts.some(
                                a => a.node_id === nodeId && a.message.includes(node.name)
                            );

                            if (!hasRecentAlert) {
                                const alertMessage = `${node.name} is overheating (${node.temperature}°C)`;
                                await Repository.createAlert(
                                    nodeId,
                                    'critical',
                                    alertMessage
                                );

                                // Send push notification
                                await NotificationService.sendAlertNotification(
                                    '🔥 Critical Alert',
                                    alertMessage,
                                    { nodeId, alertId: nodeId }
                                );
                            }
                        }

                        // Mock Energy Data - only log occasionally to reduce memory usage
                        if (USE_MOCK && DeviceSyncService.syncCounter % 3 === 0) {
                            const vol = 220 + Math.random() * 20;
                            const cur = node.status === 'on' ? Math.random() * 10 : 0;
                            await Repository.logEnergyData(nodeId, vol, cur);
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to sync server ${server.name}:`, error);
            }
        }
        DeviceSyncService.syncCounter++;
        console.log('Device Sync Completed');
    },

    syncCounter: 0,

    discoverDevices: async () => {
        console.log('Scanning for devices...');
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await DeviceSyncService.syncAll();
            return true;
        } else {
            // Real Discovery: Scan local subnet (e.g., 192.168.1.1 to .254)
            // This is expensive. For now, we'll just check a few known IPs or assume static IP.
            // In production, use react-native-zeroconf or similar.
            const knownIps = ['192.168.1.100', '192.168.1.101'];
            for (const ip of knownIps) {
                const status = await HardwareService.getServerStatus(ip);
                if (status) {
                    await Repository.upsertServer(status.serverName, ip, 'online');
                }
            }
            await DeviceSyncService.syncAll();
            return true;
        }
    },

    // Background Sync
    syncInterval: null as NodeJS.Timeout | null,

    startBackgroundSync: () => {
        // Clear existing interval if any
        if (DeviceSyncService.syncInterval) {
            clearInterval(DeviceSyncService.syncInterval);
        }

        console.log('Starting background sync (every 60 seconds)...');
        DeviceSyncService.syncInterval = setInterval(() => {
            DeviceSyncService.syncAll();
        }, 60000); // Increased from 30s to 60s for better battery life
    },

    stopBackgroundSync: () => {
        if (DeviceSyncService.syncInterval) {
            clearInterval(DeviceSyncService.syncInterval);
            DeviceSyncService.syncInterval = null;
            console.log('Background sync stopped');
        }
    },

    // Helper to toggle state
    toggleNode: async (nodeId: number, state: 'on' | 'off') => {
        if (USE_MOCK) return; // Mock handles optimistic UI only

        // We need to find the server IP for this node
        // This requires a join query or fetching node then server
        // For now, assuming single server or we'd need to update Repository to get Node+Server
        const servers = await Repository.getServers();
        if (servers.length > 0) {
            // In real app, use correct server. Here use first.
            // Also need to map DB ID to API ID.
            // Assuming DB ID matches or we have a mapping.
            // Since we don't have API ID in DB yet, we can't really call API.
            // TODO: Add api_id column to nodes.
            // await HardwareService.setNodeState(servers[0].ip_address, String(nodeId), state);
        }
    }
};
