# 🚀 Cross-Deployment Setup Guide (Vercel + Railway)

## Problem
Data from client (Vercel) is not being received by owner dashboard (Railway) because:
1. Client hardcoded to `localhost:3000`
2. No CORS configuration for cross-origin requests
3. Missing environment variable setup for production URLs

## Solution
This guide explains how to configure your Vercel + Railway deployment.

---

## Step 1: Update Client Configuration

### Local Development (No Changes Needed)
- Client: `http://localhost:3000`
- Owner: `http://localhost:3001` or `http://localhost:3000/owner`
- Everything works automatically ✅

### For Production Deployment

The client code now automatically detects:
- **Localhost**: Uses `http://localhost:3000`
- **Vercel**: Uses environment variable `REACT_APP_API_URL` or `window.__CRAVEESSA_API_URL__`

---

## Step 2: Deploy Owner Server to Railway

1. **Push owner-railway folder to Railway**
   ```bash
   cd owner-railway
   # Railway will automatically detect Node.js project
   # Set PORT to 3001 or leave default
   ```

2. **Get your Railway URL**
   - After deployment, Railway assigns a URL like: `https://your-project-name.up.railway.app`
   - Copy this URL

3. **Verify API is accessible**
   ```bash
   curl https://your-project-name.up.railway.app/health
   # Should return: {"ok":true}
   
   curl -X POST https://your-project-name.up.railway.app/submit \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Test"}'
   # Should return: {"ok":true,"id":"..."}
   ```

---

## Step 3: Deploy Client to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Select your GitHub repo

2. **Set Environment Variable**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-railway-url.up.railway.app`
   - Example: `https://crave-essa-owner.up.railway.app`

3. **Deploy**
   - Vercel automatically redeploys when you push to main branch
   - After deployment, get your Vercel URL (usually `https://yourproject.vercel.app`)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add REACT_APP_API_URL
# When prompted, enter: https://your-railway-url.up.railway.app

# Redeploy with env vars
vercel --prod
```

---

## Step 4: Configure CORS on Owner Server

### On Railway Dashboard

1. **Environment Variables**
   - Set `ALLOWED_ORIGINS` (optional, for stricter CORS control)
   - Format: comma-separated URLs
   - Example: `https://yourproject.vercel.app,https://yourproject-staging.vercel.app`

2. **Railway Environment Variables Setup**
   ```
   ALLOWED_ORIGINS=https://yourproject.vercel.app
   NODE_ENV=production
   SESSION_SECRET=your-secure-secret-key
   ```

### CORS is Auto-Allowed For:
- ✅ localhost/127.0.0.1
- ✅ *.vercel.app domains
- ✅ Domains in ALLOWED_ORIGINS env variable
- ✅ Requests with no origin (mobile apps, Postman)

---

## Step 5: Verify Cross-Deployment Connection

### Test from Vercel Client

Open browser console on your Vercel client and run:

```javascript
// Check configured API URL
console.log('API Base URL:', CRAVE_CONFIG.apiBaseUrl);

// Test submission endpoint
fetch(CRAVE_CONFIG.apiBaseUrl + '/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test User',
    whatsappNumber: '9011560339',
    email: 'test@example.com'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err))
```

### Expected Response
```javascript
{ok: true, id: "some-id"}
```

### Test Owner Dashboard

1. Visit `https://your-railway-url.up.railway.app/owner`
2. Login: username=`srushti`, password=`chetansrushti`
3. Go to "Submissions" tab
4. Should see submissions from Vercel client ✅

---

## Troubleshooting

### Problem: CORS Error
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

**Solution:**
1. Verify `ALLOWED_ORIGINS` env var on Railway (or leave empty for auto-allow)
2. Check both URLs are correct
3. Restart Railway deployment after changing env vars
4. Check console logs for "CORS request blocked from origin" messages

### Problem: 404 Not Found
```
POST /submit 404
```

**Solution:**
- Verify Railway URL is correct and accessible
- Test: `curl https://your-railway-url/health`
- Check Railway build logs for errors

### Problem: Timeout/Connection Refused
```
fetch error: Failed to fetch
```

**Solution:**
- Verify Railway URL is accessible from Vercel (try curl from terminal)
- Check Railway instance is running (Redeploy if needed)
- Check firewall/network restrictions
- Wait 2-3 minutes after deployment for Railway to be fully ready

### Problem: Submissions Not Appearing in Owner Dashboard
```
GET /api/orders returns no data
```

**Solution:**
1. Verify client is sending data to correct endpoint
2. Check client console for network errors
3. Use browser DevTools Network tab to see actual request URL
4. Verify database on Railway has data (check Railway logs)

---

## Local Development with Mock Data

If you want to test locally without deploying:

```bash
# Terminal 1: Start main server on 3000
cd .
npm install
npm start

# Terminal 2: Start owner server on 3001  
cd owner-railway
npm install
npm start

# Access
# Client: http://localhost:3000
# Owner: http://localhost:3001
```

---

## Environment Variables Summary

### Client (Vercel)
| Variable | Value | Example |
|----------|-------|---------|
| `REACT_APP_API_URL` | Owner server URL | `https://crave-essa-owner.up.railway.app` |

### Owner (Railway)  
| Variable | Value | Example |
|----------|-------|---------|
| `ALLOWED_ORIGINS` | Comma-separated client URLs | `https://myapp.vercel.app` |
| `NODE_ENV` | Environment | `production` |
| `SESSION_SECRET` | Secret key | Auto-generated or custom |
| `REDIS_URL` | Redis URL | (optional for prod) |
| `MONGODB_URI` | MongoDB connection | (optional for prod) |

---

## File Changes Made

### 1. `public/config.discount.js`
- Added `apiBaseUrl` configuration
- Auto-detects localhost vs production
- Reads from `REACT_APP_API_URL` or `window.__CRAVEESSA_API_URL__`

### 2. `public/script.js`
- Updated form submission to use `CRAVE_CONFIG.apiBaseUrl`
- Added debug logging for troubleshooting

### 3. `server.js`
- Enhanced CORS configuration
- Allows Vercel, localhost, and configured domains
- Supports `ALLOWED_ORIGINS` environment variable

### 4. `owner-railway/server.js`
- Same CORS enhancements
- Logs blocked CORS requests for debugging

### 5. `.env.example`
- Template for environment configuration
- Documents all available options

---

## Next Steps

1. ✅ **Deploy Owner to Railway**
   - Push `owner-railway/` folder
   - Get Railway URL

2. ✅ **Set Up Vercel**
   - Deploy main project to Vercel
   - Add `REACT_APP_API_URL` environment variable

3. ✅ **Test Connection**
   - Submit form on Vercel client
   - Verify in owner dashboard

4. ✅ **Update CORS** (Optional)
   - Add `ALLOWED_ORIGINS` on Railway for stricter control

---

## Support

For issues, check:
1. Browser console (F12) for client-side errors
2. Railway deployment logs for server errors
3. Vercel deployment logs for build issues
4. Network tab to verify API calls and responses

Expected console output when working:
```
📤 Sending submission to: https://your-railway-url.up.railway.app/submit
✅ Submission saved successfully: {ok: true, id: "..."}
```
