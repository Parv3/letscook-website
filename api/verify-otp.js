import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function getCertificates() {
  try {
    const certPath = path.resolve(process.cwd(), 'src/data/certificates.json');
    if (fs.existsSync(certPath)) {
      return JSON.parse(fs.readFileSync(certPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading certificates.json:', err);
  }
  return [];
}

function getEvents() {
  try {
    const eventPath = path.resolve(process.cwd(), 'src/data/events.json');
    if (fs.existsSync(eventPath)) {
      return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading events.json:', err);
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, otp, expiresAt, token } = req.body || {};

    if (!email || !otp || !expiresAt || !token) {
      return res.status(400).json({ success: false, error: 'Missing verification parameters.' });
    }

    // Check expiration
    if (Date.now() > Number(expiresAt)) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new code.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Verify HMAC signature
    const secret = process.env.RESEND_API_KEY || 'letscook-default-secret-salt-2026';
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update(`${normalizedEmail}|${cleanOtp}|${expiresAt}`)
      .digest('hex');

    if (expectedToken !== token) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // Signature matches! Load certificate
    const certs = getCertificates();
    const events = getEvents();

    const participantCert = certs.find(
      c => c.recipient && c.recipient.email && c.recipient.email.toLowerCase().trim() === normalizedEmail
    );

    if (!participantCert) {
      return res.status(404).json({ success: false, error: 'Certificate record not found.' });
    }

    const event = events.find(e => e.id === participantCert.eventId) || events[0] || null;

    return res.status(200).json({
      success: true,
      certificate: {
        ...participantCert,
        event
      }
    });
  } catch (error) {
    console.error('Error in verify-otp handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying code.' });
  }
}
