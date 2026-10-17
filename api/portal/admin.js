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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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

  try {
    // 1. Authenticate Session Token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication token required.' });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
    }

    const store = loadStore();
    const adminUser = store.profiles.find(p => p.id === payload.userId);

    // 2. Strict Role-Based Access Control (RBAC) Clearance Check
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Core Leadership Admin clearance required.'
      });
    }

    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';

    // 3. GET: Return Roster Metrics & Applicant Registry
    if (req.method === 'GET') {
      const profiles = store.profiles || [];

      // Compute Real-Time Telemetry
      const metrics = {
        total: profiles.length,
        approved: profiles.filter(p => p.status === 'approved').length,
        pending: profiles.filter(p => p.status === 'pending_review').length,
        rejected: profiles.filter(p => p.status === 'rejected').length,
        squads: {
          ironman: profiles.filter(p => p.targetSquad === 'ironman').length,
          captain: profiles.filter(p => p.targetSquad === 'captain').length,
          thor: profiles.filter(p => p.targetSquad === 'thor').length,
          hulk: profiles.filter(p => p.targetSquad === 'hulk' || p.targetSquad === 'core').length,
          core: profiles.filter(p => p.targetSquad === 'core').length
        },
        adminsCount: profiles.filter(p => p.role === 'admin').length,
        membersCount: profiles.filter(p => p.role === 'member').length
      };

      // Sanitize profile objects before returning
      const sanitizedProfiles = profiles.map(p => ({
        id: p.id,
        email: p.email,
        fullName: p.fullName,
        phone: p.phone,
        college: p.college,
        branch: p.branch,
        yearOfStudy: p.yearOfStudy,
        targetSquad: p.targetSquad,
        skills: p.skills || [],
        githubUrl: p.githubUrl,
        linkedinUrl: p.linkedinUrl,
        portfolioUrl: p.portfolioUrl,
        role: p.role,
        roleTitle: p.roleTitle,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        reviewedBy: p.reviewedBy,
        reviewedAt: p.reviewedAt
      }));

      return res.status(200).json({
        success: true,
        adminClearance: {
          name: adminUser.fullName,
          roleTitle: adminUser.roleTitle
        },
        metrics,
        profiles: sanitizedProfiles,
        auditLogs: (store.auditLogs || []).slice(0, 30)
      });
    }

    // 4. POST / PATCH: Administrative State Mutations (Approve, Reject, Reassign, Promote)
    if (req.method === 'POST' || req.method === 'PATCH') {
      const { action, targetUserId, newSquad, newRoleTitle } = req.body || {};

      if (!targetUserId) {
        return res.status(400).json({ success: false, error: 'targetUserId is required.' });
      }

      const targetIndex = store.profiles.findIndex(p => p.id === targetUserId);
      if (targetIndex === -1) {
        return res.status(404).json({ success: false, error: 'Target member profile not found.' });
      }

      const target = store.profiles[targetIndex];

      switch (action) {
        case 'approve':
          target.status = 'approved';
          target.reviewedBy = adminUser.id;
          target.reviewedAt = new Date().toISOString();
          target.updatedAt = new Date().toISOString();
          recordAuditLog(adminUser, 'member_approved', target.id, { targetEmail: target.email }, clientIp);
          break;

        case 'reject':
          target.status = 'rejected';
          target.reviewedBy = adminUser.id;
          target.reviewedAt = new Date().toISOString();
          target.updatedAt = new Date().toISOString();
          recordAuditLog(adminUser, 'member_rejected', target.id, { targetEmail: target.email }, clientIp);
          break;

        case 'reassign_squad':
          if (!['ironman', 'captain', 'thor', 'core'].includes(newSquad)) {
            return res.status(400).json({ success: false, error: 'Invalid squad division.' });
          }
          const prevSquad = target.targetSquad;
          target.targetSquad = newSquad;
          target.updatedAt = new Date().toISOString();
          recordAuditLog(adminUser, 'squad_reassigned', target.id, { prevSquad, newSquad }, clientIp);
          break;

        case 'promote_to_core':
          // Restrict to Founder or President
          const isSuperAdmin = ['Founder', 'President'].includes(adminUser.roleTitle);
          if (!isSuperAdmin) {
            return res.status(403).json({
              success: false,
              error: 'Only the Founder or President can promote members to Core Leadership.'
            });
          }
          target.role = 'admin';
          target.roleTitle = newRoleTitle || 'Core Council Head';
          target.status = 'approved';
          target.updatedAt = new Date().toISOString();
          recordAuditLog(adminUser, 'admin_promoted', target.id, { newRoleTitle: target.roleTitle }, clientIp);
          break;

        default:
          return res.status(400).json({ success: false, error: `Unrecognized action: ${action}` });
      }

      // Atomic commit
      store.profiles[targetIndex] = target;
      saveStore(store);

      return res.status(200).json({
        success: true,
        message: `Successfully executed ${action} for ${target.fullName}.`,
        updatedProfile: target
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in portal admin handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error executing admin action.' });
  }
}
