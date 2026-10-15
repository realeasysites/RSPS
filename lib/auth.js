const crypto = require('crypto');

const COOKIE = 'rs_admin';
const secret = () => process.env.SESSION_SECRET || 'dev-only-secret-change-me';
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function checkPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD || 'change-me-now';
  return safeEqual(pw || '', expected);
}

function issueSession(res) {
  const exp = String(Date.now() + 1000 * 60 * 60 * 12);
  const token = `${exp}.${sign(exp)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=43200${secure}`);
}

function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=0`);
}

function isAuthed(req) {
  const tok = parseCookies(req)[COOKIE];
  if (!tok) return false;
  const [exp, sig] = tok.split('.');
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now();
}

function requireAuth(req, res, next) {
  if (isAuthed(req)) return next();
  if (req.path.startsWith('/api')) return res.status(401).json({ error: 'Unauthorized' });
  return res.redirect('/admin/login');
}

// tiny in-memory rate limiter
function limiter(max, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const k = req.ip; const now = Date.now();
    const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    arr.push(now); hits.set(k, arr); next();
  };
}

module.exports = { checkPassword, issueSession, clearSession, isAuthed, requireAuth, limiter };
