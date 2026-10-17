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
