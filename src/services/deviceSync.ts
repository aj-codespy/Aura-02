import * as Network from 'expo-network';
import { Repository } from '../database/repository';
import { HardwareService } from './hardware';
import { NotificationService } from './notifications';

// Flag to switch between Mock and Real Hardware
// For production, set EXPO_PUBLIC_USE_MOCK_HARDWARE=false in .env
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_HARDWARE === 'true' || false;

// Mock Hardware API (Kept for fallback/testing)
export const MockHardware = {
  _forcedTemp: null as number | null,
  setForcedTemp: (temp: number | null) => {
    MockHardware._forcedTemp = temp;
  },

  getStatus: async (ip: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const isOnline = Math.random() > 0.1;
    return isOnline ? 'online' : 'offline';
  },

  getNodes: async (ip: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      {
        name: 'Fan 1',
        type: 'FAN',
        category: 'Assembly Line 1',
        status: 'on',
        state: 'on',
        temperature: MockHardware._forcedTemp ?? 45.5,
        voltage: 220,
        current: 1.5,
      },
      {
        name: 'Light 1',
        type: 'LIGHT',
        category: 'Workshop Lighting',
        status: 'off',
        state: 'off',
        temperature: 25.0,
        voltage: 220,
        current: 0,
      },
      {
        name: 'Motor 1',
        type: 'MOTOR',
        category: 'Assembly Line 2',
        status: 'on',
        state: 'on',
        temperature: MockHardware._forcedTemp ?? 85.2,
        voltage: 220,
        current: 5.2,
      },
      {
        name: 'Drill Press',
        type: 'MOTOR',
        category: 'Assembly Line 1',
        status: 'off',
        state: 'off',
        temperature: 30.0,
        voltage: 220,
        current: 0,
      },
      {
        name: 'Main Breaker',
        type: 'SWITCH',
        category: 'Power Distribution',
        status: 'on',
        state: 'on',
        temperature: 40.0,
        voltage: 220,
        current: 10.5,
      },
    ];
  },
};

export const DeviceSyncService = {
  syncCounter: 0,
  consecutiveFailures: new Map<string, number>(),

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
          status = await MockHardware.getStatus(server.local_ip_address);
          if (status === 'online') {
            nodes = await MockHardware.getNodes(server.local_ip_address);
          }
        } else {
          // Real Hardware Sync
          const serverStatus = await HardwareService.getServerStatus(server.local_ip_address);

          if (serverStatus) {
            status = 'online';
            // Reset failure count on success
            DeviceSyncService.consecutiveFailures.set(server.local_ip_address, 0);

            // Update server details
            await Repository.upsertServer(
              serverStatus.serverName,
              server.local_ip_address,
              'online'
            );

            // Fetch Nodes
            const linkedNodes = await HardwareService.getLinkedNodes(server.local_ip_address);
            nodes = linkedNodes.map(n => ({
              name: n.nodeName,
              type: 'GENERIC',
              category: 'Uncategorized',
              status: n.state,
              state: n.state,
              temperature: 0,
              voltage: 0,
              current: 0,
            }));

            // Fetch Data Sync (Energy/Temp)
            const syncData = await HardwareService.syncData(server.local_ip_address, 0);
            if (syncData && syncData.newData) {
              await HardwareService.acknowledgeData(
                server.local_ip_address,
                syncData.latestTimestamp
              );
            }
          } else {
            // Handle Failure / Offline
            const failures =
              (DeviceSyncService.consecutiveFailures.get(server.local_ip_address) || 0) + 1;
            DeviceSyncService.consecutiveFailures.set(server.local_ip_address, failures);

            console.log(`Server ${server.name} sync failed. Count: ${failures}`);

            // Only mark offline if failures >= 3
            if (failures >= 3) {
              status = 'offline';
            } else {
              // Keep previous status (optimistic)
              status = server.status;
            }
          }
        }

        // Update Server Status in DB (only if changed or confirmed online)
        if (status !== server.status || status === 'online') {
          await Repository.upsertServer(server.name, server.local_ip_address, status);
        }

        // Server Offline Alert
        if (status === 'offline' && server.status === 'online') {
          const alertMessage = `Server ${server.name} (${server.local_ip_address}) is unreachable`;
          await Repository.createAlert(server.id, 'critical', alertMessage);
          await NotificationService.sendAlertNotification('🚨 Server Offline', alertMessage, {
            nodeId: server.id,
          });
        }

        if (status === 'online') {
          for (const node of nodes) {
            const existingNodes = await Repository.getAllNodes();
            const existingNode = existingNodes.find(
              n => n.name === node.name && n.server_id === server.id
            );

            if (existingNode && existingNode.status !== node.status) {
              await NotificationService.sendDeviceNotification(node.name, node.status);
            }

            const nodeId = await Repository.upsertNode(
              server.id,
              node.name,
              node.type,
              node.category,
              node.status,
              node.temperature,
              node.state,
              node.voltage,
              node.current
            );

            if (node.temperature > 80) {
              const recentAlerts = await Repository.getUnreadAlerts();
              const hasRecentAlert = recentAlerts.some(
                a => a.device_id === nodeId && a.message.includes(node.name)
              );

              if (!hasRecentAlert) {
                const alertMessage = `${node.name} is overheating(${node.temperature}°C)`;
                await Repository.createAlert(nodeId, 'critical', alertMessage);
                await NotificationService.sendAlertNotification('🔥 Critical Alert', alertMessage, {
                  nodeId,
                  alertId: nodeId,
                });
              }
            }

            if (USE_MOCK && DeviceSyncService.syncCounter % 3 === 0) {
              const vol = 220 + Math.random() * 20;
              const cur = node.status === 'on' ? Math.random() * 10 : 0;
              await Repository.logDataPoint(nodeId, vol, cur);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to sync server ${server.name}: `, error);
      }
    }
    DeviceSyncService.syncCounter++;
    console.log('Device Sync Completed');
  },

  discoverDevices: async () => {
    console.log('Scanning for devices...');
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await DeviceSyncService.syncAll();
      return true;
    } else {
      try {
        const ip = await Network.getIpAddressAsync();
        const subnet = ip.substring(0, ip.lastIndexOf('.'));
        console.log(`Scanning subnet: ${subnet}.x`);

        const scanPromises = [];
        // Scan 1-254
        for (let i = 1; i < 255; i++) {
          const targetIp = `${subnet}.${i}`;
          // Skip own IP if needed, but usually fine

          // Create a promise that resolves to null on failure/timeout
          const check = async () => {
            try {
              // Short timeout for discovery
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout

              const status = await HardwareService.getServerStatus(targetIp); // This needs to support abort signal ideally, or we rely on internal timeout
              clearTimeout(timeoutId);

              if (status) {
                console.log(`Found server at ${targetIp}`);
                await Repository.upsertServer(status.serverName, targetIp, 'online');
              }
            } catch (e) {
              // Ignore errors
            }
          };
          scanPromises.push(check());

          // Batch to avoid too many parallel requests
          if (scanPromises.length >= 20) {
            await Promise.all(scanPromises);
            scanPromises.length = 0;
          }
        }

        // Finish remaining
        if (scanPromises.length > 0) {
          await Promise.all(scanPromises);
        }

        await DeviceSyncService.syncAll();
        return true;
      } catch (e) {
        console.error('Discovery failed:', e);
        return false;
      }
    }
  },

  // Background Sync
  syncInterval: null as NodeJS.Timeout | null,

  startBackgroundSync: () => {
    if (DeviceSyncService.syncInterval) {
      clearInterval(DeviceSyncService.syncInterval);
    }

    console.log('Starting background sync (every 60 seconds)...');
    DeviceSyncService.syncInterval = setInterval(() => {
      DeviceSyncService.syncAll();
    }, 60000);
  },

  stopBackgroundSync: () => {
    if (DeviceSyncService.syncInterval) {
      clearInterval(DeviceSyncService.syncInterval);
      DeviceSyncService.syncInterval = null;
      console.log('Background sync stopped');
    }
  },

  toggleNode: async (nodeId: number, state: 'on' | 'off') => {
    if (USE_MOCK) return;

    const servers = await Repository.getServers();
    if (servers.length > 0) {
      // TODO: Implement proper routing to correct server
    }
  },
};
