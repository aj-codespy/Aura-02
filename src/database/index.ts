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
      
      -- Drop all tables to clear memory
      DROP TABLE IF EXISTS alerts;
      DROP TABLE IF EXISTS energy_data;
      DROP TABLE IF EXISTS schedules;
      DROP TABLE IF EXISTS nodes;
      DROP TABLE IF EXISTS servers;
      DROP TABLE IF EXISTS users;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL,
        cognito_id TEXT UNIQUE,
        email TEXT,
        full_name TEXT
      );

      CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT,
        ip_address TEXT,
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
        temperature REAL,
        FOREIGN KEY (server_id) REFERENCES servers (id)
      );

      CREATE TABLE IF NOT EXISTS energy_data (
        id INTEGER PRIMARY KEY NOT NULL,
        node_id INTEGER,
        voltage REAL,
        current REAL,
        power REAL,
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
        node_id INTEGER,
        severity TEXT,
        message TEXT,
        created_at INTEGER,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (node_id) REFERENCES nodes (id)
      );
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
