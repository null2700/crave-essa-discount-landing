const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// CSV export (no exceljs dependency)
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const redis = require('redis');
const connectRedis = require('connect-redis');
const speakeasy = require('speakeasy');
const { saveSubmission, getAllSubmissions, markCollected, createOwner, getOwnerByUsername, setOwner2FA } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Security middlewares
app.use(helmet());
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Session for owner login: use Redis if REDIS_URL is provided
const isProd = process.env.NODE_ENV === 'production';
let sessionStore = undefined;
if (process.env.REDIS_URL) {
  const client = redis.createClient({ url: process.env.REDIS_URL });
  client.connect().catch(err => console.error('Redis connect error', err));
  const RedisStore = connectRedis(session);
  sessionStore = new RedisStore({ client });
}
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Serve frontend static files from project root so backend is self-contained
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Owner password hash: prefer OWNER_PASSWORD_HASH env, else hash OWNER_PASSWORD on startup
// Owner auth handling: prefer owners table; fallback to OWNER_PASSWORD env for compatibility
let OWNER_HASH = process.env.OWNER_PASSWORD_HASH || null;
if (!OWNER_HASH && process.env.OWNER_PASSWORD) {
  OWNER_HASH = bcrypt.hashSync(process.env.OWNER_PASSWORD, 10);
  console.log('Derived OWNER_HASH from OWNER_PASSWORD env');
}

// ownerAuth accepts session-based login or legacy Basic auth
function ownerAuth(req, res, next) {
  if (req.session && req.session.isOwner) return next();
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Basic ') && OWNER_HASH) {
    const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const parts = decoded.split(':');
    const pass = parts.length > 1 ? parts[1] : '';
    if (bcrypt.compareSync(pass, OWNER_HASH)) return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Validation schemas
const submissionSchema = Joi.object({
  fullName: Joi.string().max(200).allow('', null),
  whatsappNumber: Joi.string().max(32).allow('', null),
  email: Joi.string().email().allow('', null),
  cakeSize: Joi.string().allow('', null),
  flavor: Joi.string().allow('', null),
  occasion: Joi.string().allow('', null),
  neededBy: Joi.string().allow('', null),
  deliveryArea: Joi.string().allow('', null),
  discountCode: Joi.string().allow('', null),
  createdAt: Joi.string().allow('', null)
});

app.post('/submit', async (req, res) => {
  try {
    const payload = req.body || {};
    const { error } = submissionSchema.validate(payload);
    if (error) return res.status(400).json({ ok: false, error: error.message });
    const result = await saveSubmission(payload);
    res.json({ ok: true, id: result.id });
  } catch (err) {
    console.error('Save error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/export', async (req, res) => {
  try {
    const rows = await getAllSubmissions();
    if (!rows || rows.length === 0) {
      res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send('');
    }
    const headers = Object.keys(rows[0]);
    const escapeCell = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      // escape double quotes
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const csvLines = [];
    csvLines.push(headers.join(','));
    for (const r of rows) {
      const cols = headers.map(h => escapeCell(r[h]));
      csvLines.push(cols.join(','));
    }
    const csv = csvLines.join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    console.error('Export error', err);
    res.status(500).send('Export error');
  }
});
// Protected API for owner to fetch orders
app.get('/api/orders', ownerAuth, async (req, res) => {
  try {
    const rows = await getAllSubmissions();
    res.json({ ok: true, rows });
  } catch (err) {
    console.error('Orders fetch error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Mark order collected/uncollected
app.post('/api/orders/:id/collect', ownerAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const collected = !!req.body.collected;
    if (Number.isNaN(id)) return res.status(400).json({ ok: false, error: 'invalid id' });
    const result = await markCollected(id, collected);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Mark collected error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Login route for owner (session-based)
// Owner setup route: create first owner (protected with SETUP_TOKEN)
app.post('/owner/setup', async (req, res) => {
  const token = req.headers['x-setup-token'] || req.body.setupToken;
  if (!process.env.SETUP_TOKEN || token !== process.env.SETUP_TOKEN) return res.status(403).json({ ok: false, error: 'forbidden' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'missing' });
  const pwHash = bcrypt.hashSync(password, 10);
  try {
    const result = await createOwner({ username, passwordHash: pwHash });
    return res.json({ ok: true, id: result.id });
  } catch (err) {
    console.error('owner setup error', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// Login route for owner (supports per-owner accounts with optional TOTP)
app.post('/owner/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'missing' });
  try {
    const owner = await getOwnerByUsername(username);
    if (owner) {
      if (!bcrypt.compareSync(password, owner.passwordHash)) return res.status(401).json({ ok: false, error: 'invalid' });
      if (owner.totpEnabled) {
        // mark temporary auth in session and request TOTP
        req.session.tmpUser = username;
        return res.json({ ok: true, needs2fa: true });
      }
      req.session.isOwner = true;
      req.session.owner = { username };
      return res.json({ ok: true });
    }
    // fallback to single OWNER_HASH env
    if (OWNER_HASH && bcrypt.compareSync(password, OWNER_HASH)) {
      req.session.isOwner = true;
      req.session.owner = { username: 'env-owner' };
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'invalid' });
  } catch (err) {
    console.error('owner login err', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Verify 2FA code and complete login
app.post('/owner/login-2fa', async (req, res) => {
  const code = (req.body && req.body.code) || '';
  const tmpUser = req.session && req.session.tmpUser;
  if (!tmpUser) return res.status(400).json({ ok: false, error: 'no-temp' });
  try {
    const owner = await getOwnerByUsername(tmpUser);
    if (!owner || !owner.totpEnabled || !owner.totpSecret) return res.status(400).json({ ok: false, error: 'no-2fa' });
    const verified = speakeasy.totp.verify({ secret: owner.totpSecret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(401).json({ ok: false, error: 'invalid' });
    req.session.isOwner = true;
    req.session.owner = { username: owner.username };
    delete req.session.tmpUser;
    return res.json({ ok: true });
  } catch (err) {
    console.error('2fa verify err', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/owner/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Craveessa backend running on http://localhost:${PORT}`);
});
