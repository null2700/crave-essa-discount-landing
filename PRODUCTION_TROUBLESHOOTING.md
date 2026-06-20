# 🚨 Vercel + Railway Deployment Troubleshooting Checklist

## Quick Diagnosis: What's NOT Working?

### Option 1: Form submissions aren't reaching owner dashboard
- Client submitted data, but it doesn't appear in owner's Submissions tab
- **Root cause:** `REACT_APP_API_URL` not set on Vercel

### Option 2: CORS Error in browser console
```
Access to XMLHttpRequest at 'https://...railway...' from origin 'https://...vercel...' 
has been blocked by CORS policy
```
- **Root cause:** CORS not configured on Railway

### Option 3: 404 or timeout errors
- Form submission fails with timeout or 404
- **Root cause:** Railway URL is wrong or Railway isn't running

---

## ✅ Complete Production Setup Checklist

### STEP 1: Deploy Owner to Railway ✓ (MUST DO)

- [ ] Push `owner-railway/` folder to Railway
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Go to Railway Dashboard → Your project → Deployments
- [ ] **COPY the Public Networking URL** (looks like `https://crave-essa-owner.up.railway.app`)
- [ ] Test it works: Visit `https://your-railway-url/health` in browser
- [ ] Should see: `{"ok":true}`

**If you see error or blank page:** Railway deployment failed. Check deployment logs.

---

### STEP 2: Deploy Client to Vercel ✓ (MUST DO)

- [ ] Push main project to GitHub
- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project" and select your GitHub repo
- [ ] **Wait for deployment to complete** (2-3 minutes)
- [ ] **COPY your Vercel URL** (looks like `https://yourapp.vercel.app`)
- [ ] Test it works: Visit `https://your-vercel-url` in browser
- [ ] Should see discount landing page

**If you see error:** Check Vercel build logs. Usually missing dependencies.

---

### STEP 3: Set Environment Variable on Vercel ⭐ (CRITICAL - THIS IS WHY IT'S NOT WORKING!)

**This is the step that connects client to owner server!**

1. [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. [ ] Click on your project (discount landing)
3. [ ] Go to **Settings** tab (top menu)
4. [ ] Find **Environment Variables** in left sidebar
5. [ ] Click **Add New** (or similar button)
6. [ ] Fill in:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-railway-url.up.railway.app` (from STEP 1)
   - **Environments:** Check ✓ Production, ✓ Preview, ✓ Development
7. [ ] Click **Save**

**Example:**
```
Name: REACT_APP_API_URL
Value: https://crave-essa-owner.up.railway.app
Environments: All
```

---

### STEP 4: Redeploy Vercel with Environment Variable

**Important: Just saving the env var isn't enough! You must redeploy!**

1. [ ] Go to **Deployments** tab in Vercel
2. [ ] Find the latest deployment
3. [ ] Click **Redeploy** button (or "Redeploy with latest env vars")
4. [ ] **Wait 1-2 minutes** for deployment to complete
5. [ ] Should see: "✓ Ready"

**After redeploy:**
- [ ] Visit your Vercel site
- [ ] Open browser console (F12)
- [ ] Check: `console.log(CRAVE_CONFIG.apiBaseUrl)`
- [ ] Should show: `https://your-railway-url.up.railway.app` (NOT localhost!)

---

### STEP 5: Verify CORS Configuration on Railway (Optional but Recommended)

Go to Railway Dashboard:
1. [ ] Select owner project
2. [ ] Go to **Variables** tab
3. [ ] Add (or leave blank for auto-allow):
   - **Name:** `ALLOWED_ORIGINS`
   - **Value:** `https://your-vercel-url.vercel.app` (from STEP 2)
4. [ ] **Redeploy** the Railway project

If you leave `ALLOWED_ORIGINS` empty, it auto-allows all *.vercel.app domains (which is fine for now).

---

## 🧪 Test It Works

### Test 1: Check API URL Configuration
```javascript
// On your Vercel site, open console (F12) and run:
CRAVE_CONFIG.apiBaseUrl
// Should show: https://your-railway-url.up.railway.app
// NOT: localhost:3000
```

### Test 2: Test Form Submission
1. [ ] Go to `https://your-vercel-url/discount.html`
2. [ ] Fill out and submit the form
3. [ ] Open browser console (F12)
4. [ ] Should see: `📤 Sending submission to: https://your-railway-url/submit`
5. [ ] Then: `✅ Submission saved successfully: {ok: true, id: "..."}`

### Test 3: Verify in Owner Dashboard
1. [ ] Go to `https://your-railway-url/owner`
2. [ ] Login (username: `srushti`, password: `chetansrushti`)
3. [ ] Click **Submissions** tab
4. [ ] Should see your test submission! ✅

---

## ❌ If It STILL Doesn't Work

### Debug Step 1: Check Vercel Environment Variables
1. Go to Vercel Dashboard → Your project
2. Click Settings → Environment Variables
3. Do you see `REACT_APP_API_URL` listed?
4. Is the value your Railway URL (not blank, not localhost)?
5. Did you redeploy AFTER adding it?

**If no:** Go back to STEP 3 and STEP 4

---

### Debug Step 2: Check Browser Console
1. Open your Vercel site
2. Press F12 (Open DevTools)
3. Go to **Console** tab
4. Type: `CRAVE_CONFIG.apiBaseUrl`
5. What does it show?

**If it shows `localhost:3000`:**
- Vercel env var not working
- Make sure you redeployed after setting env var
- Clear browser cache (Ctrl+Shift+Delete)

**If it shows your Railway URL:**
- Good! Move to Debug Step 3

---

### Debug Step 3: Check Network Requests
1. Open your Vercel site
2. Press F12 (Open DevTools)
3. Go to **Network** tab
4. Fill out and submit the form
5. Look for a request to `/submit`
6. Click on it and check:
   - **URL:** Should be `https://your-railway-url/submit` (not localhost!)
   - **Status:** Should be 200 (not 404 or 401)
   - **Response:** Should show `{ok: true, id: "..."}`

**If URL is wrong:** Go back to Debug Step 2

**If Status is 404:** Railway URL is incorrect or Railway isn't running

**If Status is 401 or 500:** Check Railway logs for errors

---

### Debug Step 4: Check Railway Logs
1. Go to Railway Dashboard
2. Select owner project
3. Go to **Deployments** tab
4. Click on latest deployment
5. Check **Logs** section
6. Look for errors or CORS rejection messages

**Common errors:**
- `CORS request blocked from origin: https://...vercel.app`
  - Add your Vercel URL to ALLOWED_ORIGINS on Railway
  
- `Cannot find module` or `Error: ...`
  - Railway build failed, check full build logs

---

## 📋 Exact URLs to Use

### Sample Configuration:

**Railway:**
- Owner project deployed to: `https://crave-essa-owner.up.railway.app`
- Health check: `https://crave-essa-owner.up.railway.app/health`

**Vercel:**
- Client project deployed to: `https://crave-essa-discount.vercel.app`
- Discount page: `https://crave-essa-discount.vercel.app/discount.html`

**Vercel Environment Variables:**
```
REACT_APP_API_URL = https://crave-essa-owner.up.railway.app
```

**Expected Flow:**
```
User submits form on Vercel
    ↓
Script uses REACT_APP_API_URL (not localhost!)
    ↓
POST https://crave-essa-owner.up.railway.app/submit
    ↓
CORS check ✓ (Vercel domain allowed)
    ↓
Data saved in Railway database
    ↓
Appears in owner dashboard
```

---

## 🎯 Most Common Problem (95% of cases):

**Environment variable `REACT_APP_API_URL` is NOT set on Vercel**

Fix: Go to Vercel Settings → Environment Variables → Add `REACT_APP_API_URL` → Redeploy

That's it! 90% of the time this is the only issue.

---

## Need Help?

Tell me:
1. Is your Railway URL deployed and accessible? (test `/health` endpoint)
2. Is your Vercel site deployed?
3. Did you set `REACT_APP_API_URL` on Vercel?
4. Did you redeploy Vercel after setting the env var?
5. What error do you see in browser console?
