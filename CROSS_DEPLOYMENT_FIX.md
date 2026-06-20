# 📋 Summary: Vercel ↔ Railway Cross-Deployment Fix

## Problem Identified
> "The data added in client website isn't displayed on owner one when deployed owner on railway and client on vercel"

**Root Cause:** Client was hardcoded to `localhost:3000`, which:
- Works only on the local machine
- Doesn't work when deployed to Vercel (different domain)
- Cannot reach Railway owner server

---

## Solution Implemented

### Code Changes (All Done ✅)

| File | Change | Purpose |
|------|--------|---------|
| `public/config.discount.js` | Added dynamic `apiBaseUrl` configuration | Automatically detects production vs localhost |
| `public/script.js` | Updated form submission to use `CRAVE_CONFIG.apiBaseUrl` | Sends data to correct server |
| `server.js` | Enhanced CORS to allow Vercel domains | Allows cross-origin requests |
| `owner-railway/server.js` | Enhanced CORS to allow Vercel domains | Accepts requests from Vercel |

### New Documentation

| File | Purpose |
|------|---------|
| `DEPLOYMENT_GUIDE.md` | Complete step-by-step deployment guide |
| `VERCEL_SETUP_QUICK.md` | Quick 3-step setup for Vercel only |
| `TECHNICAL_DETAILS.md` | How it works under the hood |
| `.env.example` | Environment variables template |

---

## What You Need To Do

### Step 1: Deploy Owner to Railway ✓
1. Push `owner-railway/` folder to Railway
2. Railway will auto-detect Node.js and deploy
3. **Copy the Railway URL** (e.g., `https://your-app.up.railway.app`)

### Step 2: Set Environment Variable on Vercel (CRITICAL!)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your discount landing project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-app.up.railway.app` (from Step 1)
   - Check all: Production, Preview, Development
5. Click **Save**

### Step 3: Redeploy Vercel
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait 1-2 minutes for deployment to complete
4. That's it! 🎉

---

## Verify It Works

### Test 1: Check API URL
```javascript
// Open browser console on your Vercel site
console.log(CRAVE_CONFIG.apiBaseUrl)
// Should show: https://your-railway-url.up.railway.app (NOT localhost)
```

### Test 2: Submit Form
1. Fill out discount form on Vercel site
2. Submit
3. Console should show: `✅ Submission saved successfully: {ok: true, id: "..."}`

### Test 3: Check Owner Dashboard
1. Go to `https://your-railway-url/owner`
2. Login (username: `srushti`, password: `chetansrushti`)
3. Go to "Submissions" tab
4. Should see your submission there! ✅

---

## If It Doesn't Work

### Error: Still shows `localhost`
- [ ] Redeploy Vercel (just refreshing isn't enough)
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Wait 2 minutes after redeploy

### Error: CORS Error in Console
```
Access to XMLHttpRequest at 'https://...' has been blocked by CORS policy
```
- [ ] Double-check Railway URL is correct
- [ ] Make sure ALLOWED_ORIGINS is empty on Railway (or contains your Vercel URL)
- [ ] Restart Railway deployment if you changed env vars

### Error: 404 or Timeout
- [ ] Verify Railway URL works: `curl https://your-railway-url/health`
- [ ] Check if Railway instance is running
- [ ] Wait a few minutes after deployment (Railway needs to start up)

### Error: Submissions Don't Appear in Dashboard
- [ ] Open DevTools Network tab
- [ ] Submit form
- [ ] Look for POST request to /submit
- [ ] Check response is `{ok: true, id: "..."}`
- [ ] If response shows error, check Railway logs

---

## Files Changed (Technical Reference)

### Modified Files
1. **public/config.discount.js**
   - Added: `apiBaseUrl` property with auto-detection logic
   - Reads: `process.env.REACT_APP_API_URL` for production

2. **public/script.js** (Line ~353)
   - Before: `fetch('http://localhost:3000/submit', ...)`
   - After: `fetch(CRAVE_CONFIG.apiBaseUrl + '/submit', ...)`
   - Added debug logging

3. **server.js** (Line ~27)
   - Before: `app.use(cors())`
   - After: Custom CORS configuration
   - Allows: localhost, vercel.app, ALLOWED_ORIGINS env var

4. **owner-railway/server.js** (Line ~27)
   - Same CORS configuration as server.js
   - Added: Logging for blocked origins

### New Files
- `.env.example` - Environment variable template
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `VERCEL_SETUP_QUICK.md` - Quick reference
- `TECHNICAL_DETAILS.md` - How it works

---

## How It Works

```
┌─────────────────────────┐
│  Vercel Client Site     │
│  (Your Domain)          │
├─────────────────────────┤
│ Loads public/config.js  │
│ Detects: Not localhost  │
│ Reads: REACT_APP_API_URL│
│ Sets API to Railway URL │
└────────────┬────────────┘
             │
             │ POST /submit
             │ (With Railway URL)
             ↓
┌─────────────────────────┐
│  Railway Owner Server   │
│  (your-app.railway.app) │
├─────────────────────────┤
│ Receives request        │
│ CORS Check: ✓ Vercel    │
│ Saves data to database  │
│ Returns: {ok: true}     │
└─────────────────────────┘
             │
             │ Response
             ↓
┌─────────────────────────┐
│  Vercel Client Site     │
│ Shows: ✅ Saved!        │
└─────────────────────────┘
```

---

## Environment Variables Needed

### Vercel (Required)
```
REACT_APP_API_URL = https://your-railway-owner-app.up.railway.app
```

### Railway (Optional)
```
ALLOWED_ORIGINS = https://your-vercel-app.vercel.app
```

If `ALLOWED_ORIGINS` is empty on Railway, it auto-allows:
- All localhost requests
- All *.vercel.app requests
- Mobile apps / Postman

---

## Next Steps

1. **Immediately:**
   - [ ] Deploy owner to Railway if not already done
   - [ ] Set `REACT_APP_API_URL` on Vercel
   - [ ] Redeploy Vercel
   - [ ] Test form submission

2. **For Production:**
   - [ ] Set `ALLOWED_ORIGINS` on Railway for stricter CORS
   - [ ] Set up `SESSION_SECRET` on Railway
   - [ ] Optional: Connect MongoDB for production database

3. **For Monitoring:**
   - [ ] Monitor Railway logs for errors
   - [ ] Monitor Vercel deployment for build issues
   - [ ] Check browser console for client-side errors

---

## Questions?

- **How do I know it's working?**
  - Check: Console shows `📤 Sending submission to: https://...railway...`
  - Verify: Submission appears in owner dashboard

- **Why was it hardcoded to localhost?**
  - Originally built for local development only
  - Now supports any deployment

- **Do I need to change my code?**
  - No! Just set the environment variable on Vercel

- **What if I have a custom domain instead of vercel.app?**
  - Set `ALLOWED_ORIGINS` on Railway to your custom domain

- **How do I test locally?**
  - Works automatically with localhost (no env var needed)
  - Just run both servers locally as before

---

## Quick Checklist

- [ ] Understand the problem: Client was hardcoded to localhost
- [ ] Understand the solution: Use environment variables for production URLs
- [ ] Deploy owner to Railway and copy the URL
- [ ] Set `REACT_APP_API_URL` on Vercel to Railway URL
- [ ] Redeploy Vercel
- [ ] Test: Form submission reaches owner dashboard
- [ ] Done! 🎉

---

**Files to Review:**
- Start here: `VERCEL_SETUP_QUICK.md` (3-step quick setup)
- Details: `DEPLOYMENT_GUIDE.md` (step-by-step guide)
- Technical: `TECHNICAL_DETAILS.md` (how it works)

**Questions about setup?** Check `VERCEL_SETUP_QUICK.md` first!
