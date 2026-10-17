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

    // Rate Limiting: Max 6 login verification attempts per 15 minutes per IP
    const ipCheck = checkRateLimit(`portal_login_ip:${clientIp}`, 6, 15 * 60 * 1000);
    if (ipCheck.limited) {
      return res.status(429).json({
        success: false,
        error: `Too many login attempts. Please wait ${ipCheck.waitSec} seconds.`
      });
    }

    const { email, otp, otpToken, corePasskey } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!otp || !otpToken) {
      return res.status(400).json({ success: false, error: 'Verification passkey (OTP) is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify OTP Cryptographically
    const isOtpValid = verifyOtpToken(normalizedEmail, String(otp).trim(), otpToken);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification passkey. Please request a new one.'
      });
    }

    // 2. Query Store Atomically
    const store = loadStore();
    let user = store.profiles.find(p => p.email.toLowerCase().trim() === normalizedEmail);

    if (!user) {
      // Automatic progressive onboarding: register profile on first OTP verification
      const roleData = evaluateLeadershipRole(normalizedEmail, corePasskey);
      const isCore = roleData.role === 'admin';
      user = {
        id: `user-${isCore ? 'core' : 'mem'}-${Date.now()}`,
        email: normalizedEmail,
        fullName: roleData.fullName || (isCore ? roleData.roleTitle : ''),
        phone: '',
        college: isCore ? 'Core Command' : '',
        branch: isCore ? 'Executive Council' : '',
        yearOfStudy: isCore ? 'Core' : '',
        targetSquad: isCore ? 'hulk' : 'ironman',
        skills: isCore ? ['Leadership', 'Governance'] : [],
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        role: roleData.role,
        roleTitle: roleData.roleTitle,
        status: isCore ? 'approved' : 'pending_review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.profiles.push(user);
      saveStore(store);
      recordAuditLog(
        { userId: user.id, email: user.email, roleTitle: user.roleTitle },
        isCore ? 'core_whitelisted_auto_onboarded' : 'member_auto_onboarded',
        user.id,
        { role: user.role, roleTitle: user.roleTitle },
        clientIp
      );
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'This account has been suspended by community governance.'
      });
    }

    // If Core passkey provided or email is now whitelisted, ensure role is elevated
    const roleData = evaluateLeadershipRole(normalizedEmail, corePasskey);
    if (roleData.role === 'admin' && user.role !== 'admin') {
      user.role = 'admin';
      user.roleTitle = roleData.roleTitle;
      user.status = 'approved';
      user.updatedAt = new Date().toISOString();
      saveStore(store);
      recordAuditLog(
        { userId: user.id, email: user.email, roleTitle: user.roleTitle },
        'admin_elevated_via_passkey',
        user.id,
        { roleTitle: user.roleTitle },
        clientIp
      );
    }

    // Update last login timestamp
    user.lastLoginAt = new Date().toISOString();
    saveStore(store);

    // 3. Issue Session Token
    const sessionToken = createSessionToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        college: user.college,
        branch: user.branch,
        yearOfStudy: user.yearOfStudy,
        targetSquad: user.targetSquad,
        role: user.role,
        roleTitle: user.roleTitle,
        status: user.status,
        skills: user.skills,
        githubUrl: user.githubUrl
      },
      token: sessionToken
    });
  } catch (error) {
    console.error('Error in portal login handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
}
