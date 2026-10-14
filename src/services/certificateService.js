import eventsData from '../data/events.json';

// In-memory indexed map for public event metadata
const eventMap = new Map();
eventsData.forEach(event => {
  eventMap.set(event.id, event);
  if (event.slug) eventMap.set(event.slug, event);
});

/**
 * Get all available events metadata
 */
export function getAllEvents() {
  return eventsData;
}

/**
 * Get event metadata by ID or slug
 */
export function getEventById(eventId) {
  if (!eventId) return null;
  return eventMap.get(eventId) || null;
}

/**
 * Verify and unlock a participant's certificate securely via the serverless API.
 * Never bundles or exposes private certificate registries to the client browser.
 */
export async function verifyAndGetCertificate({ code = '', email = '' } = {}) {
  const cleanCode = code ? code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim() : '';
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  if (!cleanCode) {
    return { success: false, error: 'Verification passkey is required.' };
  }

  try {
    const res = await fetch('/api/verify-passkey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: cleanCode, email: cleanEmail })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error verifying certificate via API:', err);
    return {
      success: false,
      error: 'Network error connecting to verification gateway. Please check your connection and try again.'
    };
  }
}
