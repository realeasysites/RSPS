const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'leads.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  town TEXT,
  service TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
`);

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];

module.exports = {
  STATUSES,
  insertLead(l) {
    const r = db.prepare(`INSERT INTO leads (name, phone, email, town, service, message) VALUES (@name,@phone,@email,@town,@service,@message)`).run(l);
    return r.lastInsertRowid;
  },
  listLeads() { return db.prepare('SELECT * FROM leads ORDER BY id DESC').all(); },
  updateLead(id, { status, notes }) {
    const cur = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!cur) return null;
    const s = STATUSES.includes(status) ? status : cur.status;
    const n = typeof notes === 'string' ? notes.slice(0, 4000) : cur.notes;
    db.prepare('UPDATE leads SET status = ?, notes = ? WHERE id = ?').run(s, n, id);
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  },
  countLeads() { return db.prepare('SELECT COUNT(*) c FROM leads').get().c; }
};
