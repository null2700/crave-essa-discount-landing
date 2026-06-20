# 🎯 VERCEL SETUP - Exact Steps (Copy This!)

## You're Missing This Step! ⭐

The reason it's not working on Railway → Vercel is because you haven't set the environment variable yet.

---

## Go Here RIGHT NOW:

### URL: https://vercel.com/dashboard

1. **Find your project** (the discount landing page)
2. **Click Settings** (top right, next to "Deployments")
3. **Left sidebar → Environment Variables**
4. **Click "Add New"** button

---

## Fill This In:

### Name
```
REACT_APP_API_URL
```

### Value
```
https://your-railway-owner-url.up.railway.app
```

**Find your Railway URL:**
- Go to Railway Dashboard
- Select owner project
- Copy the "Public Networking URL"
- Should look like: `https://crave-essa-owner.up.railway.app`

### Environments
- ✅ Production (checked)
- ✅ Preview (checked)  
- ✅ Development (checked)

### Save
Click the "Save" button

---

## Then REDEPLOY:

1. Go back to **Deployments** tab
2. Find your latest deployment
3. Click the "•••" menu (three dots)
4. Click **Redeploy**
5. Wait 1-2 minutes...
6. Should show ✅ **Ready**

---

## Verify:

### On your Vercel site:
1. Open Developer Tools: **F12**
2. Go to **Console** tab
3. Type: `CRAVE_CONFIG.apiBaseUrl`
4. Hit Enter

**You should see:**
```
'https://your-railway-url.up.railway.app'
```

**NOT:**
```
'localhost:3000'
```

---

## Then Test:

1. Go to `/discount.html` on your Vercel site
2. Fill out the form
3. Submit
4. Look in Console for: `✅ Submission saved successfully`
5. Go to owner dashboard and check Submissions tab
6. Your submission should appear! 🎉

---

## Still Not Working?

Tell me:
- ✅ Or ❌ - Is Railway deployed? (Can you visit `/health` endpoint?)
- ✅ Or ❌ - Is Vercel deployed?
- ✅ Or ❌ - Did you set the env var?
- ✅ Or ❌ - Did you redeploy Vercel?
- What error do you see? (Share screenshot if possible)
