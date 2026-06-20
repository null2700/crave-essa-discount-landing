# 🎂 Craveessa Discount Landing Page

Welcome to the **Craveessa** QR Discount Landing Page! This is a complete, mobile-first, high-converting single-page website designed specifically for customers who scan QR codes printed on your cake boxes or marketing pamphlets.

---

## 🚀 Step 1: Deploying the Site (100% Free)

Since this site is built with vanilla HTML, CSS, and JavaScript, it has no build steps and is extremely fast to load on mobile 4G/5G connections. You can deploy it for free in minutes using any of the following platforms:

### Option A: Netlify (Easiest - Drag & Drop)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the `crave-essa-discount-landing` project folder directly into the upload box.
3. Your site is live! Netlify will give you a random URL (e.g. `https://playful-cupcake-1234.netlify.app`). You can change this subdomain or connect your custom domain in the Netlify dashboard for free.

### Option B: Vercel (Developer-friendly CLI/GitHub)
1. Install Vercel CLI: `npm install -g vercel`.
2. Open your terminal in this directory and run the command: `vercel`.
3. Follow the prompts to log in (free account) and deploy. 
4. Vercel will provide a live deployment URL (e.g. `https://crave-essa-discount-landing.vercel.app`).

### Option C: GitHub Pages
1. Push this folder to a public repository on GitHub.
2. Go to **Settings** > **Pages** inside your repository.
3. Under **Build and deployment**, set the source to `Deploy from a branch`, choose `main` or `master` branch, and folder `/root`. Click Save.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

---

## 📊 Step 2: Setting up Google Forms & Sheets Database

The form utilizes a **hidden iframe POST method**. When the user submits the form, it sends the data directly to Google Forms without redirecting them away from the landing page. The data is instantly written to your Google Sheet!

To connect your own Google Form:
1. Create a **Google Form** with the following fields (in any order):
   * **Full Name** (Short Answer, Required)
   * **Whatsapp Number** (Short Answer / Number, Required)
   * **Email** (Short Answer, Optional)
   * **Cake size interested** (Short Answer or Multiple Choice)
   * **Preferred flavour** (Short Answer or Dropdown)
   * **Occasion** (Short Answer or Dropdown)
   * **Date** (Date picker, Required)
   * **Delivery area** (Short Answer, Required)
   * **Follow @craveessa on Instagram for an EXTRA 5% off?** (Checkboxes: "Yes")
2. Inside your Google Form, click the **Responses** tab and link it to a new **Google Sheet**. This spreadsheet is your order database!
3. To map this landing page to your form, update `config.js` with your specific **Action URL** and **Entry IDs**:
   * Open your public Google Form link in the browser.
   * Right-click any input field and select **Inspect**.
   * Look for input elements with the name attribute matching `entry.XXXXXXXXX` (e.g., `<input type="text" name="entry.1113318575">`).
   * Match each form question to its respective entry ID and update the `CRAVE_CONFIG` object inside [config.js](file:///C:/Users/soham/.gemini/antigravity/scratch/crave-essa-discount-landing/config.js).
   * Update the `actionUrl` in `config.js` to point to your Form's response URL (change `/viewform` at the end of the public URL to `/formResponse`, e.g. `https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse`).

*Note: The "Ordered before?" toggle is only sent via the WhatsApp pre-filled text to keep the Google Form setup simpler.*

---

## 📱 Step 3: Generating the QR Code

Once your website is deployed (e.g., `https://craveessa.netlify.app`), you need to create a QR code pointing to that URL:

1. Go to a free, high-quality QR generator like [QR Code Monkey](https://www.qr-code-monkey.com/) or [Adobe Express QR Generator](https://www.adobe.com/express/feature/image/qr-code-generator).
2. Paste your live deployment URL into the URL field.
3. Customize the QR code:
   * **Color**: Select your primary brand color (e.g., Blush Pink `#FF85A2` or Chocolate Brown `#4E3629`).
   * **Logo**: Upload a cute cake emoji or a small Crave Essa icon to place in the center.
   * **Design**: Choose rounded corners for the eyes/pixels to match the website's design language.
4. Download the QR code as a high-resolution PNG or SVG vector.
5. Print it on:
   * A thank-you note card placed inside each cake box.
   * Round stickers placed on top of cake box lids.
   * Menu pamphlets distributed with deliveries.

---

## 🍰 Customization & Branding in `config.js`

To change the Instagram link, WhatsApp phone number, discount prefix, or form submission fields, open [config.js](file:///C:/Users/soham/.gemini/antigravity/scratch/crave-essa-discount-landing/config.js) and modify the values.

```javascript
const CRAVE_CONFIG = {
  instagramLink: "https://www.instagram.com/craveessa",
  whatsappNumber: "919999999999", // Replace with your actual WhatsApp business number with country code (91)
  discountCodePrefix: "CRAVE50",
  // ...
};
```

## 🗄️ Optional: Local DB + Excel Export

If you prefer to store submissions locally and download them as an Excel file, a tiny Node.js backend is included.

Run the backend from the project root:

```bash
npm install
npm start
```

Notes:
- The backend listens on `http://localhost:3000`.
- Submissions are saved to `submissions.db` (SQLite) in the project folder.
- Download all submissions as Excel at: `http://localhost:3000/export` (produces `submissions.xlsx`).
 - Download all submissions as CSV at: `http://localhost:3000/export` (produces `submissions.csv`).
- The site will POST form submissions to this backend if you keep the default client script change in `script.js`.

## 📦 Deploying the full app (frontend + backend)

This project can run as a single deployable app (serves static site + API). Two common options:

- Docker (recommended for reproducible deploys):

```bash
# build image
docker build -t craveessa:latest .

# run (persist DB with a host volume)
docker run -p 3000:3000 -v "$PWD/submissions.db":/app/submissions.db -e PORT=3000 -d craveessa:latest

# visit http://localhost:3000
```

- Platform-as-a-Service (Heroku / Render / Railway):
   - Ensure `PORT` is read from env (the server does this).
   - Add the repo and deploy; the `Procfile` (`web: npm start`) is provided.
   - For persistence, configure a persistent disk or attach an external database. If persistence is not available, expect the SQLite file to be ephemeral between deploys.

Notes on persistence and production:
- SQLite is fine for small-scale or staging deployments. For production use, prefer an external DB (Postgres/MySQL) and update `db.js` accordingly.
- When deploying with Docker, mount a host volume for `submissions.db` to persist data across container restarts.

## Owner order interface (phone-friendly)

If you want the owner to view orders on their phone without a developer PC or a backend, use the included owner page that reads the Google Form response sheet.

Steps:
1. Open the Google Sheet that receives your Form responses.
2. File → Publish to the web → select the sheet (Responses) → Format: Comma-separated values (CSV) → Publish.
3. Copy the generated `CSV` URL.
4. Open `config.discount.js` and set `ownerFeedUrl` to the CSV URL you copied.
5. Serve the site (or deploy static files). Open `/owner.html` on the owner's phone to view orders.

Behavior:
- The `owner.html` page fetches the published CSV and renders a table.
- It auto-refreshes every 3 hours and has a manual "Refresh now" button.

Security note: Publishing the sheet makes its contents public to anyone with the URL. If you need stricter access control, consider using the Google Sheets API with proper auth or an authenticated backend.

### Private owner dashboard (password-protected)

If you prefer a private owner dashboard (not public), use the password-protected page at `/owner-private.html`.

1. Set an environment variable `OWNER_PASSWORD` to a strong password before starting the server, e.g. on Linux/macOS:

```bash
export OWNER_PASSWORD=MyStrongOwnerPass
npm start
```

On Windows PowerShell:

```powershell
$env:OWNER_PASSWORD = 'MyStrongOwnerPass'
npm start
```

2. Open `http://<host>:<port>/owner-private.html` on the owner's device.
3. Enter the password to view orders. The password is stored in the browser session only.

The private dashboard fetches orders from the server's SQLite DB and lets the owner mark orders as collected. This keeps the data off the public internet and requires the password to access.

## Production & deployment notes

Security and persistence recommendations for production:

- Environment variables (set in your host or container):
   - `PORT` — port to run the server (default 3000)
   - `SESSION_SECRET` — a long random string used to sign session cookies (required in production)
   - `OWNER_PASSWORD` or `OWNER_PASSWORD_HASH` — owner login credential (set `OWNER_PASSWORD_HASH` to a bcrypt hash for extra safety)

- Per-owner accounts and setup:
   - To create an owner in production, set `SETUP_TOKEN` (a one-time secret) in the environment and call the `/owner/setup` endpoint with that token to create the first owner account.
   - After creating owners, the app will use the `owners` table for authentication. Each owner can optionally enable TOTP 2FA.

- Session cookie & HTTPS:
   - The app sets session cookies with `secure` enabled only when `NODE_ENV=production`. Serve the app over HTTPS (use a reverse proxy like Nginx, or host on Render/Heroku which provides TLS). For multiple instances, configure a shared session store (Redis) instead of the default memory store.

- Docker example (recommended for reproducible deploys):

```bash
# build image
docker build -t craveessa:latest .

# run (persist DB with a host volume, set secrets via env)
docker run -p 3000:3000 -v "$PWD/submissions.db":/app/submissions.db -e PORT=3000 -e SESSION_SECRET='your_session_secret' -e OWNER_PASSWORD='YourOwnerPass' -e NODE_ENV=production -d craveessa:latest
```

Docker Compose (app + Redis) example:

```yaml
version: '3.8'
services:
   redis:
      image: redis:7-alpine
      restart: unless-stopped

   app:
      build: .
      ports:
         - '3000:3000'
      environment:
         - PORT=3000
         - NODE_ENV=production
         - SESSION_SECRET=your_session_secret
         - REDIS_URL=redis://redis:6379
         - SETUP_TOKEN=your_setup_token
      volumes:
         - ./submissions.db:/app/submissions.db
      depends_on:
         - redis

```

- For cloud platforms (Render/Heroku): set the same env vars in the dashboard, enable HTTPS, and mount a persistent disk or use an external database for persistence.

- Use a managed DB or Redis for production for better durability and scaling.

Vulnerability scanning:
- Run `npm audit` regularly and update dependencies. I can help run `npm audit fix` and review any remaining issues.



