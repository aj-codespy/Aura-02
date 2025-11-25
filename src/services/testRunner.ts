import { Repository } from '../database/repository';
import { HardwareService } from './hardware';
import { Logger } from './logger';
import { NotificationService } from './notifications';

export interface TestResult {
  module: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  message?: string;
  duration?: number;
}

export const TestRunner = {
  // 1. Database Test
  testDatabase: async (): Promise<TestResult> => {
    const start = Date.now();
    try {
      // Create
      const testId = await Repository.createSchedule(
        'test-device',
        'Test Schedule',
        'on',
        '12:00',
        JSON.stringify(['Mon']),
        null,
        1
      );

      // Read
      const schedules = await Repository.getAllSchedules();
      const found = schedules.find(s => s.id === testId);
      if (!found) throw new Error('Created schedule not found');

      // Update
      await Repository.updateSchedule(testId, 'Updated Test', 'off', '13:00', null, null, 0);

      // Delete
      await Repository.deleteSchedule(testId);

      return {
        module: 'Database',
        name: 'CRUD Operations',
        status: 'passed',
        duration: Date.now() - start,
        message: 'Create, Read, Update, Delete successful',
      };
    } catch (error: any) {
      return {
        module: 'Database',
        name: 'CRUD Operations',
        status: 'failed',
        message: error.message,
      };
    }
  },

  // 2. Notifications Test
  testNotifications: async (): Promise<TestResult> => {
    const start = Date.now();
    try {
      const hasPermission = await NotificationService.hasPermission();
      if (!hasPermission) {
        const granted = await NotificationService.requestPermissions();
        if (!granted) throw new Error('Permissions denied');
      }

      await NotificationService.sendAlertNotification(
        'Test Notification',
        'This is a diagnostic test message.'
      );

      return {
        module: 'Notifications',
        name: 'Send Local Alert',
        status: 'passed',
        duration: Date.now() - start,
        message: 'Notification sent (check status bar)',
      };
    } catch (error: any) {
      return {
        module: 'Notifications',
        name: 'Send Local Alert',
        status: 'failed',
        message: error.message,
      };
    }
  },

  // 3. Device Logic Test (Mock)
  testDeviceLogic: async (): Promise<TestResult> => {
    const start = Date.now();
    try {
      // Test pairing logic (mock)
      const pairResult = await HardwareService.pairDevice(
        JSON.stringify({ id: 'test-node', type: 'sensor' })
      );
      if (!pairResult.success) throw new Error('Mock pairing failed');

      return {
        module: 'Devices',
        name: 'Pairing Logic',
        status: 'passed',
        duration: Date.now() - start,
        message: 'Mock pairing handshake successful',
      };
    } catch (error: any) {
      return {
        module: 'Devices',
        name: 'Pairing Logic',
        status: 'failed',
        message: error.message,
      };
    }
  },

  // 4. Analytics Data Test
  testAnalytics: async (): Promise<TestResult> => {
    const start = Date.now();
    try {
      // Check if we can fetch nodes for analytics
      const nodes = await Repository.getAllNodes();

      // Simulate data point aggregation (logic check only)
      const totalOnline = nodes.filter(n => n.status === 'on').length;

      return {
        module: 'Analytics',
        name: 'Data Aggregation',
        status: 'passed',
        duration: Date.now() - start,
        message: `Analyzed ${nodes.length} nodes (${totalOnline} online)`,
      };
    } catch (error: any) {
      return {
        module: 'Analytics',
        name: 'Data Aggregation',
        status: 'failed',
        message: error.message,
      };
    }
  },

  // 5. Logger Test
  testLogging: async (): Promise<TestResult> => {
    const start = Date.now();
    try {
      await Logger.info('Diagnostic Test Log');
      const logs = await Logger.getLogs(1);
      if (logs.length === 0) throw new Error('Log not saved to DB');

      return {
        module: 'System',
        name: 'Logging Service',
        status: 'passed',
        duration: Date.now() - start,
        message: 'Log written and retrieved from DB',
      };
    } catch (error: any) {
      return {
        module: 'System',
        name: 'Logging Service',
        status: 'failed',
        message: error.message,
      };
    }
  },
};
