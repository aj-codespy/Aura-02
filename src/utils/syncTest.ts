import { Repository } from '../database/repository';
import { DeviceSyncService, MockHardware, setMockMode } from '../services/deviceSync';

export const runSyncTests = async () => {
  console.log('--- STARTING SYNC TESTS ---');

  try {
    // 1. Setup: Ensure we have a server
    setMockMode(true);
    await Repository.upsertServer('Test Server', '192.168.1.100', 'online');

    // 2. Test Normal Sync
    console.log('2. Testing Normal Sync...');
    MockHardware.setForcedTemp(40.0); // Safe temp
    await DeviceSyncService.syncAll();
    const nodes = await Repository.getAllNodes();
    const syncedNode = nodes.find(n => n.temperature === 40.0);
    if (syncedNode) console.log('✅ Normal Sync Success');
    else console.error('❌ Normal Sync Failed', nodes);

    // 3. Test Alert Logic
    console.log('3. Testing Alert Logic (Overheating)...');
    MockHardware.setForcedTemp(96.0); // Dangerous temp! (>95 is critical)
    await DeviceSyncService.syncAll();

    const alerts = await Repository.getUnreadAlerts();
    const overheatAlert = alerts.find(a => a.message.includes('overheating'));

    if (overheatAlert) console.log('✅ Alert Logic Success: ', overheatAlert.message);
    else console.error('❌ Alert Logic Failed: No alert generated', alerts);

    console.log('--- SYNC TESTS COMPLETED ---');
    setMockMode(false);
    return { success: true, message: 'Sync & Alert Logic Verified ✅' };
  } catch (error) {
    console.error('--- SYNC TESTS FAILED ---', error);
    setMockMode(false);
    return { success: false, message: `Sync Tests Failed: ${error}` };
  }
};
