const express = require('express');
const db = require('../db');
const { notifyNewLead } = require('../lib/mailer');
const { limiter } = require('../lib/auth');

const router = express.Router();
const clean = (v, max) => String(v || '').trim().slice(0, max);

router.post('/', limiter(8, 10 * 60 * 1000), async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot
  const lead = {
    name: clean(b.name, 120),
    phone: clean(b.phone, 40),
    email: clean(b.email, 160),
    town: clean(b.town, 80),
    service: clean(b.service, 120),
    message: clean(b.message, 3000)
  };
  if (!lead.name || !lead.phone) return res.status(400).json({ error: 'Name and phone are required.' });
  if (lead.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  try {
    const id = db.insertLead(lead);
    notifyNewLead(lead).catch((e) => console.error('[mailer] failed:', e.message));
    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save your request.' });
  }
});

module.exports = router;
