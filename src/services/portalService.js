// Let's Cook Community — Portal API Client Service

const TOKEN_KEY = 'letscook_portal_token';
const USER_KEY = 'letscook_portal_user';

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// 1. Dispatch 6-digit OTP
export async function sendPortalOtp(email) {
  const res = await fetch('/api/portal/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to dispatch verification passkey.');
  }
  return data;
}

// 2. Register New Member or Core Head
export async function registerPortalUser(formData) {
  const res = await fetch('/api/portal/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Registration failed.');
  }
  if (data.token && data.user) {
    saveSession(data.token, data.user);
  }
  return data;
}

// 3. Sign In Existing Member or Core Head
export async function loginPortalUser(credentials) {
  const res = await fetch('/api/portal/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Sign in failed.');
  }
  if (data.token && data.user) {
    saveSession(data.token, data.user);
  }
  return data;
}

// 4. Fetch Isolated User Profile
export async function getPortalMe() {
  const token = getStoredToken();
  if (!token) return null;

  const res = await fetch('/api/portal/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    clearSession();
    return null;
  }

  const data = await res.json();
  if (!res.ok || !data.success) {
    return null;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

// 5. Fetch Admin Roster & Telemetry (Core Heads only)
export async function getAdminRoster() {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated.');

  const res = await fetch('/api/portal/admin', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to load leadership roster.');
  }
  return data;
}

// 6. Execute Administrative Action (Approve, Reject, Reassign Squad, Promote)
export async function executeAdminAction(action, targetUserId, options = {}) {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated.');

  const res = await fetch('/api/portal/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action,
      targetUserId,
      ...options
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to execute administrative action.');
  }
  return data;
}

// 7. Update User Profile Details
export async function updatePortalProfile(updates) {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated.');

  const res = await fetch('/api/portal/me', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update profile.');
  }
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data.user;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (_) {
    throw new Error(`Server returned status ${res.status || '500'}. Please try again later.`);
  }
}

// 8. Fetch Vault Resources (Members and Admins) with Multi-Container Sync
export async function fetchPortalResources() {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Authentication required' };

  try {
    // Read locally deleted IDs
    let deletedSet = new Set();
    let localVault = [];
    try {
      deletedSet = new Set(JSON.parse(localStorage.getItem('letscook_deleted_resources') || '[]'));
      localVault = JSON.parse(localStorage.getItem('letscook_vault_resources_v2') || '[]').filter(r => !deletedSet.has(r.id));
    } catch (_) {}

    // Prepare sync header if client has locally uploaded resources
    let syncHeader = '';
    if (localVault.length > 0) {
      try {
        syncHeader = encodeURIComponent(JSON.stringify(localVault.slice(0, 10)));
      } catch (_) {}
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    if (syncHeader) headers['x-sync-resources'] = syncHeader;

    const res = await fetch('/api/portal/resources', { headers });

    if (res.status === 401) {
      return { success: false, error: 'Authentication required' };
    }

    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch resources.');
    }

    // Filter server response with deleted IDs
    let combined = (data.resources || []).filter(r => !deletedSet.has(r.id));
    
    // Merge any client-cached resources not yet on server
    localVault.forEach(lv => {
      if (!combined.some(r => r.id === lv.id) && !deletedSet.has(lv.id)) {
        combined.push(lv);
      }
    });

    try {
      localStorage.setItem('letscook_vault_resources_v2', JSON.stringify(combined));
    } catch (_) {}

    return { ...data, resources: combined };
  } catch (err) {
    console.error('fetchPortalResources error:', err);
    // Offline fallback to local cached vault
    try {
      const deletedSet = new Set(JSON.parse(localStorage.getItem('letscook_deleted_resources') || '[]'));
      const cached = JSON.parse(localStorage.getItem('letscook_vault_resources_v2') || '[]').filter(r => !deletedSet.has(r.id));
      if (cached.length > 0) {
        return { success: true, resources: cached, canUpload: true };
      }
    } catch (_) {}
    return { success: false, error: err.message || 'Failed to fetch resources' };
  }
}

// 9. Upload New Vault Resource (Restricted to Core Members)
export async function uploadPortalResource(resourcePayload) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/portal/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(resourcePayload)
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload resource.');
  }

  // Cache in local vault
  if (data.resource) {
    try {
      const current = JSON.parse(localStorage.getItem('letscook_vault_resources_v2') || '[]');
      current.unshift(data.resource);
      localStorage.setItem('letscook_vault_resources_v2', JSON.stringify(current));
    } catch (_) {}
  }

  return data;
}

// 10. Delete Resource (Restricted to Core Members)
export async function deletePortalResource(resourceId) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required.');

  // Clean local deleted storage cache
  try {
    const deletedList = JSON.parse(localStorage.getItem('letscook_deleted_resources') || '[]');
    if (!deletedList.includes(resourceId)) {
      deletedList.push(resourceId);
      localStorage.setItem('letscook_deleted_resources', JSON.stringify(deletedList));
    }
    const localVault = JSON.parse(localStorage.getItem('letscook_vault_resources_v2') || '[]');
    localStorage.setItem('letscook_vault_resources_v2', JSON.stringify(localVault.filter(r => r.id !== resourceId)));
  } catch (_) {}

  // Pass resourceId via both query parameter and body
  const res = await fetch(`/api/portal/resources?resourceId=${encodeURIComponent(resourceId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ resourceId, id: resourceId })
  });

  const data = await safeJson(res);
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete resource.');
  }
  return data;
}
