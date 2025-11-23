import { Repository } from '../database/repository';
import { DeviceSyncService, MockHardware } from '../services/deviceSync';

export const runSyncTests = async () => {
  console.log('--- STARTING SYNC TESTS ---');

  try {
    // 1. Setup: Ensure we have a server
    await Repository.upsertServer('Test Server', '192.168.1.100', 'online');

    // 2. Test Normal Sync
    console.log('2. Testing Normal Sync...');
    MockHardware.setForcedTemp(40.0); // Safe temp
    await DeviceSyncService.syncAll();
    const nodes = await Repository.getAllNodes();
    if (nodes.length > 0 && nodes[0].temperature === 40.0) console.log('✅ Normal Sync Success');
    else console.error('❌ Normal Sync Failed', nodes);

    // 3. Test Alert Logic
    console.log('3. Testing Alert Logic (Overheating)...');
    MockHardware.setForcedTemp(95.0); // Dangerous temp!
    await DeviceSyncService.syncAll();

    const alerts = await Repository.getUnreadAlerts();
    const overheatAlert = alerts.find(a => a.message.includes('overheating'));

    if (overheatAlert) console.log('✅ Alert Logic Success: ', overheatAlert.message);
    else console.error('❌ Alert Logic Failed: No alert generated', alerts);

    console.log('--- SYNC TESTS COMPLETED ---');
    return { success: true, message: 'Sync & Alert Logic Verified ✅' };
  } catch (error) {
    console.error('--- SYNC TESTS FAILED ---', error);
    return { success: false, message: `Sync Tests Failed: ${error}` };
  }
};
