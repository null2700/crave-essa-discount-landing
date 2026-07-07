**Quick Free Production Setup**

This file lists concrete, free steps to get the project running in a production-ready manner using free tiers.

1) Frontend (static)
- Deploy the `public/` folder to Netlify or Cloudflare Pages (both free and provide HTTPS). Connect your GitHub repo and enable auto-deploys from `main`.

2) Backend (free options)
- Use Railway / Render free tier, or convert endpoints to serverless functions on Vercel/Netlify (both have free tiers). If you keep the Express server, Railway/Render can run `npm start`.

3) Database
- Use Supabase (free Postgres) or MongoDB Atlas free tier for persistence. Set `DATABASE_URL` in platform env.

4) Uploads
- Use Cloudflare R2 (free-ish) or the provider's object storage. Store file URLs in DB.

5) Secrets & CI
- Create a GitHub secret for `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` to enable the deploy workflow. Set other env vars in your host (e.g. `SESSION_SECRET`, `DATABASE_URL`).

6) Monitoring
- Add Sentry (free tier) and UptimeRobot free checks to monitor `/health`.

Notes
- I did not modify `server.js` or other core code. These files are non-invasive scaffolding to use free services.
