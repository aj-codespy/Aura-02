import db from './index';

// Types
export interface User {
  id: number;
  cognito_id: string;
  email: string;
  full_name: string;
  preferences_json: string;
}

export interface Server {
  id: number;
  name: string;
  local_ip_address: string;
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
  state: string; // 'on', 'off', or value
  temperature: number;
  voltage: number;
  current: number;
}

export interface Alert {
  id: number;
  device_id: number;
  level: 'info' | 'warning' | 'critical';
  message: string;
  created_at: number;
  acknowledged: number;
}

export interface Schedule {
  id: number;
  node_id: number;
  action: 'on' | 'off';
  time: string; // HH:mm
  days: string; // JSON array of days e.g. ["Mon", "Tue"]
  is_active: number;
}

export interface DataPoint {
  id: number;
  node_id: number;
  voltage: number;
  current: number;
  power_consumption: number;
  timestamp: number;
}

// Repository
export const Repository = {
  // User
  upsertUser: async (
    cognitoId: string,
    email: string,
    fullName: string,
    preferences: string = '{}'
  ) => {
    const result = await db.runAsync(
      'INSERT OR REPLACE INTO users (cognito_id, email, full_name, preferences_json) VALUES (?, ?, ?, ?)',
      [cognitoId, email, fullName, preferences]
    );
    return result.lastInsertRowId;
  },

  getUser: async () => {
    return await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
  },

  // Servers
  upsertServer: async (name: string, ip: string, status: string) => {
    // Check if server exists by IP
    const existing = await db.getFirstAsync<Server>(
      'SELECT * FROM servers WHERE local_ip_address = ?',
      [ip]
    );

    if (existing) {
      await db.runAsync('UPDATE servers SET name = ?, status = ?, last_seen = ? WHERE id = ?', [
        name,
        status,
        Date.now(),
        existing.id,
      ]);
      return existing.id;
    } else {
      const result = await db.runAsync(
        'INSERT INTO servers (name, local_ip_address, status, last_seen) VALUES (?, ?, ?, ?)',
        [name, ip, status, Date.now()]
      );
      return result.lastInsertRowId;
    }
  },

  getServers: async () => {
    return await db.getAllAsync<Server>('SELECT * FROM servers');
  },

  // Nodes
  upsertNode: async (
    serverId: number,
    name: string,
    type: string,
    category: string,
    status: string,
    temp: number = 0,
    state: string = 'off',
    voltage: number = 0,
    current: number = 0
  ) => {
    // First, try to find existing node
    const existing = await db.getFirstAsync<Node>(
      'SELECT * FROM nodes WHERE server_id = ? AND name = ?',
      [serverId, name]
    );

    if (existing) {
      // Update existing node
      await db.runAsync(
        'UPDATE nodes SET type = ?, category = ?, status = ?, temperature = ?, state = ?, voltage = ?, current = ? WHERE id = ?',
        [type, category, status, temp, state, voltage, current, existing.id]
      );
      return existing.id;
    } else {
      // Insert new node
      const result = await db.runAsync(
        'INSERT INTO nodes (server_id, name, type, category, status, temperature, state, voltage, current) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [serverId, name, type, category, status, temp, state, voltage, current]
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
    await db.runAsync('UPDATE nodes SET status = ?, temperature = ? WHERE id = ?', [
      status,
      temp,
      nodeId,
    ]);
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
  getAllDataPoints: async (): Promise<(DataPoint & { node_name: string })[]> => {
    const result = await db.getAllAsync<DataPoint & { node_name: string }>(
      `SELECT d.*, n.name as node_name 
             FROM data_points d 
             LEFT JOIN nodes n ON d.node_id = n.id 
             ORDER BY d.timestamp DESC`
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
             LEFT JOIN nodes n ON a.device_id = n.id 
             ORDER BY a.created_at DESC`
    );
    return result;
  },

  updateSchedule: async (
    id: number,
    action: string,
    time: string,
    days: string[],
    isActive: number
  ) => {
    await db.runAsync(
      'UPDATE schedules SET action = ?, time = ?, days = ?, is_active = ? WHERE id = ?',
      [action, time, JSON.stringify(days), isActive, id]
    );
  },

  // Data Points (formerly Energy Data)
  logDataPoint: async (nodeId: number, voltage: number, current: number) => {
    const power = voltage * current;
    await db.runAsync(
      'INSERT INTO data_points (node_id, voltage, current, power_consumption, timestamp) VALUES (?, ?, ?, ?, ?)',
      [nodeId, voltage, current, power, Date.now()]
    );
  },

  // Alerts
  createAlert: async (deviceId: number, level: string, message: string) => {
    try {
      await db.runAsync(
        'INSERT INTO alerts (device_id, level, message, created_at) VALUES (?, ?, ?, ?)',
        [deviceId, level, message, Date.now()]
      );
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  },

  getUnreadAlerts: async () => {
    try {
      return await db.getAllAsync<Alert>(
        'SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY created_at DESC'
      );
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  },

  markAlertRead: async (alertId: number) => {
    try {
      await db.runAsync('UPDATE alerts SET acknowledged = 1 WHERE id = ?', [alertId]);
    } catch (error) {
      console.error('Error marking alert read:', error);
    }
  },

  // Data Points Analytics
  getDataPointsForNode: async (
    nodeId: number,
    startTime: number,
    endTime: number
  ): Promise<
    { timestamp: number; voltage: number; current: number; power_consumption: number }[]
  > => {
    try {
      return await db.getAllAsync(
        'SELECT timestamp, voltage, current, power_consumption FROM data_points WHERE node_id = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC',
        [nodeId, startTime, endTime]
      );
    } catch (error) {
      console.error('Error getting data points:', error);
      return [];
    }
  },

  getAggregatedDataPoints: async (
    nodeId: number,
    startTime: number,
    endTime: number,
    buckets: number = 100
  ): Promise<{ timestamp: number; avgVoltage: number; avgCurrent: number; avgPower: number }[]> => {
    try {
      // Calculate bucket size in milliseconds
      const timeRange = endTime - startTime;
      const bucketSize = Math.floor(timeRange / buckets);

      // Query with bucketing
      const result = await db.getAllAsync<{
        bucket: number;
        avgVoltage: number;
        avgCurrent: number;
        avgPower: number;
      }>(
        `SELECT 
          ((timestamp - ?) / ?) as bucket,
          AVG(voltage) as avgVoltage,
          AVG(current) as avgCurrent,
          AVG(power_consumption) as avgPower
        FROM data_points 
        WHERE node_id = ? AND timestamp >= ? AND timestamp <= ?
        GROUP BY bucket
        ORDER BY bucket ASC`,
        [startTime, bucketSize, nodeId, startTime, endTime]
      );

      // Convert bucket index back to timestamp
      return result.map(row => ({
        timestamp: startTime + row.bucket * bucketSize,
        avgVoltage: row.avgVoltage,
        avgCurrent: row.avgCurrent,
        avgPower: row.avgPower,
      }));
    } catch (error) {
      console.error('Error getting aggregated data points:', error);
      return [];
    }
  },

  deleteOldDataPoints: async (daysToKeep: number = 30) => {
    try {
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
      const result = await db.runAsync('DELETE FROM data_points WHERE timestamp < ?', [cutoffTime]);
      console.log(`Deleted ${result.changes} old data points`);
    } catch (error) {
      console.error('Error deleting old data points:', error);
    }
  },

  // Test Helpers
  clearDatabase: async () => {
    try {
      await db.execAsync(`
        DELETE FROM alerts;
        DELETE FROM data_points;
        DELETE FROM schedules;
        DELETE FROM nodes;
        DELETE FROM servers;
        DELETE FROM users;
      `);
      console.log('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  },
};
