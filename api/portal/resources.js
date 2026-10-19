import { 
  verifySessionToken, 
  loadResources, 
  addResource, 
  deleteResource, 
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

  // Security headers
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Verify Bearer Authentication Token
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Please login to access Let\'s Cook resources.' 
    });
  }

  const payload = verifySessionToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Session expired or invalid. Please login to access resources.' 
    });
  }

  const isCore = payload.role === 'admin';

  // 1. GET: Fetch resources (Available to all authenticated members & admins)
  if (req.method === 'GET') {
    try {
      let resources = loadResources();

      // Optional client-side vault sync for serverless multi-container instances
      const syncHeader = req.headers['x-sync-resources'];
      if (syncHeader && typeof syncHeader === 'string') {
        try {
          const clientResources = JSON.parse(decodeURIComponent(syncHeader));
          if (Array.isArray(clientResources)) {
            let hasNew = false;
            clientResources.forEach(cr => {
              if (cr && cr.id && !resources.some(r => r.id === cr.id)) {
                resources.push(cr);
                hasNew = true;
              }
            });
            if (hasNew) {
              saveResources(resources);
            }
          }
        } catch (_) {}
      }

      return res.status(200).json({
        success: true,
        resources,
        canUpload: isCore
      });
    } catch (err) {
      console.error('Failed to load resources:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve resources.' });
    }
  }

  // 2. POST: Upload new resource (RESTRICTED: ONLY CORE MEMBERS)
  if (req.method === 'POST') {
    if (!isCore) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only Core Team members have permission to upload resources.'
      });
    }

    try {
      const { title, description, category, targetSquad, fileType, url, tags } = req.body || {};

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Resource title is required.' });
      }

      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ success: false, error: 'Resource destination link or URL is required.' });
      }

      // Security: Validate URL protocol to block javascript: and data: XSS payloads
      const trimmedUrl = url.trim();
      let isValidProtocol = false;
      try {
        const parsed = new URL(trimmedUrl);
        isValidProtocol = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch (_) {
        isValidProtocol = false;
      }

      if (!isValidProtocol) {
        return res.status(400).json({ success: false, error: 'Invalid URL. Only secure http:// and https:// links are permitted.' });
      }

      const created = addResource({
        title,
        description,
        category,
        targetSquad,
        fileType,
        url,
        tags
      }, payload);

      recordAuditLog(
        payload, 
        'RESOURCE_UPLOAD', 
        created.id, 
        { title: created.title, category: created.category }, 
        req.headers['x-forwarded-for'] || ''
      );

      return res.status(201).json({
        success: true,
        resource: created,
        message: 'Resource published successfully to the Let\'s Cook vault.'
      });
    } catch (err) {
      console.error('Failed to publish resource:', err);
      return res.status(500).json({ success: false, error: 'Internal server error uploading resource.' });
    }
  }

  // 3. DELETE: Delete resource (RESTRICTED: ONLY CORE MEMBERS)
  if (req.method === 'DELETE') {
    if (!isCore) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only Core Team members can delete resources.'
      });
    }

    // Robust parsing of resourceId across query params, JSON body, or string body
    let targetResourceId = req.query?.resourceId || req.query?.id || req.body?.resourceId || req.body?.id;
    if (!targetResourceId && typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        targetResourceId = parsed?.resourceId || parsed?.id;
      } catch (_) {}
    }

    if (!targetResourceId) {
      return res.status(400).json({ success: false, error: 'Resource ID is required.' });
    }

    const deleted = deleteResource(targetResourceId);
    if (deleted) {
      recordAuditLog(payload, 'RESOURCE_DELETE', targetResourceId, {}, req.headers['x-forwarded-for'] || '');
      return res.status(200).json({ success: true, message: 'Resource deleted from vault.' });
    } else {
      return res.status(404).json({ success: false, error: 'Resource not found or already deleted.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
