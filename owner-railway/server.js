const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const multer = require('multer');
// CSV export (no exceljs dependency)
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const redis = require('redis');
const connectRedis = require('connect-redis');
const speakeasy = require('speakeasy');
const { saveSubmission, getAllSubmissions, deleteSubmission, markCollected, createOwner, getOwnerByUsername, setOwner2FA, getOwnerCount, saveProduct, getProducts, deleteProduct, saveDeviceToken, getDeviceByTokenHash, deleteDeviceToken, pruneOldDeviceTokens, getDeviceTokenCount } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS configuration for cross-deployment (Vercel client → Railway backend)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from:
    // - localhost (development)
    // - any vercel deployment
    // - custom domains specified in environment
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Add Vercel deployments and custom domains from env
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    // Allow *.vercel.app domains, Railway domains, localhost, and configured origins
    if (origin && (origin.includes('vercel.app') || origin.includes('railway.app') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (!origin) {
      // Allow requests with no origin (like mobile apps or Postman)
      callback(null, true);
    } else {
      // Log denied origin for debugging
      console.warn(`CORS request blocked from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadDir));

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));
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

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    acc[name] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
};
app.get('/', (req, res) => res.redirect('/owner'));
// Serve frontend static files only from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// Owner login page route: keep the raw owner file out of public static.
app.get('/owner', (req, res) => {
  res.sendFile(path.join(__dirname, 'owner.html'));
});

// Serve owner client script explicitly from the protected folder.
app.get('/owner.js', (req, res) => {
  res.type('application/javascript').sendFile(path.join(__dirname, 'owner.js'));
});

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const buildGeminiDesignPrompt = (meta) => {
  return `Create three distinct luxury cake design concepts for a premium cake studio.
Use these details:
- Weight: ${meta.weight || '250g'}
- Tiers: ${meta.tier || '1 Tier'}
- Theme: ${meta.theme || 'Elegant celebration'}
- Flavor: ${meta.flavor || 'Chocolate'}
- Occasion: ${meta.occasion || 'Birthday'}
- Colors: ${meta.color || 'soft blush and cream'}
- Special requests: ${meta.special || 'No special requests'}

- Keep each "description" under 60 words and each "prompt" under 50 words.

For each concept, produce an object with keys:
- title: a short name for the concept
- description: a concise, vivid design description
- prompt: one strong image prompt in quotes suitable for photorealistic cake generation

Return only valid JSON with a top-level "concepts" array containing three objects.`;
};

const fetchGeminiResponse = (apiKey, prompt, model, wantImage = false) => {
  return new Promise((resolve, reject) => {
    const resolvedModel = model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(resolvedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`);

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: wantImage
        ? { responseModalities: ['TEXT', 'IMAGE'] }
        : { temperature: 0.8, maxOutputTokens: 4096 }
    };

    const body = JSON.stringify(payload);
    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let responseText = '';
      res.on('data', (chunk) => { responseText += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseText);
          if (res.statusCode >= 400) {
            const error = new Error(parsed.error?.message || `Gemini error ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.body = parsed;
            return reject(error);
          }
          resolve(parsed);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const tryParseJsonLoose = (text) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    let candidate = jsonMatch[0];
    candidate = candidate.replace(/,\s*(?=[}\]])/g, '');
    candidate = candidate.replace(/'/g, '"');
    candidate = candidate.replace(/([,\{\s])(\w+)\s*:/g, '$1"$2":');
    try {
      return JSON.parse(candidate);
    } catch (e2) {
      return null;
    }
  }
};

function extractJson(text) {
  text = (text || '').trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found');
  return JSON.parse(match[0]);
}

const fetchHuggingFaceImage = (prompt) => {
  return new Promise((resolve, reject) => {
    const hfKey = process.env.HF_API_KEY;
    if (!hfKey) {
      return reject(new Error('HF_API_KEY is not configured on the server.'));
    }

    const payload = JSON.stringify({ inputs: prompt });
    const options = {
      method: 'POST',
      hostname: 'router.huggingface.co',
      path: '/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      headers: {
        'Authorization': `Bearer ${hfKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            const errJson = JSON.parse(buffer.toString('utf8'));
            const error = new Error(errJson.error || `HF error ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.body = errJson;
            return reject(error);
          } catch (e) {
            return reject(new Error(`HF error ${res.statusCode}: ${buffer.toString('utf8')}`));
          }
        }
        if (res.statusCode >= 400) {
          return reject(new Error(`HF error ${res.statusCode}`));
        }
        resolve(`data:image/png;base64,${buffer.toString('base64')}`);
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/gemini-design', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const meta = req.body || {};
    const textModel = 'gemini-2.5-flash';
    const imageModel = 'gemini-2.5-flash-image';

    const prompt = buildGeminiDesignPrompt(meta);
    const geminiResponse = await fetchGeminiResponse(apiKey, prompt, textModel, false);

    const candidate = Array.isArray(geminiResponse.candidates) ? geminiResponse.candidates[0] : null;
    const textOutput = candidate?.content?.parts?.map((p) => p.text || '').join('') || '';

    let parsed = tryParseJsonLoose(textOutput);
    if (!parsed || !Array.isArray(parsed.concepts)) {
      try {
        parsed = extractJson(textOutput);
      } catch (e) {
        console.error('Failed to extract/validate JSON from Gemini output (loose+strict):', e && e.message);
        parsed = null;
      }
    }

    if (!parsed || !Array.isArray(parsed.concepts)) {
      console.error('Gemini response did not include concepts array. Full text:', textOutput);
      return res.status(500).json({ ok: false, error: 'Unable to parse Gemini response. Please try again later.' });
    }

    const concepts = parsed.concepts.slice(0, 3).map((concept) => ({
      title: String(concept.title || '').trim() || 'Cake Design',
      description: String(concept.description || '').trim() || 'Beautiful cake visualization concept.',
      prompt: String(concept.prompt || '').trim() || ''
    }));

    for (const concept of concepts) {
      let gotImage = false;
      try {
        const imgResponse = await fetchGeminiResponse(apiKey, concept.prompt, imageModel, true);
        const imgCandidate = Array.isArray(imgResponse.candidates) ? imgResponse.candidates[0] : imgResponse.candidates?.[0] || null;
        const imagePart = imgCandidate?.content?.parts?.find((p) => p.inlineData);
        if (imagePart?.inlineData) {
          concept.imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          gotImage = true;
        }
      } catch (imgErr) {
        const statusCode = imgErr && imgErr.statusCode;
        const bodyErr = imgErr && imgErr.body && imgErr.body.error;
        const message = imgErr && (imgErr.message || (bodyErr && bodyErr.message) || '');
        const isQuota = statusCode === 429 || (bodyErr && bodyErr.status === 'RESOURCE_EXHAUSTED') || /quota|Quota exceeded|RESOURCE_EXHAUSTED|rate limit/i.test(message);
        console.error('Gemini image generation issue for concept:', concept.title, message);
        if (isQuota) {
          console.warn('Gemini image quota/rate limit hit');
        }
      }

      if (!gotImage) {
        try {
          concept.imageUrl = await fetchHuggingFaceImage(concept.prompt);
        } catch (hfErr) {
          console.error('HuggingFace image generation failed for concept:', concept.title, hfErr && (hfErr.body || hfErr.message));
          concept.imageUrl = null;
        }
      }
    }

    res.json({ ok: true, concepts });
  } catch (err) {
    console.error('Gemini design generation error', err);
    res.status(500).json({ ok: false, error: 'Gemini design generation failed. Please try again later.' });
  }
});

// Owner credentials are fixed and cannot be changed through the website.
const OWNER_USERNAME = 'srushti';
const OWNER_PASSWORD_HASH = bcrypt.hashSync('chetansrushti', 10);

// ownerAuth accepts session-based login or legacy Basic auth
function ownerAuth(req, res, next) {
  if (req.session && req.session.isOwner) return next();
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const parts = decoded.split(':');
    const user = parts[0] || '';
    const pass = parts.length > 1 ? parts[1] : '';
    if (user === OWNER_USERNAME && bcrypt.compareSync(pass, OWNER_PASSWORD_HASH)) return next();
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

app.get('/export', ownerAuth, async (req, res) => {
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

app.get('/api/backup', ownerAuth, async (req, res) => {
  try {
    const submissions = await getAllSubmissions();
    const products = await getProducts();
    return res.json({ ok: true, submissions, products });
  } catch (err) {
    console.error('Backup fetch error', err);
    res.status(500).json({ ok: false, error: String(err) });
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

// Product catalog APIs
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json({ ok: true, products });
  } catch (err) {
    console.error('Products fetch error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/api/products', ownerAuth, async (req, res) => {
  try {
    const { category, name, description, imageUrl } = req.body || {};
    if (!name || !category) {
      return res.status(400).json({ ok: false, error: 'category and name are required' });
    }
    const result = await saveProduct({ category, name, description, imageUrl, createdAt: new Date().toISOString() });
    res.json({ ok: true, id: result.id });
  } catch (err) {
    console.error('Save product error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/api/upload-image', ownerAuth, upload.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'imageFile is required' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ ok: true, imageUrl });
});

app.delete('/api/products/:id', ownerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ ok: false, error: 'invalid id' });
    const result = await deleteProduct(id);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Delete product error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Delete submission/order
app.delete('/api/submissions/:id', ownerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ ok: false, error: 'invalid id' });
    const result = await deleteSubmission(id);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Delete submission error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Mark order collected/uncollected
app.post('/api/orders/:id/collect', ownerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const collected = !!req.body.collected;
    if (!id) return res.status(400).json({ ok: false, error: 'invalid id' });
    const result = await markCollected(id, collected);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Mark collected error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Login route for owner (session-based)
// Owner setup route: create first owner (protected with SETUP_TOKEN)
app.post('/owner/setup', (req, res) => {
  res.status(403).json({ ok: false, error: 'owner setup disabled' });
});

// Login route for owner (supports per-owner accounts with optional TOTP)
app.post('/owner/login', async (req, res) => {
  const { username, password, rememberDevice } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'missing' });
  try {
    if (username === OWNER_USERNAME && bcrypt.compareSync(password, OWNER_PASSWORD_HASH)) {
      req.session.isOwner = true;
      req.session.owner = { username };
      let response = { ok: true };
      if (rememberDevice) {
        const deviceToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');
        await saveDeviceToken({ tokenHash, userAgent: req.headers['user-agent'] || '', createdAt: new Date().toISOString() });
        await pruneOldDeviceTokens(4);
        res.cookie('craveessa_device', deviceToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000
        });
        response.remembered = true;
      }
      return res.json(response);
    }
    return res.status(401).json({ ok: false, error: 'invalid' });
  } catch (err) {
    console.error('owner login err', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/owner/login-device', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const deviceToken = cookies['craveessa_device'];
  if (!deviceToken) {
    res.clearCookie('craveessa_device');
    return res.status(401).json({ ok: false, error: 'no-device' });
  }
  try {
    const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');
    const device = await getDeviceByTokenHash(tokenHash);
    if (!device) {
      res.clearCookie('craveessa_device');
      return res.status(401).json({ ok: false, error: 'invalid-device' });
    }
    req.session.isOwner = true;
    req.session.owner = { username: OWNER_USERNAME };
    res.json({ ok: true, directAccess: true });
  } catch (err) {
    console.error('owner device login err', err);
    res.clearCookie('craveessa_device');
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
  res.clearCookie('craveessa_device');
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/device-status', ownerAuth, async (req, res) => {
  try {
    const count = await getDeviceTokenCount();
    res.json({ ok: true, count });
  } catch (err) {
    console.error('device status err', err);
    res.status(500).json({ ok: false, error: 'Unable to retrieve device status' });
  }
});

app.get('/api/backup', async (req, res) => {
  try {
    const orders = await getAllSubmissions();
    const products = await getProducts();
    res.json({ ok: true, orders, products });
  } catch (err) {
    console.error('backup fetch err', err);
    res.status(500).json({ ok: false, error: 'Unable to prepare backup' });
  }
});

app.listen(PORT, () => {
  console.log(`Craveessa backend running on http://localhost:${PORT}`);
});
