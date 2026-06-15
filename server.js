const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const xlsx = require('xlsx');
const { saveSubmission, getAllSubmissions } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files from project root so backend is self-contained
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/submit', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await saveSubmission(payload);
    res.json({ ok: true, id: result.id });
  } catch (err) {
    console.error('Save error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/export', async (req, res) => {
  try {
    const rows = await getAllSubmissions();
    const sheet = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, sheet, 'Submissions');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    console.error('Export error', err);
    res.status(500).send('Export error');
  }
});

app.listen(PORT, () => {
  console.log(`Craveessa backend running on http://localhost:${PORT}`);
});
