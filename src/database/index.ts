import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabaseSync('aura.db');

let isInitialized = false;

export const initDatabase = async () => {
  if (isInitialized) {
    console.log('Database already initialized, skipping...');
    return;
  }

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
    `);

    // Initialize database schema
    // PRODUCTION: DROP TABLE statements commented out to preserve user data
    // For development, uncomment these lines to reset database
    /*
    await db.execAsync(`
      -- Drop all tables to clear memory
      DROP TABLE IF EXISTS alerts;
      DROP TABLE IF EXISTS energy_data;
      DROP TABLE IF EXISTS schedules;
      DROP TABLE IF EXISTS nodes;
      DROP TABLE IF EXISTS servers;
      DROP TABLE IF EXISTS users;
    `);
    */

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL,
        cognito_id TEXT UNIQUE,
        email TEXT,
        full_name TEXT,
        preferences_json TEXT
      );

      CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT,
        local_ip_address TEXT,
        status TEXT,
        last_seen INTEGER
      );

      CREATE TABLE IF NOT EXISTS nodes (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id INTEGER,
        name TEXT,
        type TEXT,
        category TEXT,
        status TEXT,
        state TEXT,
        temperature REAL,
        voltage REAL,
        current REAL,
        FOREIGN KEY (server_id) REFERENCES servers (id)
      );

      CREATE TABLE IF NOT EXISTS data_points (
        id INTEGER PRIMARY KEY NOT NULL,
        node_id INTEGER,
        voltage REAL,
        current REAL,
        power_consumption REAL,
        timestamp INTEGER,
        FOREIGN KEY (node_id) REFERENCES nodes (id)
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY NOT NULL,
        node_id INTEGER,
        action TEXT,
        time TEXT,
        days TEXT,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (node_id) REFERENCES nodes (id)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY NOT NULL,
        device_id INTEGER,
        level TEXT,
        message TEXT,
        created_at INTEGER,
        acknowledged INTEGER DEFAULT 0,
        FOREIGN KEY (device_id) REFERENCES nodes (id)
      );

      -- Create indexes for frequently queried columns
      CREATE INDEX IF NOT EXISTS idx_nodes_server_id ON nodes(server_id);
      CREATE INDEX IF NOT EXISTS idx_nodes_category ON nodes(category);
      CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
      CREATE INDEX IF NOT EXISTS idx_schedules_node_id ON schedules(node_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON schedules(is_active);
      CREATE INDEX IF NOT EXISTS idx_data_points_node_id ON data_points(node_id);
      CREATE INDEX IF NOT EXISTS idx_data_points_timestamp ON data_points(timestamp);
      CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
      CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
    `);

    // Clean up old data to prevent memory issues
    // Keep only last 100 energy data points and last 50 alerts
    await db.execAsync(`
      DELETE FROM energy_data WHERE id NOT IN (
        SELECT id FROM energy_data ORDER BY timestamp DESC LIMIT 100
      );
      
      DELETE FROM alerts WHERE id NOT IN (
        SELECT id FROM alerts ORDER BY created_at DESC LIMIT 50
      );
    `);

    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default db;
