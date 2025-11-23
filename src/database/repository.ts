import db from './index';

// Types
export interface User {
    id: number;
    cognito_id: string;
    email: string;
    full_name: string;
}

export interface Server {
    id: number;
    name: string;
    ip_address: string;
    status: 'online' | 'offline';
    last_seen: number;
}

export interface Node {
    id: number;
    server_id: number;
    name: string;
    type: string;
    category: string;
    status: 'on' | 'off' | 'offline';
    temperature: number;
}

export interface Alert {
    id: number;
    node_id: number;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    created_at: number;
    is_read: number;
}

export interface Schedule {
    id: number;
    node_id: number;
    action: 'on' | 'off';
    time: string; // HH:mm
    days: string; // JSON array of days e.g. ["Mon", "Tue"]
    is_active: number;
}

export interface EnergyData {
    id: number;
    node_id: number;
    voltage: number;
    current: number;
    power: number;
    timestamp: number;
}

// Repository
export const Repository = {
    // User
    upsertUser: async (cognitoId: string, email: string, fullName: string) => {
        const result = await db.runAsync(
            'INSERT OR REPLACE INTO users (cognito_id, email, full_name) VALUES (?, ?, ?)',
            [cognitoId, email, fullName]
        );
        return result.lastInsertRowId;
    },

    getUser: async () => {
        return await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
    },

    // Servers
    upsertServer: async (name: string, ip: string, status: string) => {
        const result = await db.runAsync(
            'INSERT INTO servers (name, ip_address, status, last_seen) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status, last_seen = excluded.last_seen',
            [name, ip, status, Date.now()]
        );
        return result.lastInsertRowId;
    },

    getServers: async () => {
        return await db.getAllAsync<Server>('SELECT * FROM servers');
    },

    // Nodes
    upsertNode: async (serverId: number, name: string, type: string, category: string, status: string, temp?: number) => {
        // First, try to find existing node
        const existing = await db.getFirstAsync<Node>(
            'SELECT * FROM nodes WHERE server_id = ? AND name = ?',
            [serverId, name]
        );

        if (existing) {
            // Update existing node
            await db.runAsync(
                'UPDATE nodes SET type = ?, category = ?, status = ?, temperature = ? WHERE id = ?',
                [type, category, status, temp || 0, existing.id]
            );
            return existing.id;
        } else {
            // Insert new node
            const result = await db.runAsync(
                'INSERT INTO nodes (server_id, name, type, category, status, temperature) VALUES (?, ?, ?, ?, ?, ?)',
                [serverId, name, type, category, status, temp || 0]
            );
            return result.lastInsertRowId;
        }
    },

    getNodesByServer: async (serverId: number) => {
        return await db.getAllAsync<Node>('SELECT * FROM nodes WHERE server_id = ?', [serverId]);
    },

    getAllNodes: async () => {
        return await db.getAllAsync<Node>('SELECT * FROM nodes');
    },

    getNodesByCategory: async (category: string) => {
        return await db.getAllAsync<Node>('SELECT * FROM nodes WHERE category = ?', [category]);
    },

    updateNodeStatus: async (nodeId: number, status: string, temp: number) => {
        await db.runAsync(
            'UPDATE nodes SET status = ?, temperature = ? WHERE id = ?',
            [status, temp, nodeId]
        );
    },

    // Schedules
    createSchedule: async (nodeId: number, time: string, days: string, action: 'on' | 'off') => {
        const result = await db.runAsync(
            'INSERT INTO schedules (node_id, action, time, days, is_active) VALUES (?, ?, ?, ?, ?)',
            [nodeId, action, time, days, 1]
        );
        return result.lastInsertRowId;
    },

    getSchedules: async () => {
        return await db.getAllAsync<Schedule>('SELECT * FROM schedules');
    },

    deleteSchedule: async (scheduleId: number): Promise<void> => {
        await db.runAsync('DELETE FROM schedules WHERE id = ?', [scheduleId]);
    },

    // Export methods - Get all data with joins
    getAllEnergyData: async (): Promise<(EnergyData & { node_name: string })[]> => {
        const result = await db.getAllAsync<EnergyData & { node_name: string }>(
            `SELECT e.*, n.name as node_name 
             FROM energy_data e 
             LEFT JOIN nodes n ON e.node_id = n.id 
             ORDER BY e.timestamp DESC`
        );
        return result;
    },

    getAllSchedules: async (): Promise<(Schedule & { node_name: string })[]> => {
        const result = await db.getAllAsync<Schedule & { node_name: string }>(
            `SELECT s.*, n.name as node_name 
             FROM schedules s 
             LEFT JOIN nodes n ON s.node_id = n.id 
             ORDER BY s.time`
        );
        return result;
    },

    getAllAlerts: async (): Promise<(Alert & { node_name: string })[]> => {
        const result = await db.getAllAsync<Alert & { node_name: string }>(
            `SELECT a.*, n.name as node_name 
             FROM alerts a 
             LEFT JOIN nodes n ON a.node_id = n.id 
             ORDER BY a.created_at DESC`
        );
        return result;
    },

    updateSchedule: async (id: number, action: string, time: string, days: string[], isActive: number) => {
        await db.runAsync(
            'UPDATE schedules SET action = ?, time = ?, days = ?, is_active = ? WHERE id = ?',
            [action, time, JSON.stringify(days), isActive, id]
        );
    },

    // Energy Data
    logEnergyData: async (nodeId: number, voltage: number, current: number) => {
        const power = voltage * current;
        await db.runAsync(
            'INSERT INTO energy_data (node_id, voltage, current, power, timestamp) VALUES (?, ?, ?, ?, ?)',
            [nodeId, voltage, current, power, Date.now()]
        );
    },

    // Alerts
    createAlert: async (nodeId: number, severity: string, message: string) => {
        try {
            await db.runAsync(
                'INSERT INTO alerts (node_id, severity, message, created_at) VALUES (?, ?, ?, ?)',
                [nodeId, severity, message, Date.now()]
            );
        } catch (error) {
            console.error('Error creating alert:', error);
        }
    },

    getUnreadAlerts: async () => {
        try {
            return await db.getAllAsync<Alert>('SELECT * FROM alerts WHERE is_read = 0 ORDER BY created_at DESC');
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    },

    markAlertRead: async (alertId: number) => {
        try {
            await db.runAsync('UPDATE alerts SET is_read = 1 WHERE id = ?', [alertId]);
        } catch (error) {
            console.error('Error marking alert read:', error);
        }
    },

    // Test Helpers
    clearDatabase: async () => {
        try {
            await db.execAsync(`
        DELETE FROM alerts;
        DELETE FROM energy_data;
        DELETE FROM schedules;
        DELETE FROM nodes;
        DELETE FROM servers;
        DELETE FROM users;
      `);
            console.log('Database cleared');
        } catch (error) {
            console.error('Error clearing database:', error);
        }
    }
};
