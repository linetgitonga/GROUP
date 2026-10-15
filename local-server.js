const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;

const db = new Database(path.join(__dirname, 'yearbook.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    pick TEXT NOT NULL,
    voter TEXT DEFAULT 'anon',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

app.use(express.json());
app.use(express.static(__dirname));

// --- Votes ---
app.post('/api/vote', (req, res) => {
  const { question, pick, voter } = req.body;
  if (!question || !pick) return res.status(400).json({ error: 'question and pick required' });
  db.prepare('INSERT INTO votes (question, pick, voter) VALUES (?, ?, ?)').run(question, pick, voter || 'anon');
  res.json({ ok: true });
});

app.get('/api/votes', (req, res) => {
  const rows = db.prepare(`
    SELECT question, pick, COUNT(*) as count
    FROM votes GROUP BY question, pick
    ORDER BY question, count DESC
  `).all();
  res.json(rows);
});

app.get('/api/votes/:question', (req, res) => {
  const rows = db.prepare(`
    SELECT pick, COUNT(*) as count
    FROM votes WHERE question = ?
    GROUP BY pick ORDER BY count DESC
  `).all(req.params.question);
  res.json(rows);
});

// --- Guestbook ---
app.post('/api/guestbook', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'name and message required' });
  const info = db.prepare('INSERT INTO guestbook (name, message) VALUES (?, ?)').run(name, message);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.get('/api/guestbook', (req, res) => {
  const rows = db.prepare('SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC LIMIT 200').all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Yearbook server running → http://localhost:${PORT}`);
});
