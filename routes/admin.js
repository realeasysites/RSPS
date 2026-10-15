const path = require('path');
const express = require('express');
const db = require('../db');
const auth = require('../lib/auth');

const router = express.Router();
const view = (f) => path.join(__dirname, '..', 'views', f);

router.get('/login', (req, res) => (auth.isAuthed(req) ? res.redirect('/admin') : res.sendFile(view('login.html'))));

router.post('/login', auth.limiter(10, 15 * 60 * 1000), (req, res) => {
  if (auth.checkPassword(req.body && req.body.password)) { auth.issueSession(res); return res.json({ ok: true }); }
  res.status(401).json({ error: 'Incorrect password.' });
});

router.post('/logout', (_req, res) => { auth.clearSession(res); res.json({ ok: true }); });

router.get('/', auth.requireAuth, (_req, res) => res.sendFile(view('admin.html')));

router.get('/api/leads', auth.requireAuth, (_req, res) => res.json({ statuses: db.STATUSES, leads: db.listLeads() }));

router.patch('/api/leads/:id', auth.requireAuth, (req, res) => {
  const updated = db.updateLead(Number(req.params.id), req.body || {});
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.get('/api/export.csv', auth.requireAuth, (_req, res) => {
  const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const cols = ['id', 'created_at', 'status', 'name', 'phone', 'email', 'town', 'service', 'message', 'notes'];
  const rows = db.listLeads().map((l) => cols.map((c) => q(l[c])).join(','));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="rubino-leads.csv"');
  res.send([cols.join(','), ...rows].join('\n'));
});

module.exports = router;
