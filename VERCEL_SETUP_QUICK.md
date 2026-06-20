# ⚡ Quick Fix: Environment Variables for Vercel

## The Issue
Data from Vercel client is not reaching Railway owner because the client doesn't know the owner server URL.

## The Fix (3 Steps)

### Step 1: Get Your Railway Owner URL
1. Go to [Railway Dashboard](https://railway.app)
2. Select your owner project
3. Click "Deployments" tab
4. Copy the **Public Networking URL** (looks like `https://your-project-name.up.railway.app`)

**Example:** `https://crave-essa-owner.up.railway.app`

---

### Step 2: Go to Vercel Project Settings
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (discount landing page)
3. Click **Settings** tab
4. Find **Environment Variables** in the left menu

---

### Step 3: Add the Environment Variable

| Setting | Value |
|---------|-------|
| **Name** | `REACT_APP_API_URL` |
| **Value** | Your Railway URL (from Step 1) |
| **Environments** | ✓ Production ✓ Preview ✓ Development |

**Example Configuration:**
- Name: `REACT_APP_API_URL`
- Value: `https://crave-essa-owner.up.railway.app`
- Environments: Check all three

Click **Save** and **Redeploy**

---

### Step 4: Redeploy Your Vercel Project
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
   - OR push new code to GitHub to trigger automatic redeploy

**Wait 1-2 minutes for deployment to complete.**

---

## Verify It Works

### Test in Browser Console

1. Go to your Vercel site (e.g., `https://discount-landing.vercel.app`)
2. Open DevTools (F12 → Console tab)
3. Paste this command:
   ```javascript
   console.log('API URL:', CRAVE_CONFIG.apiBaseUrl)
   ```

Should show your Railway URL, not localhost!

### Test Form Submission

1. Fill out the discount form
2. Submit it
3. In Console, should see:
   ```
   📤 Sending submission to: https://crave-essa-owner.up.railway.app/submit
   ✅ Submission saved successfully: {ok: true, id: "..."}
   ```

### Verify in Owner Dashboard

1. Go to `https://your-railway-url/owner`
2. Login (username: `srushti`, password: `chetansrushti`)
3. Click "Submissions" tab
4. Should see your test submission! ✅

---

## If It Still Doesn't Work

### Check 1: Is API URL Correct?
```javascript
// In browser console:
CRAVE_CONFIG.apiBaseUrl
// Should print your Railway URL, not localhost
```

### Check 2: Test Direct API Call
```javascript
// In browser console:
fetch('https://your-railway-url/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
// Should show: {ok: true}
```

### Check 3: Check Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Scroll to "Build Logs" and "Runtime Logs"
6. Look for errors

### Check 4: Check Railway Logs
1. Go to Railway Dashboard
2. Select owner project
3. Click "Deployments"
4. Click on latest deployment
5. Check the logs for CORS errors

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Environment variable not loading | Redeploy after saving (don't just refresh) |
| Still shows `localhost` | Clear browser cache and refresh |
| CORS Error in console | Make sure Railway URL is correct in env var |
| 404 Error | Railway URL is wrong or instance isn't running |
| Timeout | Railway URL is unreachable (try in curl) |

---

## That's It! 🎉

Your client on Vercel will now:
1. ✅ Automatically detect the environment
2. ✅ Use the Railway URL from environment variable
3. ✅ Send data to Railway owner server
4. ✅ Data appears in owner dashboard

**No code changes needed** - just set one environment variable!
