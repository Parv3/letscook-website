import { loadStore, verifySessionToken } from '../lib/portalDb.js';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication token required.' });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
    }

    // ACID Isolation: Fetch only the user matching the verified token
    const store = loadStore();
    const user = store.profiles.find(p => p.id === payload.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        college: user.college,
        branch: user.branch,
        yearOfStudy: user.yearOfStudy,
        targetSquad: user.targetSquad,
        role: user.role,
        roleTitle: user.roleTitle,
        status: user.status,
        skills: user.skills || [],
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Error in portal me handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
