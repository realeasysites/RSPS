const nodemailer = require('nodemailer');

let transporter = null;
function getTransport() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: (Number(SMTP_PORT) || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  return transporter;
}

const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function notifyNewLead(l) {
  const to = process.env.NOTIFY_EMAIL;
  const t = getTransport();
  if (!to || !t) {
    console.log('[mailer] NOTIFY_EMAIL or SMTP not configured; lead saved only:', l.name, l.phone);
    return;
  }
  await t.sendMail({
    from: `"Rubino & Sons Website" <${process.env.SMTP_USER}>`,
    to,
    replyTo: l.email || undefined,
    subject: `New quote request: ${l.name} (${l.service || 'general'})`,
    html: `<h2>New quote request</h2>
      <p><b>Name:</b> ${esc(l.name)}<br><b>Phone:</b> ${esc(l.phone)}<br><b>Email:</b> ${esc(l.email)}<br>
      <b>Town:</b> ${esc(l.town)}<br><b>Service:</b> ${esc(l.service)}</p>
      <p><b>Details:</b><br>${esc(l.message).replace(/\n/g, '<br>')}</p>`
  });
}

module.exports = { notifyNewLead };
