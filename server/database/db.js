const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('SQLite Database connected');
    
    // Performance and Reliability settings for production
    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      
      // Enable Write-Ahead Logging (WAL) for better concurrency
      db.run('PRAGMA journal_mode = WAL');
      
      // Synchronous mode set to NORMAL for better performance while maintaining safety in WAL mode
      db.run('PRAGMA synchronous = NORMAL');
      
      // Set a busy timeout to avoid "database is locked" errors during concurrent writes
      db.run('PRAGMA busy_timeout = 5000');
    });

    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  const tableQueries = [
    // Super Admin table
    `CREATE TABLE IF NOT EXISTS super_admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Admin table
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Customer table
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT DEFAULT '',
      admin_id INTEGER NOT NULL,
      visit_count INTEGER DEFAULT 1,
      last_visited DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      UNIQUE(phone_number, admin_id)
    )`
  ];

  const indexQueries = [
    `CREATE INDEX IF NOT EXISTS idx_customers_admin_id ON customers(admin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_customers_phone_admin ON customers(phone_number, admin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone_number)`,
    `CREATE INDEX IF NOT EXISTS idx_super_admins_username ON super_admins(username)`
  ];

  // First create tables sequentially
  let tableIndex = 0;
  function createNextTable() {
    if (tableIndex >= tableQueries.length) {
      // All tables created, now create indexes
      let indexIndex = 0;
      function createNextIndex() {
        if (indexIndex >= indexQueries.length) {
          console.log('Database initialized successfully');
          return;
        }
        db.run(indexQueries[indexIndex], (err) => {
          if (err) {
            console.error('Error creating index:', err);
          }
          indexIndex++;
          createNextIndex();
        });
      }
      createNextIndex();
      return;
    }
    db.run(tableQueries[tableIndex], (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
      tableIndex++;
      createNextTable();
    });
  }
  createNextTable();
}

// Promisify database methods
db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;
