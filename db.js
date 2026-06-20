const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'craveessa';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'submissions.db');

let dbMode = MONGODB_URI ? 'mongo' : 'sqlite';
let mongoClient;
let mongoDb;
let sqliteDb;
let sqlite3;

const formatSubmissionDoc = (doc) => ({
  id: doc._id.toHexString(),
  fullName: doc.fullName || '',
  whatsappNumber: doc.whatsappNumber || '',
  email: doc.email || '',
  cakeSize: doc.cakeSize || '',
  flavor: doc.flavor || '',
  occasion: doc.occasion || '',
  neededBy: doc.neededBy || '',
  deliveryArea: doc.deliveryArea || '',
  discountCode: doc.discountCode || '',
  createdAt: doc.createdAt || '',
  collected: doc.collected ? 1 : 0
});

const formatOwnerDoc = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id.toHexString(),
    username: doc.username,
    passwordHash: doc.passwordHash,
    totpSecret: doc.totpSecret,
    totpEnabled: !!doc.totpEnabled,
    createdAt: doc.createdAt || ''
  };
};

const formatProductDoc = (doc) => ({
  id: doc._id.toHexString(),
  category: doc.category || 'Uncategorized',
  name: doc.name || '',
  description: doc.description || '',
  imageUrl: doc.imageUrl || '',
  createdAt: doc.createdAt || ''
});

const parseMongoId = (id) => {
  try {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  } catch (err) {
    return null;
  }
};

const initSqlite = () => {
  if (!sqlite3) {
    sqlite3 = require('sqlite3').verbose();
  }
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);

      sqliteDb.serialize(() => {
        sqliteDb.run(`
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

        sqliteDb.run("ALTER TABLE submissions ADD COLUMN collected INTEGER DEFAULT 0", (alterErr) => {
          if (alterErr) {
            // Ignore error if column already exists.
          }
        });

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS owners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            passwordHash TEXT,
            totpSecret TEXT,
            totpEnabled INTEGER DEFAULT 0,
            createdAt TEXT
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            name TEXT,
            description TEXT,
            imageUrl TEXT,
            createdAt TEXT
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS device_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenHash TEXT UNIQUE,
            userAgent TEXT,
            createdAt TEXT
          )
        `, (productsErr) => {
          if (productsErr) return reject(productsErr);
          resolve();
        });
      });
    });
  });
};

const initMongo = async () => {
  mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGODB_DBNAME);

  await mongoDb.collection('owners').createIndex({ username: 1 }, { unique: true });
};

const dbReady = (async () => {
  if (dbMode === 'mongo') {
    console.log('Using MongoDB database');
    await initMongo();
  } else {
    console.log('Using SQLite database');
    await initSqlite();
  }
})();

async function createOwner({ username, passwordHash, totpSecret = null, totpEnabled = 0 }) {
  await dbReady;
  if (dbMode === 'mongo') {
    const result = await mongoDb.collection('owners').insertOne({
      username,
      passwordHash,
      totpSecret,
      totpEnabled: totpEnabled ? 1 : 0,
      createdAt: new Date().toISOString()
    });
    return { id: result.insertedId.toHexString() };
  }

  return new Promise((resolve, reject) => {
    const stmt = sqliteDb.prepare(`INSERT INTO owners (username, passwordHash, totpSecret, totpEnabled, createdAt) VALUES (?,?,?,?,?)`);
    stmt.run(username, passwordHash, totpSecret, totpEnabled ? 1 : 0, new Date().toISOString(), function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

async function getOwnerByUsername(username) {
  await dbReady;
  if (dbMode === 'mongo') {
    const owner = await mongoDb.collection('owners').findOne({ username });
    return formatOwnerDoc(owner);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.get('SELECT * FROM owners WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function setOwner2FA(username, secret, enabled) {
  await dbReady;
  if (dbMode === 'mongo') {
    const result = await mongoDb.collection('owners').updateOne(
      { username },
      { $set: { totpSecret: secret, totpEnabled: enabled ? 1 : 0 } }
    );
    return { changes: result.modifiedCount };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run('UPDATE owners SET totpSecret = ?, totpEnabled = ? WHERE username = ?', [secret, enabled ? 1 : 0, username], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

async function getOwnerCount() {
  await dbReady;
  if (dbMode === 'mongo') {
    return await mongoDb.collection('owners').countDocuments();
  }
  return new Promise((resolve, reject) => {
    sqliteDb.get('SELECT COUNT(*) as count FROM owners', (err, row) => {
      if (err) return reject(err);
      resolve((row && row.count) || 0);
    });
  });
}

async function saveSubmission(obj) {
  await dbReady;
  if (dbMode === 'mongo') {
    const data = {
      fullName: obj.fullName || '',
      whatsappNumber: obj.whatsappNumber || '',
      email: obj.email || '',
      cakeSize: obj.cakeSize || '',
      flavor: obj.flavor || '',
      occasion: obj.occasion || '',
      neededBy: obj.neededBy || '',
      deliveryArea: obj.deliveryArea || '',
      discountCode: obj.discountCode || '',
      createdAt: obj.createdAt || new Date().toISOString(),
      collected: obj.collected ? 1 : 0
    };
    const result = await mongoDb.collection('submissions').insertOne(data);
    return { id: result.insertedId.toHexString() };
  }

  return new Promise((resolve, reject) => {
    const stmt = sqliteDb.prepare(`INSERT INTO submissions
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

async function getAllSubmissions() {
  await dbReady;
  if (dbMode === 'mongo') {
    const rows = await mongoDb.collection('submissions').find().sort({ _id: -1 }).toArray();
    return rows.map(formatSubmissionDoc);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM submissions ORDER BY id DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function markCollected(id, collected) {
  await dbReady;
  if (dbMode === 'mongo') {
    const objectId = parseMongoId(id);
    if (!objectId) return { changes: 0 };
    const result = await mongoDb.collection('submissions').updateOne({ _id: objectId }, { $set: { collected: collected ? 1 : 0 } });
    return { changes: result.modifiedCount };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run('UPDATE submissions SET collected = ? WHERE id = ?', [collected ? 1 : 0, id], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

async function saveProduct(obj) {
  await dbReady;
  if (dbMode === 'mongo') {
    const data = {
      category: obj.category || 'Uncategorized',
      name: obj.name || 'Unnamed',
      description: obj.description || '',
      imageUrl: obj.imageUrl || '',
      createdAt: obj.createdAt || new Date().toISOString()
    };
    const result = await mongoDb.collection('products').insertOne(data);
    return { id: result.insertedId.toHexString() };
  }

  return new Promise((resolve, reject) => {
    const stmt = sqliteDb.prepare(`INSERT INTO products (category, name, description, imageUrl, createdAt) VALUES (?,?,?,?,?)`);
    stmt.run(
      obj.category || 'Uncategorized',
      obj.name || 'Unnamed',
      obj.description || '',
      obj.imageUrl || '',
      obj.createdAt || new Date().toISOString(),
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
    stmt.finalize();
  });
}

async function getProducts() {
  await dbReady;
  if (dbMode === 'mongo') {
    const rows = await mongoDb.collection('products').find().sort({ _id: -1 }).toArray();
    return rows.map(formatProductDoc);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM products ORDER BY id DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function deleteProduct(id) {
  await dbReady;
  if (dbMode === 'mongo') {
    const objectId = parseMongoId(id);
    if (!objectId) return { changes: 0 };
    const result = await mongoDb.collection('products').deleteOne({ _id: objectId });
    return { changes: result.deletedCount };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run('DELETE FROM products WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

async function saveDeviceToken({ tokenHash, userAgent, createdAt }) {
  await dbReady;
  if (dbMode === 'mongo') {
    await mongoDb.collection('device_tokens').updateOne(
      { tokenHash },
      { $set: { tokenHash, userAgent, createdAt } },
      { upsert: true }
    );
    return { tokenHash };
  }

  return new Promise((resolve, reject) => {
    const stmt = sqliteDb.prepare(`INSERT OR REPLACE INTO device_tokens (tokenHash, userAgent, createdAt) VALUES (?,?,?)`);
    stmt.run(tokenHash, userAgent || '', createdAt || new Date().toISOString(), function (err) {
      if (err) return reject(err);
      resolve({ tokenHash });
    });
    stmt.finalize();
  });
}

async function getDeviceByTokenHash(tokenHash) {
  await dbReady;
  if (dbMode === 'mongo') {
    return await mongoDb.collection('device_tokens').findOne({ tokenHash });
  }

  return new Promise((resolve, reject) => {
    sqliteDb.get('SELECT * FROM device_tokens WHERE tokenHash = ? LIMIT 1', [tokenHash], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function deleteDeviceToken(tokenHash) {
  await dbReady;
  if (dbMode === 'mongo') {
    const result = await mongoDb.collection('device_tokens').deleteOne({ tokenHash });
    return { deletedCount: result.deletedCount };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run('DELETE FROM device_tokens WHERE tokenHash = ?', [tokenHash], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

async function pruneOldDeviceTokens(maxDevices) {
  await dbReady;
  if (dbMode === 'mongo') {
    const count = await mongoDb.collection('device_tokens').countDocuments();
    if (count <= maxDevices) return { pruned: 0 };
    const toRemove = count - maxDevices;
    const oldTokens = await mongoDb.collection('device_tokens')
      .find()
      .sort({ createdAt: 1 })
      .limit(toRemove)
      .toArray();
    const hashes = oldTokens.map(token => token.tokenHash);
    const result = await mongoDb.collection('device_tokens').deleteMany({ tokenHash: { $in: hashes } });
    return { pruned: result.deletedCount };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.get('SELECT COUNT(*) as count FROM device_tokens', (err, row) => {
      if (err) return reject(err);
      const count = (row && row.count) || 0;
      if (count <= maxDevices) return resolve({ pruned: 0 });
      const removeCount = count - maxDevices;
      sqliteDb.run(
        `DELETE FROM device_tokens WHERE id IN (
          SELECT id FROM device_tokens ORDER BY id ASC LIMIT ?
        )`,
        [removeCount],
        function (deleteErr) {
          if (deleteErr) return reject(deleteErr);
          resolve({ pruned: this.changes });
        }
      );
    });
  });
}

async function getDeviceTokenCount() {
  await dbReady;
  if (dbMode === 'mongo') {
    return await mongoDb.collection('device_tokens').countDocuments();
  }
  return new Promise((resolve, reject) => {
    sqliteDb.get('SELECT COUNT(*) as count FROM device_tokens', (err, row) => {
      if (err) return reject(err);
      resolve((row && row.count) || 0);
    });
  });
}

module.exports = {
  saveSubmission,
  getAllSubmissions,
  markCollected,
  createOwner,
  getOwnerByUsername,
  setOwner2FA,
  getOwnerCount,
  saveProduct,
  getProducts,
  deleteProduct,
  saveDeviceToken,
  getDeviceByTokenHash,
  deleteDeviceToken,
  pruneOldDeviceTokens,
  getDeviceTokenCount
};
