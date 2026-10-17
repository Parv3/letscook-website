import { 
  verifySessionToken, 
  loadResources, 
  addResource, 
  deleteResource, 
  isCoreLeadership,
  recordAuditLog 
} from '../lib/portalDb.js';

export default async function handler(req, res) {
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
      const resources = loadResources();
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

    const { resourceId } = req.query || req.body || {};
    if (!resourceId) {
      return res.status(400).json({ success: false, error: 'Resource ID is required.' });
    }

    const deleted = deleteResource(resourceId);
    if (deleted) {
      recordAuditLog(payload, 'RESOURCE_DELETE', resourceId, {}, req.headers['x-forwarded-for'] || '');
      return res.status(200).json({ success: true, message: 'Resource deleted from vault.' });
    } else {
      return res.status(404).json({ success: false, error: 'Resource not found.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
