import sampleData from '../../assets/mock/sample-provision.json';
import { clearDatabase, insertServer, insertNode } from '../database/queries';

export const seedDatabase = async () => {
  console.log("🌱 Starting Database Seeding...");

  try {
    // 1. Wipe old data (Clean slate)
    await clearDatabase();

    // 2. Loop through the JSON and insert
    for (const server of sampleData.servers) {
      // Insert Server
      const serverId = await insertServer(server.name, server.ip, 'online');
      console.log(`   + Added Server: ${server.name}`);

      // Insert Nodes for this Server
      for (const node of server.nodes) {
        await insertNode(serverId, node.name, node.type);
        console.log(`     - Added Node: ${node.name}`);
      }
    }

    console.log("✅ Seeding Complete!");
    return true;
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    return false;
  }
};