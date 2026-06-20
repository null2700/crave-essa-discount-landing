# Why It Works Locally But Not On Railway → Vercel

## Local Setup (✅ Works)

```
Your Computer
├─ localhost:3000 (Main Server + Client)
│  └─ public/discount.html
│     └─ Configured to use: http://localhost:3000
│        ✅ Same origin! Works!
│
└─ localhost:3001 (Owner Server)
   └─ Owner dashboard, API endpoints
      ✅ Can access port 3000 locally
```

**Why it works:**
- Client and server on same machine
- Same origin (localhost)
- No CORS issues
- No environment variables needed

---

## Production Setup (❌ Currently NOT Working)

### What You Have:

```
Vercel Cloud (Your Client)
https://your-app.vercel.app/discount.html
└─ Configured to use: ??? 

Railroad Cloud (Your Owner Server)  
https://your-app.up.railway.app/api/submit
└─ Can accept: ??? (depends on CORS config)
```

### The Problem:

**Client doesn't know where to send data!**

```
Client on Vercel tries to send POST request to:
    ↓
Where???
    ├─ localhost:3000? ❌ (Can't reach - that's your computer!)
    ├─ localhost:3001? ❌ (Can't reach - that's your computer!)
    └─ https://...railway.app? ❌ (Client doesn't know this URL!)
```

---

## The Solution: Tell Client the Owner's Address

### Step 1: Get Owner's Address
```
Railway Dashboard → Your Project → Public Networking URL
→ https://your-app.up.railway.app
```

### Step 2: Tell Vercel Where Client Should Send Data
```
Vercel Dashboard → Settings → Environment Variables

REACT_APP_API_URL = https://your-app.up.railway.app
```

### Step 3: Redeploy Vercel

This makes Vercel rebuild the site with the new environment variable.

---

## After Fix: How It Works

```
User on Vercel (https://your-app.vercel.app)
    ↓
Fills out form
    ↓
JavaScript reads: REACT_APP_API_URL = "https://...railway.app"
    ↓
Sends: POST https://...railway.app/submit
    ↓
Railway checks: CORS ✓ (Vercel domain allowed)
    ↓
Data saved in database
    ↓
Admin on Railway sees submission
    ↓
✅ Works!
```

---

## Why CORS is Needed

### Without CORS
```
Browser sees:
Origin: https://vercel.app
Request to: https://railway.app

❌ BLOCKED! "You can't talk to other domains!"
```

### With CORS (What We Added)
```
Browser sees:
Origin: https://vercel.app
Request to: https://railway.app

Server responds: "Yes, vercel.app is allowed!"
Access-Control-Allow-Origin: https://vercel.app

✅ ALLOWED! Browser lets request through
```

---

## The 3 Things That Must Happen

### 1️⃣ Environment Variable Set
```
REACT_APP_API_URL = https://your-railway-url.up.railway.app
```
✅ We did this ← **You need to do this on Vercel!**

### 2️⃣ Client Code Uses It
```javascript
// In public/config.discount.js
apiBaseUrl: process.env.REACT_APP_API_URL
```
✅ Already done in code

### 3️⃣ CORS Configured
```javascript
// In server.js and owner-railway/server.js
Allows: *.vercel.app domains
```
✅ Already done in code

---

## Checklist: What's Done vs What You Need To Do

### ✅ Already Done (Code Changes)
- [x] public/config.discount.js - Reads REACT_APP_API_URL
- [x] public/script.js - Uses configurable API endpoint  
- [x] server.js - Enhanced CORS for Vercel
- [x] owner-railway/server.js - Enhanced CORS for Vercel

### ⏳ You Need To Do (Deployment Steps)

#### 1. Deploy Owner to Railway
- [ ] Push owner-railway folder to Railway
- [ ] Wait for deployment
- [ ] Copy the Railway URL

#### 2. Deploy Client to Vercel
- [ ] Push main project to GitHub
- [ ] Connect to Vercel
- [ ] Wait for deployment
- [ ] Copy the Vercel URL

#### 3. **SET ENVIRONMENT VARIABLE** ⭐ (THIS IS THE MISSING STEP!)
- [ ] Go to Vercel Settings
- [ ] Add `REACT_APP_API_URL` = Railway URL
- [ ] Save

#### 4. **REDEPLOY VERCEL** ⭐
- [ ] Click Redeploy
- [ ] Wait for deployment to finish

#### 5. Test
- [ ] Open Vercel site
- [ ] Submit form
- [ ] Check owner dashboard

---

## Why People Get Stuck Here

**Common mistake:** They set the environment variable on Vercel but forget to redeploy.

Setting the env var is NOT enough. You must redeploy after!

```
❌ Wrong:
1. Set REACT_APP_API_URL
2. Refresh browser
3. Wonder why it's not working

✅ Right:
1. Set REACT_APP_API_URL
2. Click "Redeploy"
3. Wait for deployment ✓
4. Refresh browser
5. It works!
```

---

## Quick Summary

**Local:** Client and server on same machine = works

**Production:** Client on Vercel, Server on Railway = need to:
1. Tell client where server is (env var)
2. Redeploy so client gets the info (redeploy)
3. Allow cross-origin requests (already done)

Missing any of these steps = doesn't work!

---

## The One Command That Should Be Done

You should have already done this in the Vercel dashboard:

```
REACT_APP_API_URL = https://your-railway-owner-server.up.railway.app
```

**If you haven't done this yet, that's why it's not working!**

Do this now, redeploy, and it will work.
