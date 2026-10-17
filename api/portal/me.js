import { loadStore, saveStore, verifySessionToken, recordAuditLog } from '../lib/portalDb.js';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT') {
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

    // Handle Profile Update (POST / PUT)
    if (req.method === 'POST' || req.method === 'PUT') {
      const updates = req.body || {};
      
      if (typeof updates.fullName === 'string') user.fullName = updates.fullName.trim();
      if (typeof updates.phone === 'string') user.phone = updates.phone.trim();
      if (typeof updates.college === 'string') user.college = updates.college.trim();
      if (typeof updates.branch === 'string') user.branch = updates.branch.trim();
      if (typeof updates.yearOfStudy === 'string') user.yearOfStudy = updates.yearOfStudy.trim();
      if (typeof updates.githubUrl === 'string') user.githubUrl = updates.githubUrl.trim();
      if (typeof updates.linkedinUrl === 'string') user.linkedinUrl = updates.linkedinUrl.trim();
      if (typeof updates.portfolioUrl === 'string') user.portfolioUrl = updates.portfolioUrl.trim();
      
      if (Array.isArray(updates.skills)) {
        user.skills = updates.skills.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof updates.skills === 'string') {
        user.skills = updates.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      const validSquads = ['ironman', 'captain', 'thor', 'hulk', 'core'];
      if (updates.targetSquad && validSquads.includes(updates.targetSquad.toLowerCase())) {
        user.targetSquad = updates.targetSquad.toLowerCase();
      }

      user.updatedAt = new Date().toISOString();
      saveStore(store);

      const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
      recordAuditLog(
        { userId: user.id, email: user.email, roleTitle: user.roleTitle },
        'profile_updated',
        user.id,
        { targetSquad: user.targetSquad },
        clientIp
      );
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
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Error in portal me handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
