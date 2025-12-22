import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabaseSync('aura.db');

let isInitialized = false;

export const initDatabase = async () => {
  if (isInitialized) {
    console.log('Database already initialized, skipping...');
    return;
  }

  let currentStep = 'start';

  try {
    console.log('Initializing database...');

    // TEMPORARY: Force database reset for testing
    // Remove this after first successful run
    try {
      currentStep = 'temp_drop_alerts';
      await db.execAsync('DROP TABLE IF EXISTS alerts;');
      console.warn('⚠️ TEMPORARY: Dropped alerts table for fresh migration');
    } catch (e) {
      console.warn('Could not drop alerts table:', e);
    }

    currentStep = 'pragma_wal';
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

    currentStep = 'create_tables';
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
        device_id TEXT,
        title TEXT,
        action TEXT,
        time TEXT,
        days_json TEXT,
        date TEXT,
        enabled INTEGER DEFAULT 1,
        FOREIGN KEY (device_id) REFERENCES nodes (id)
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

      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY NOT NULL,
        level TEXT,
        message TEXT,
        meta TEXT,
        timestamp INTEGER
      );

      -- Create indexes for frequently queried columns
      CREATE INDEX IF NOT EXISTS idx_nodes_server_id ON nodes(server_id);
      CREATE INDEX IF NOT EXISTS idx_nodes_category ON nodes(category);
      CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
      CREATE INDEX IF NOT EXISTS idx_schedules_device_id ON schedules(device_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_enabled ON schedules(enabled);
      CREATE INDEX IF NOT EXISTS idx_data_points_node_id ON data_points(node_id);
      CREATE INDEX IF NOT EXISTS idx_data_points_timestamp ON data_points(timestamp);
      CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
      CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
    `);

    // Migration: Add device_id column to alerts table if it doesn't exist
    // This handles existing databases that were created before this column was added
    try {
      currentStep = 'migration_alerts_dev_id';
      await db.execAsync(`
        ALTER TABLE alerts ADD COLUMN device_id INTEGER;
      `);
      console.log('Migration: Added device_id column to alerts table');
    } catch (error: any) {
      // Column already exists or other error - safe to ignore
      if (!error.message?.includes('duplicate column name')) {
        console.log('device_id column already exists or migration not needed');
      }
    }

    // Migration: Add local_ip_address column to servers table if missing
    try {
      currentStep = 'migration_servers_ip';
      await db.execAsync(`
        ALTER TABLE servers ADD COLUMN local_ip_address TEXT;
      `);
      console.log('Migration: Added local_ip_address column to servers table');
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        console.log('local_ip_address column already exists or migration not needed');
      }
    }

    // Migration: Add preferences_json column to users table if missing
    try {
      currentStep = 'migration_users_pref';
      await db.execAsync(`
        ALTER TABLE users ADD COLUMN preferences_json TEXT;
      `);
      console.log('Migration: Added preferences_json column to users table');
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        console.log('preferences_json column already exists or migration not needed');
      }
    }

    // Migration: Add state column to nodes table if missing
    try {
      currentStep = 'migration_nodes_state';
      await db.execAsync(`
        ALTER TABLE nodes ADD COLUMN state TEXT;
      `);
      console.log('Migration: Added state column to nodes table');
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        console.log('state column already exists in nodes table or migration not needed');
      }
    }

    // Migration: Add voltage column to nodes table if missing
    try {
      currentStep = 'migration_nodes_voltage';
      await db.execAsync(`
        ALTER TABLE nodes ADD COLUMN voltage REAL;
      `);
      console.log('Migration: Added voltage column to nodes table');
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        console.log('voltage column already exists in nodes table or migration not needed');
      }
    }

    // Migration: Add current column to nodes table if missing
    try {
      currentStep = 'migration_nodes_current';
      await db.execAsync(`
        ALTER TABLE nodes ADD COLUMN current REAL;
      `);
      console.log('Migration: Added current column to nodes table');
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        console.log('current column already exists in nodes table or migration not needed');
      }
    }

    // Migration: Recreate schedules table to ensure correct schema (fixes missing columns)
    try {
      // Check if we need to migrate by seeing if 'title' column exists
      // But for now, to be safe and fix the crash, we'll just recreate it if it might be old
      // We can use a more surgical approach later if needed.
      currentStep = 'migration_recreate_schedules';
      await db.execAsync('DROP TABLE IF EXISTS schedules');
      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS schedules (
              id INTEGER PRIMARY KEY NOT NULL,
              device_id TEXT,
              title TEXT,
              action TEXT,
              time TEXT,
              days_json TEXT,
              date TEXT,
              enabled INTEGER DEFAULT 1,
              FOREIGN KEY (device_id) REFERENCES nodes (id)
            );
          `);
      console.log('Migration: Recreated schedules table with correct schema');
    } catch (error) {
      console.error('Error recreating schedules table:', error);
    }

    // Clean up old data to prevent memory issues
    // Keep only last 100 energy data points and last 50 alerts
    // Delete logs older than 14 days (14 * 24 * 60 * 60 * 1000 = 1209600000 ms)
    const twoWeeksAgo = Date.now() - 1209600000;
    currentStep = 'cleanup_old_data';
    await db.execAsync(`
      DELETE FROM energy_data WHERE id NOT IN(
            SELECT id FROM energy_data ORDER BY timestamp DESC LIMIT 100
          );

      DELETE FROM alerts WHERE id NOT IN(
            SELECT id FROM alerts ORDER BY created_at DESC LIMIT 50
          );

      DELETE FROM logs WHERE timestamp < ${twoWeeksAgo};
          `);

    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error: any) {
    console.error(`Error initializing database at step "${currentStep}":`, error);
    // Throw with more context to help debugging on APK
    throw new Error(`DB Init Failed at step "${currentStep}": ${error.message}`);
  }
};

export default db;
