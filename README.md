# 🎂 Crave Essa Discount Landing Page

Welcome to the **Crave Essa** QR Discount Landing Page! This is a complete, mobile-first, high-converting single-page website designed specifically for customers who scan QR codes printed on your cake boxes or marketing pamphlets.

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
