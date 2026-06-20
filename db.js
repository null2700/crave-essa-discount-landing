const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'submissions.db');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      whatsappNumber TEXT,
      email TEXT,
      cakeSize TEXT,
      flavor TEXT,
      occasion TEXT,
      neededBy TEXT,
      deliveryArea TEXT,
      discountCode TEXT,
      createdAt TEXT,
      collected INTEGER DEFAULT 0
    )
  `);

  // Ensure 'collected' column exists for older DBs (no-op if already present)
  db.run("ALTER TABLE submissions ADD COLUMN collected INTEGER DEFAULT 0", (err) => {
    // SQLite will error if column exists; ignore that error
    if (err) {
      // column likely already exists - ignore
    }
  });
});

// Owners table for per-owner accounts
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT,
      totpSecret TEXT,
      totpEnabled INTEGER DEFAULT 0,
      createdAt TEXT
    )
  `);
});

function createOwner({ username, passwordHash, totpSecret = null, totpEnabled = 0 }) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO owners (username, passwordHash, totpSecret, totpEnabled, createdAt) VALUES (?,?,?,?,?)`);
    stmt.run(username, passwordHash, totpSecret, totpEnabled ? 1 : 0, new Date().toISOString(), function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

function getOwnerByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM owners WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function setOwner2FA(username, secret, enabled) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE owners SET totpSecret = ?, totpEnabled = ? WHERE username = ?', [secret, enabled ? 1 : 0, username], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}



function saveSubmission(obj) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO submissions
      (fullName, whatsappNumber, email, cakeSize, flavor, occasion, neededBy, deliveryArea, discountCode, createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?)`);
    stmt.run(
      obj.fullName || '',
      obj.whatsappNumber || '',
      obj.email || '',
      obj.cakeSize || '',
      obj.flavor || '',
      obj.occasion || '',
      obj.neededBy || '',
      obj.deliveryArea || '',
      obj.discountCode || '',
      obj.createdAt || new Date().toISOString(),
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
    stmt.finalize();
  });
}

function getAllSubmissions() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM submissions ORDER BY id DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function markCollected(id, collected) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE submissions SET collected = ? WHERE id = ?', [collected ? 1 : 0, id], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

module.exports = { saveSubmission, getAllSubmissions, markCollected, createOwner, getOwnerByUsername, setOwner2FA };
