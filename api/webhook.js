// Vercel serverless function.
// Web3Forms POSTs each submission here (once you set this URL as the
// webhook target on your Web3Forms Pro dashboard). This function then
// emails you the details via Gmail SMTP, using credentials stored as
// Vercel environment variables (never committed to the repo).

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};

    // Web3Forms sends the submitted form fields directly in the body,
    // alongside some of its own metadata. Pull out what we care about,
    // but fall back gracefully if a field wasn't present on a given form.
    const {
      name,
      email,
      message,
      tier,
      source,
      jobDesc,
      contact_opt_in,
      subject,
      from_name,
      ...rest
    } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const lines = [
      `Source: ${source || 'unknown'}`,
      `Name: ${name || '—'}`,
      `Email: ${email || '—'}`,
      tier ? `Tier: ${tier}` : null,
      contact_opt_in !== undefined ? `Opted in to contact: ${contact_opt_in}` : null,
      message ? `\nMessage:\n${message}` : null,
    ].filter(Boolean);

    // Include any other fields Web3Forms attached that we didn't
    // explicitly destructure above, so nothing silently gets dropped.
    const extraKeys = Object.keys(rest).filter(
      (k) => !['access_key', 'botcheck', 'replyto'].includes(k)
    );
    if (extraKeys.length) {
      lines.push('\nOther fields:');
      extraKeys.forEach((k) => lines.push(`${k}: ${rest[k]}`));
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.NOTIFY_TO,
      replyTo: email || undefined,
      subject: subject || `New submission${source ? ' — ' + source : ''}`,
      text: lines.join('\n'),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
};
