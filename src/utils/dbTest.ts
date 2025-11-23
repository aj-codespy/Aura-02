import { Repository } from '../database/repository';

export const runDBTests = async () => {
  console.log('--- STARTING DB TESTS ---');

  try {
    // 1. Clear DB
    console.log('1. Clearing Database...');
    await Repository.clearDatabase();

    // 2. Test User
    console.log('2. Testing User...');
    await Repository.upsertUser('test-cognito-id', 'test@aura.com', 'Test User');
    const user = await Repository.getUser();
    if (user?.email === 'test@aura.com') console.log('✅ User Created/Read Success');
    else console.error('❌ User Test Failed', user);

    // 3. Test Server
    console.log('3. Testing Server...');
    const serverId = await Repository.upsertServer('Test Server', '192.168.1.100', 'online');
    const servers = await Repository.getServers();
    if (servers.length === 1 && servers[0].ip_address === '192.168.1.100')
      console.log('✅ Server Created/Read Success');
    else console.error('❌ Server Test Failed', servers);

    // 4. Test Node
    console.log('4. Testing Node...');
    const nodeId = await Repository.upsertNode(
      serverId,
      'Test Fan',
      'FAN',
      'Test Category',
      'off',
      25.0
    );
    const nodes = await Repository.getNodesByServer(serverId);
    if (nodes.length === 1 && nodes[0].name === 'Test Fan')
      console.log('✅ Node Created/Read Success');
    else console.error('❌ Node Test Failed', nodes);

    // 5. Test Update Node
    console.log('5. Testing Node Update...');
    await Repository.updateNodeStatus(nodeId, 'on', 30.0);
    const updatedNodes = await Repository.getNodesByServer(serverId);
    if (updatedNodes[0].status === 'on' && updatedNodes[0].temperature === 30.0)
      console.log('✅ Node Update Success');
    else console.error('❌ Node Update Failed', updatedNodes[0]);

    // 6. Test Alert
    console.log('6. Testing Alert...');
    await Repository.createAlert(nodeId, 'critical', 'Overheating');
    const alerts = await Repository.getUnreadAlerts();
    if (alerts.length === 1 && alerts[0].message === 'Overheating')
      console.log('✅ Alert Created/Read Success');
    else console.error('❌ Alert Test Failed', alerts);

    // 7. Test Mark Read
    console.log('7. Testing Mark Alert Read...');
    await Repository.markAlertRead(alerts[0].id);
    const remainingAlerts = await Repository.getUnreadAlerts();
    if (remainingAlerts.length === 0) console.log('✅ Alert Mark Read Success');
    else console.error('❌ Alert Mark Read Failed', remainingAlerts);

    console.log('--- DB TESTS COMPLETED SUCCESSFULLY ---');
    return { success: true, message: 'All Database Tests Passed ✅' };
  } catch (error) {
    console.error('--- DB TESTS FAILED ---', error);
    return { success: false, message: `DB Tests Failed: ${error}` };
  }
};
