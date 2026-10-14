import fs from 'fs';
import path from 'path';

// Rate Limiting Configuration: max 4 failed attempts per 1 hour per IP
const RATE_LIMIT_MAX_ATTEMPTS = 4;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory tracking of failed attempts per client IP: Map<ip, Array<timestamp>>
const failedAttemptsByIp = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

function getRecentFailedAttempts(ip) {
  const now = Date.now();
  const timestamps = failedAttemptsByIp.get(ip) || [];
  const valid = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  failedAttemptsByIp.set(ip, valid);
  return valid;
}

function recordFailedAttempt(ip) {
  const attempts = getRecentFailedAttempts(ip);
  attempts.push(Date.now());
  failedAttemptsByIp.set(ip, attempts);
  return attempts;
}

function clearFailedAttempts(ip) {
  failedAttemptsByIp.delete(ip);
}

function getLockoutTimeRemaining(ip) {
  const attempts = getRecentFailedAttempts(ip);
  if (attempts.length < RATE_LIMIT_MAX_ATTEMPTS) return 0;
  const earliest = attempts[0];
  const now = Date.now();
  const remaining = earliest + RATE_LIMIT_WINDOW_MS - now;
  return remaining > 0 ? remaining : 0;
}

function loadCertificates() {
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

function loadEvents() {
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

function setCors(req, res) {
  const origin = req.headers.origin;
  const isAllowed = !origin || 
    origin.endsWith('letscook.co.in') || 
    origin.includes('localhost') || 
    origin.endsWith('.vercel.app');

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return isAllowed;
}

export default async function handler(req, res) {
  const isAllowedOrigin = setCors(req, res);
  if (!isAllowedOrigin) {
    return res.status(403).json({ success: false, error: 'Forbidden: Origin not allowed.' });
  }

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);

  // 1. Check Server-Side Rate Limiter
  const lockoutRemaining = getLockoutTimeRemaining(clientIp);
  if (lockoutRemaining > 0) {
    return res.status(429).json({
      success: false,
      error: 'Security lockout active: Maximum failed attempts reached (4 tries / 1 hour). Passkey entry is temporarily restricted.',
      locked: true,
      lockoutRemainingMs: lockoutRemaining
    });
  }

  try {
    const { code, email } = req.body || {};
    const cleanCode = (code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanCode) {
      return res.status(400).json({ success: false, error: 'Verification passkey is required.' });
    }

    const certificates = loadCertificates();
    const events = loadEvents();

    // Look for matching certificate
    const matchingCert = certificates.find(cert => {
      if (!cert.verificationCode) return false;
      const certCode = cert.verificationCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
      if (certCode !== cleanCode) return false;

      // If email was also specified, ensure it matches
      if (cleanEmail && cert.recipient?.email) {
        return cert.recipient.email.toLowerCase().trim() === cleanEmail;
      }
      return true;
    });

    if (matchingCert) {
      // Clear failed attempts on success
      clearFailedAttempts(clientIp);

      const event = events.find(e => e.id === matchingCert.eventId) || events[0] || null;

      // Sanitize recipient payload (never leak extra PII)
      const sanitizedRecipient = {
        name: matchingCert.recipient?.name || 'Builder',
        email: matchingCert.recipient?.email || '',
        year: matchingCert.recipient?.year || '',
        branch: matchingCert.recipient?.branch || ''
      };

      return res.status(200).json({
        success: true,
        certificate: {
          ...matchingCert,
          recipient: sanitizedRecipient,
          event
        }
      });
    }

    // Passkey not found -> Record failed attempt
    const updatedAttempts = recordFailedAttempt(clientIp);
    const count = updatedAttempts.length;
    const isLocked = count >= RATE_LIMIT_MAX_ATTEMPTS;
    const remainingMs = isLocked ? getLockoutTimeRemaining(clientIp) : 0;
    const remainingTries = Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - count);

    if (isLocked) {
      return res.status(429).json({
        success: false,
        error: 'Security lockout active: 4 failed attempts reached. Passkey entry is locked for 1 hour. You can still verify anytime via your registered email.',
        locked: true,
        lockoutRemainingMs: remainingMs,
        remainingAttempts: 0
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid verification passkey.',
      remainingAttempts: remainingTries,
      locked: false,
      lockoutRemainingMs: 0
    });
  } catch (error) {
    console.error('Error in verify-passkey handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying passkey.' });
  }
}
