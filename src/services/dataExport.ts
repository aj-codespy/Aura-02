import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Repository } from '../database/repository';

const BACKUP_DATE_KEY = 'last_backup_date';

export interface ExportResult {
  success: boolean;
  filesCreated: string[];
  error?: string;
}

export interface ImportResult {
  success: boolean;
  imported: {
    dataPoints: number;
    schedules: number;
    devices: number;
    alerts: number;
  };
  errors: string[];
}

export const DataExportService = {
  // Export all data to CSV files
  exportAllData: async (): Promise<ExportResult> => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // Use temp directory - FileSystem constants not available in current version
      const exportDir = '/tmp/aura-exports/';

      // Create export directory
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      const files: string[] = [];

      // Export Data Points (formerly Energy Data)
      const dataPointsFile = await DataExportService.exportDataPoints(exportDir, timestamp);
      if (dataPointsFile) files.push(dataPointsFile);

      // Export Schedules
      const schedulesFile = await DataExportService.exportSchedules(exportDir, timestamp);
      if (schedulesFile) files.push(schedulesFile);

      // Export Devices
      const devicesFile = await DataExportService.exportDevices(exportDir, timestamp);
      if (devicesFile) files.push(devicesFile);

      // Export Alerts
      const alertsFile = await DataExportService.exportAlerts(exportDir, timestamp);
      if (alertsFile) files.push(alertsFile);

      // Update last backup date
      await AsyncStorage.setItem(BACKUP_DATE_KEY, new Date().toISOString());

      // Share files
      if (files.length > 0) {
        // Create a zip or share first file (for simplicity, share directory)
        await Sharing.shareAsync(exportDir);
      }

      return {
        success: true,
        filesCreated: files,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        filesCreated: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Export data points to CSV
  exportDataPoints: async (dir: string, timestamp: string): Promise<string | null> => {
    try {
      const data = await Repository.getAllDataPoints();
      if (data.length === 0) return null;

      const csv = [
        'timestamp,node_id,node_name,voltage,current,power_consumption',
        ...data.map(
          d =>
            `${d.timestamp},${d.node_id},"${d.node_name}",${d.voltage},${d.current},${d.power_consumption}`
        ),
      ].join('\n');

      const filename = `${dir}data_points_${timestamp}.csv`;
      await FileSystem.writeAsStringAsync(filename, csv);
      return filename;
    } catch (error) {
      console.error('Data points export error:', error);
      return null;
    }
  },

  // Export schedules to CSV
  exportSchedules: async (dir: string, timestamp: string): Promise<string | null> => {
    try {
      const schedules = await Repository.getAllSchedules();
      if (schedules.length === 0) return null;

      const csv = [
        'id,node_id,node_name,time,days,action,is_active',
        ...schedules.map(
          s =>
            `${s.id},${s.node_id},"${s.node_name}",${s.time},${s.days},${s.action},${s.is_active ? 1 : 0}`
        ),
      ].join('\n');

      const filename = `${dir}schedules_${timestamp}.csv`;
      await FileSystem.writeAsStringAsync(filename, csv);
      return filename;
    } catch (error) {
      console.error('Schedules export error:', error);
      return null;
    }
  },

  // Export devices to CSV
  exportDevices: async (dir: string, timestamp: string): Promise<string | null> => {
    try {
      const devices = await Repository.getAllNodes();
      if (devices.length === 0) return null;

      const csv = [
        'id,name,type,category,status,temperature,server_id,state,voltage,current',
        ...devices.map(
          d =>
            `${d.id},"${d.name}",${d.type},"${d.category}",${d.status},${d.temperature || ''},${d.server_id},${d.state || ''},${d.voltage || ''},${d.current || ''}`
        ),
      ].join('\n');

      const filename = `${dir}devices_${timestamp}.csv`;
      await FileSystem.writeAsStringAsync(filename, csv);
      return filename;
    } catch (error) {
      console.error('Devices export error:', error);
      return null;
    }
  },

  // Export alerts to CSV
  exportAlerts: async (dir: string, timestamp: string): Promise<string | null> => {
    try {
      const alerts = await Repository.getAllAlerts();
      if (alerts.length === 0) return null;

      const csv = [
        'id,device_id,node_name,level,message,created_at,acknowledged',
        ...alerts.map(
          a =>
            `${a.id},${a.device_id},"${a.node_name}",${a.level},"${a.message}",${a.created_at},${a.acknowledged ? 1 : 0}`
        ),
      ].join('\n');

      const filename = `${dir}alerts_${timestamp}.csv`;
      await FileSystem.writeAsStringAsync(filename, csv);
      return filename;
    } catch (error) {
      console.error('Alerts export error:', error);
      return null;
    }
  },

  // Import data from CSV file
  importData: async (fileUri: string): Promise<ImportResult> => {
    const result: ImportResult = {
      success: false,
      imported: {
        dataPoints: 0,
        schedules: 0,
        devices: 0,
        alerts: 0,
      },
      errors: [],
    };

    try {
      const content = await FileSystem.readAsStringAsync(fileUri);
      const filename = fileUri.split('/').pop()?.toLowerCase() || '';

      if (filename.includes('data_points') || filename.includes('energy')) {
        result.imported.dataPoints = await DataExportService.importDataPoints(content);
      } else if (filename.includes('schedule')) {
        result.imported.schedules = await DataExportService.importSchedules(content);
      } else if (filename.includes('device')) {
        result.imported.devices = await DataExportService.importDevices(content);
      } else if (filename.includes('alert')) {
        result.imported.alerts = await DataExportService.importAlerts(content);
      } else {
        result.errors.push('Unknown file type');
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Import failed');
      return result;
    }
  },

  // Import data points from CSV
  importDataPoints: async (csv: string): Promise<number> => {
    const lines = csv.split('\n').slice(1); // Skip header
    let count = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const [, nodeId, , voltage, current] = line.split(',').map(v => v.replace(/"/g, '').trim());

      await Repository.logDataPoint(parseInt(nodeId), parseFloat(voltage), parseFloat(current));
      count++;
    }

    return count;
  },

  // Import schedules from CSV
  importSchedules: async (csv: string): Promise<number> => {
    const lines = csv.split('\n').slice(1);
    let count = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const [, nodeId, , time, days, action] = line.split(',').map(v => v.replace(/"/g, '').trim());

      await Repository.createSchedule(
        parseInt(nodeId),
        time,
        days, // Pass as string
        action as 'on' | 'off'
      );
      count++;
    }

    return count;
  },

  // Import devices from CSV (update existing)
  importDevices: async (csv: string): Promise<number> => {
    const lines = csv.split('\n').slice(1);
    let count = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      // Check if CSV has new columns (state, voltage, current)
      // Assuming format matches export: id,name,type,category,status,temperature,server_id,state,voltage,current
      const parts = line.split(',').map(v => v.replace(/"/g, '').trim());
      const [, name, type, category, status, temperature, serverId, state, voltage, current] =
        parts;

      const temp = temperature ? parseFloat(temperature) : undefined;
      const volt = voltage ? parseFloat(voltage) : 0;
      const curr = current ? parseFloat(current) : 0;

      await Repository.upsertNode(
        parseInt(serverId),
        name,
        type,
        category,
        status as 'on' | 'off',
        temp,
        state || 'off',
        volt,
        curr
      );
      count++;
    }

    return count;
  },

  // Import alerts from CSV
  importAlerts: async (csv: string): Promise<number> => {
    const lines = csv.split('\n').slice(1);
    let count = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      // id,device_id,node_name,level,message,created_at,acknowledged
      const [, deviceId, , level, message] = line.split(',').map(v => v.replace(/"/g, '').trim());

      await Repository.createAlert(
        parseInt(deviceId),
        level as 'info' | 'warning' | 'critical',
        message
      );
      count++;
    }

    return count;
  },

  // Get last backup date
  getLastBackupDate: async (): Promise<Date | null> => {
    try {
      const dateStr = await AsyncStorage.getItem(BACKUP_DATE_KEY);
      return dateStr ? new Date(dateStr) : null;
    } catch {
      return null;
    }
  },

  // Check if backup reminder should be shown (30+ days)
  shouldShowBackupReminder: async (): Promise<boolean> => {
    const lastBackup = await DataExportService.getLastBackupDate();
    if (!lastBackup) return true; // Never backed up

    const daysSinceBackup = Math.floor((Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceBackup >= 30;
  },

  // Snooze reminder for 7 days
  snoozeReminder: async (): Promise<void> => {
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + 7);
    await AsyncStorage.setItem('backup_reminder_snoozed_until', snoozeUntil.toISOString());
  },

  // Check if reminder is snoozed
  isReminderSnoozed: async (): Promise<boolean> => {
    try {
      const snoozeUntil = await AsyncStorage.getItem('backup_reminder_snoozed_until');
      if (!snoozeUntil) return false;
      return new Date(snoozeUntil) > new Date();
    } catch {
      return false;
    }
  },
};
