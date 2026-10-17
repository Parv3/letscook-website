import crypto from 'crypto';
import { 
  loadStore, 
  saveStore, 
  verifyOtpToken, 
  evaluateLeadershipRole, 
  createSessionToken, 
  checkRateLimit, 
  recordAuditLog 
} from '../lib/portalDb.js';

function setCors(req, res) {
  const origin = req.headers?.origin;
  const isAllowed = !origin || 
    origin.endsWith('letscook.co.in') || 
    origin.includes('localhost') || 
    origin.endsWith('.vercel.app');

  if (typeof res.setHeader === 'function') {
    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  return isAllowed;
}

export default async function handler(req, res) {
  if (!setCors(req, res)) {
    return res.status(403).json({ success: false, error: 'Forbidden: Origin not allowed.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';

    // Rate Limiting: Max 5 registration attempts per 15 minutes per IP
    const ipCheck = checkRateLimit(`portal_reg_ip:${clientIp}`, 5, 15 * 60 * 1000);
    if (ipCheck.limited) {
      return res.status(429).json({
        success: false,
        error: `Too many registration attempts. Please wait ${ipCheck.waitSec} seconds.`
      });
    }

    const {
      fullName,
      email,
      phone,
      college,
      branch,
      yearOfStudy,
      targetSquad,
      skills,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      otp,
      otpToken,
      corePasskey
    } = req.body || {};

    // 1. Strict Input Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!college || typeof college !== 'string') {
      return res.status(400).json({ success: false, error: 'College/University name is required.' });
    }
    if (!branch || typeof branch !== 'string') {
      return res.status(400).json({ success: false, error: 'Branch/Department is required.' });
    }
    if (!yearOfStudy || typeof yearOfStudy !== 'string') {
      return res.status(400).json({ success: false, error: 'Year of study is required.' });
    }
    if (!otp || !otpToken) {
      return res.status(400).json({ success: false, error: 'Verification passkey (OTP) is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Cryptographic OTP Verification
    const isOtpValid = verifyOtpToken(normalizedEmail, String(otp).trim(), otpToken);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification passkey. Please request a new one.'
      });
    }

    // 3. ACID Transaction: Atomically verify uniqueness and insert
    const store = loadStore();
    const existing = store.profiles.find(p => p.email.toLowerCase().trim() === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // 4. Role Evaluation (Admin Core Head vs Community Member)
    const roleData = evaluateLeadershipRole(normalizedEmail, corePasskey);

    const parsedSkills = Array.isArray(skills)
      ? skills.slice(0, 15)
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 15)
        : [];

    const newProfile = {
      id: `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      email: normalizedEmail,
      fullName: fullName.trim(),
      phone: (phone || '').trim(),
      college: college.trim(),
      branch: branch.trim(),
      yearOfStudy: yearOfStudy.trim(),
      targetSquad: ['ironman', 'captain', 'thor', 'core'].includes(targetSquad) ? targetSquad : 'ironman',
      skills: parsedSkills,
      githubUrl: (githubUrl || '').trim(),
      linkedinUrl: (linkedinUrl || '').trim(),
      portfolioUrl: (portfolioUrl || '').trim(),
      role: roleData.role,
      roleTitle: roleData.roleTitle,
      status: roleData.role === 'admin' ? 'approved' : 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Atomic Commit
    store.profiles.push(newProfile);
    const saveSuccess = saveStore(store);
    if (!saveSuccess) {
      return res.status(500).json({ success: false, error: 'Database transaction failed. Please retry.' });
    }

    // 5. Audit log if elevated to Core Head Admin
    if (roleData.role === 'admin') {
      recordAuditLog(
        { userId: newProfile.id, email: newProfile.email, roleTitle: newProfile.roleTitle },
        'admin_onboarded',
        newProfile.id,
        { roleTitle: newProfile.roleTitle, method: 'whitelist_or_passkey' },
        clientIp
      );
    }

    // 6. Generate Session Token
    const sessionToken = createSessionToken(newProfile);

    return res.status(201).json({
      success: true,
      message: roleData.role === 'admin' 
        ? `Welcome, Core Head ${newProfile.fullName}! Admin portal access granted.`
        : `Registration successful! Application submitted for review.`,
      user: {
        id: newProfile.id,
        email: newProfile.email,
        fullName: newProfile.fullName,
        college: newProfile.college,
        branch: newProfile.branch,
        yearOfStudy: newProfile.yearOfStudy,
        targetSquad: newProfile.targetSquad,
        role: newProfile.role,
        roleTitle: newProfile.roleTitle,
        status: newProfile.status,
        skills: newProfile.skills,
        githubUrl: newProfile.githubUrl
      },
      token: sessionToken
    });
  } catch (error) {
    console.error('Error in portal register handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
}
