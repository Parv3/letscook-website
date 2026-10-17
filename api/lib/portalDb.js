import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Secret key for HMAC token signing
const JWT_SECRET = process.env.PORTAL_JWT_SECRET || process.env.SESSION_SECRET || 'letscook-secure-auth-salt-key-2026';
const CORE_PASSKEY = process.env.CORE_HEAD_PASSKEY || 'FOUNDRY-CORE-2026';

// Pre-Approved Core Leadership Whitelist Default Seeds
const DEFAULT_CORE_WHITELIST = {
  'parvmishra.connect@gmail.com': { roleTitle: 'Founder', role: 'admin', fullName: 'Parv Mishra' },
  'founder@letscook.co.in': { roleTitle: 'Founder', role: 'admin', fullName: 'Founder' },
  'president@letscook.co.in': { roleTitle: 'President', role: 'admin', fullName: 'President' },
  'vp@letscook.co.in': { roleTitle: 'Vice President', role: 'admin', fullName: 'Vice President' },
  'sec@letscook.co.in': { roleTitle: 'Secretary', role: 'admin', fullName: 'Secretary' },
  'techhead@letscook.co.in': { roleTitle: 'Tech Core Head', role: 'admin', fullName: 'Tech Head' },
  'prhead@letscook.co.in': { roleTitle: 'PR Core Head', role: 'admin', fullName: 'PR Head' },
  'eventshead@letscook.co.in': { roleTitle: 'Events Core Head', role: 'admin', fullName: 'Events Head' },
  'designhead@letscook.co.in': { roleTitle: 'Design Core Head', role: 'admin', fullName: 'Design Head' }
};

export function getCoreLeadershipWhitelist() {
  try {
    const whitelistPath = path.resolve(process.cwd(), 'src/data/core-whitelist.json');
    if (fs.existsSync(whitelistPath)) {
      const parsed = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
      return { ...DEFAULT_CORE_WHITELIST, ...parsed };
    }
  } catch (_) {}
  return DEFAULT_CORE_WHITELIST;
}

export const CORE_LEADERSHIP_WHITELIST = getCoreLeadershipWhitelist();

// Storage Path Resolver for Serverless & Local environments
function getStorageFilePath() {
  const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isVercel) {
    return path.join('/tmp', 'portal-registry.json');
  }
  const localDir = path.resolve(process.cwd(), 'src/data');
  if (!fs.existsSync(localDir)) {
    try { fs.mkdirSync(localDir, { recursive: true }); } catch (_) {}
  }
  return path.join(localDir, 'portal-registry.json');
}

// In-Memory cache with Write-Ahead persistence
let inMemoryStore = null;

// Initial state seed with representative student applications
const SEED_PROFILES = [
  {
    id: 'user-core-founder-001',
    email: 'parvmishra.connect@gmail.com',
    fullName: 'Parv Mishra',
    phone: '+91 9999999999',
    college: 'GLA University',
    branch: 'Computer Science & Engineering',
    yearOfStudy: '3rd Year',
    targetSquad: 'ironman',
    skills: ['React', 'Node.js', 'System Architecture', 'Rust'],
    githubUrl: 'https://github.com/Parv3',
    linkedinUrl: 'https://linkedin.com/in/parvmishra',
    portfolioUrl: 'https://letscook.co.in',
    role: 'admin',
    roleTitle: 'Founder',
    status: 'approved',
    createdAt: new Date('2026-09-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-01T10:00:00Z').toISOString()
  },
  {
    id: 'user-mem-001',
    email: 'payal.agarwal@example.com',
    fullName: 'Payal Agarwal',
    phone: '+91 9876543210',
    college: 'GLA University',
    branch: 'Computer Science & Engineering',
    yearOfStudy: '3rd Year',
    targetSquad: 'ironman',
    skills: ['Python', 'FastAPI', 'PyTorch', 'Next.js'],
    githubUrl: 'https://github.com/payal-agarwal',
    role: 'member',
    roleTitle: 'Community Member',
    status: 'approved',
    createdAt: new Date('2026-10-10T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-11T14:30:00Z').toISOString()
  },
  {
    id: 'user-mem-002',
    email: 'arjit.sharma@example.com',
    fullName: 'Arjit Sharma',
    phone: '+91 9812345678',
    college: 'GLA University',
    branch: 'Information Technology',
    yearOfStudy: '2nd Year',
    targetSquad: 'thor',
    skills: ['Competitive Coding', 'C++', 'Go', 'Algorithms'],
    githubUrl: 'https://github.com/arjit-sharma',
    role: 'member',
    roleTitle: 'Community Member',
    status: 'pending_review',
    createdAt: new Date('2026-10-13T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-10-13T09:15:00Z').toISOString()
  }
];

// ACID Atomic Store Reader
export function loadStore() {
  if (inMemoryStore) return inMemoryStore;
  const filePath = getStorageFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      inMemoryStore = JSON.parse(data);
      return inMemoryStore;
    }
  } catch (err) {
    console.error('Error reading portal store:', err);
  }

  // Fallback to seed data
  inMemoryStore = {
    profiles: [...SEED_PROFILES],
    auditLogs: [],
    otps: {}
  };
  saveStore(inMemoryStore);
  return inMemoryStore;
}

// ACID Atomic Store Writer using Temp-File Atomic Swap
export function saveStore(storeData) {
  inMemoryStore = storeData;
  const filePath = getStorageFilePath();
  const tmpPath = `${filePath}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    const serialized = JSON.stringify(storeData, null, 2);
    fs.writeFileSync(tmpPath, serialized, 'utf8');
    fs.renameSync(tmpPath, filePath);
    return true;
  } catch (err) {
    console.error('Error atomically saving portal store:', err);
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (_) {}
    return false;
  }
}

// ============================================================================
// Security & Token Utilities
// ============================================================================

// Cryptographic Timing-Safe Comparison
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Generate Secure Session Token
export function createSessionToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    roleTitle: user.roleTitle,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days expiration
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

// Verify and Parse Session Token
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
  if (!safeCompare(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Generate OTP Hash Token (Stateless verification)
export function createOtpToken(email, otp, expiresAt) {
  const data = `${email.toLowerCase()}|${otp}|${expiresAt}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ email: email.toLowerCase(), expiresAt, signature })).toString('base64url');
}

// Verify OTP Token
export function verifyOtpToken(email, otp, tokenString) {
  try {
    const { email: tokenEmail, expiresAt, signature } = JSON.parse(Buffer.from(tokenString, 'base64url').toString('utf8'));
    if (tokenEmail.toLowerCase() !== email.toLowerCase()) return false;
    if (Date.now() > expiresAt) return false;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${email.toLowerCase()}|${otp}|${expiresAt}`).digest('hex');
    return safeCompare(signature, expected);
  } catch (err) {
    return false;
  }
}

// Check Core Clearance
export function evaluateLeadershipRole(email, enteredPasskey) {
  const normalized = (email || '').toLowerCase().trim();
  const whitelist = getCoreLeadershipWhitelist();
  // 1. Check Pre-Approved Core Whitelist
  if (whitelist[normalized]) {
    return {
      isCore: true,
      role: 'admin',
      roleTitle: whitelist[normalized].roleTitle,
      fullName: whitelist[normalized].fullName || ''
    };
  }
  // 2. Check Core Security Passkey
  if (enteredPasskey && safeCompare(enteredPasskey.trim(), CORE_PASSKEY)) {
    return {
      isCore: true,
      role: 'admin',
      roleTitle: 'Core Council Head',
      fullName: ''
    };
  }
  // 3. Standard Community Member
  return {
    isCore: false,
    role: 'member',
    roleTitle: 'Community Member',
    fullName: ''
  };
}

// Rate Limiting Tracker
const rateLimitMap = new Map();

export function checkRateLimit(key, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const history = (rateLimitMap.get(key) || []).filter(ts => now - ts < windowMs);
  if (history.length >= maxRequests) {
    const waitSec = Math.ceil((history[0] + windowMs - now) / 1000);
    return { limited: true, waitSec };
  }
  history.push(now);
  rateLimitMap.set(key, history);
  return { limited: false, waitSec: 0 };
}

// Record Audit Log Entry
export function recordAuditLog(actor, action, targetId, details = {}, ip = '') {
  const store = loadStore();
  const entry = {
    id: `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    actorId: actor.userId,
    actorEmail: actor.email,
    actorRole: actor.roleTitle || actor.role,
    action,
    targetId,
    details,
    ipAddress: ip,
    createdAt: new Date().toISOString()
  };
  store.auditLogs = [entry, ...(store.auditLogs || []).slice(0, 999)]; // Keep last 1000 logs
  saveStore(store);
  return entry;
}
