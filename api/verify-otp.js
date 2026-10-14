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

// Brute force protection: Max 5 failed attempts per 15 minutes per IP
const FAILED_ATTEMPTS_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const failedAttemptsTracker = new Map();

function isIpLocked(ip) {
  const now = Date.now();
  const history = (failedAttemptsTracker.get(ip) || []).filter(ts => now - ts < FAILED_ATTEMPTS_WINDOW_MS);
  failedAttemptsTracker.set(ip, history);
  return history.length >= MAX_FAILED_ATTEMPTS;
}

function recordIpFailure(ip) {
  const now = Date.now();
  const history = (failedAttemptsTracker.get(ip) || []).filter(ts => now - ts < FAILED_ATTEMPTS_WINDOW_MS);
  history.push(now);
  failedAttemptsTracker.set(ip, history);
  return history.length;
}

function clearIpFailures(ip) {
  failedAttemptsTracker.delete(ip);
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

  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';

  if (isIpLocked(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many incorrect attempts. Please wait 15 minutes before trying again or request a new verification code.'
    });
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
    const secret = process.env.OTP_SECRET || process.env.RESEND_API_KEY || 'letscook-prod-salt-secret-hash';
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update(`${normalizedEmail}|${cleanOtp}|${expiresAt}`)
      .digest('hex');

    if (expectedToken !== token) {
      const attemptsCount = recordIpFailure(clientIp);
      const triesLeft = Math.max(0, MAX_FAILED_ATTEMPTS - attemptsCount);
      return res.status(400).json({
        success: false,
        error: triesLeft > 0 
          ? `Invalid verification code. (${triesLeft} tries remaining)` 
          : 'Too many incorrect attempts. Verification locked for 15 minutes.'
      });
    }

    // Signature matches! Clear any failed attempts
    clearIpFailures(clientIp);

    // Load certificate
    const certs = getCertificates();
    const events = getEvents();

    const participantCert = certs.find(
      c => c.recipient && c.recipient.email && c.recipient.email.toLowerCase().trim() === normalizedEmail
    );

    if (!participantCert) {
      return res.status(404).json({ success: false, error: 'Certificate record not found.' });
    }

    const event = events.find(e => e.id === participantCert.eventId) || events[0] || null;

    // Sanitize recipient payload (never leak extra PII)
    const sanitizedRecipient = {
      name: participantCert.recipient?.name || 'Builder',
      email: participantCert.recipient?.email || '',
      year: participantCert.recipient?.year || '',
      branch: participantCert.recipient?.branch || ''
    };

    return res.status(200).json({
      success: true,
      certificate: {
        ...participantCert,
        recipient: sanitizedRecipient,
        event
      }
    });
  } catch (error) {
    console.error('Error in verify-otp handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying code.' });
  }
}
