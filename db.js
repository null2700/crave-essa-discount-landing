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
      createdAt TEXT
    )
  `);
});

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

module.exports = { saveSubmission, getAllSubmissions };
