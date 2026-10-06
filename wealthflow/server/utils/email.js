// Configurable email service. If SMTP_* env vars are not set, emails are
// simply logged instead of sent — keeps the app fully functional in dev/demo
// environments without requiring a mail provider.
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:disabled] would send to ${to} — "${subject}": ${text}`);
    return { delivered: false, reason: 'SMTP not configured' };
  }
  try {
    await t.sendMail({ from: process.env.SMTP_FROM || 'WealthFlow <no-reply@wealthflow.app>', to, subject, text });
    return { delivered: true };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { delivered: false, reason: err.message };
  }
}

module.exports = { sendEmail };
