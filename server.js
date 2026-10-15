const path = require('path');
const express = require('express');
const db = require('./db');
const quoteRoutes = require('./routes/quote');
const adminRoutes = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d', extensions: ['html'] }));

app.use('/api/quote', quoteRoutes);
app.use('/admin', adminRoutes);

app.get('/healthz', (_req, res) => res.json({ ok: true, leads: db.countLeads() }));

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Rubino & Sons site running on :${port}`));
