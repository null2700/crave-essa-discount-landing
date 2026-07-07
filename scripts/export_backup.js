const fs = require('fs');
const path = require('path');
const { getAllSubmissions, getProducts } = require('../db');

(async () => {
  try {
    const submissions = await getAllSubmissions();
    const products = await getProducts();
    const out = { submissions, products };
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
    const fname = path.join(backupsDir, `backup-${Date.now()}.json`);
    fs.writeFileSync(fname, JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote backup to', fname);
    process.exit(0);
  } catch (err) {
    console.error('Backup failed', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
