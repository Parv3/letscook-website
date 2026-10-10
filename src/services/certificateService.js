import eventsData from '../data/events.json';
import certificatesData from '../data/certificates.json';

// In-memory indexed maps for O(1) performance under high traffic load
const eventMap = new Map();
eventsData.forEach(event => {
  eventMap.set(event.id, event);
  if (event.slug) eventMap.set(event.slug, event);
});

const certByIdMap = new Map();
certificatesData.forEach(cert => {
  certByIdMap.set(cert.id.toUpperCase(), cert);
});

/**
 * Get all available events
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
 * Lookup single certificate by ID
 */
export function getCertificateById(id) {
  if (!id) return null;
  const normalized = id.trim().toUpperCase();
  const cert = certByIdMap.get(normalized);
  if (!cert) return null;
  const event = getEventById(cert.eventId);
  return { ...cert, event };
}

/**
 * Multi-field instant search across ID, Recipient Name, and Email
 * Optimized with early exit for maximum traffic throughput
 */
export function searchCertificates({ query = '', eventId = 'all', limit = 20 } = {}) {
  const cleanQuery = query.trim().toLowerCase();
  
  return certificatesData
    .filter(cert => {
      // Event filter
      if (eventId && eventId !== 'all' && cert.eventId !== eventId) {
        return false;
      }
      
      // If query is empty, match all (subject to limit)
      if (!cleanQuery) return true;

      const idMatch = cert.id.toLowerCase().includes(cleanQuery);
      const nameMatch = cert.recipient.name.toLowerCase().includes(cleanQuery);
      const emailMatch = cert.recipient.email.toLowerCase().includes(cleanQuery);
      
      return idMatch || nameMatch || emailMatch;
    })
    .slice(0, limit)
    .map(cert => ({
      ...cert,
      event: getEventById(cert.eventId)
    }));
}

/**
 * Get quick statistics for the portal header
 */
export function getPortalStats() {
  return {
    totalIssued: certificatesData.length,
    totalEvents: eventsData.length,
    activeVerifications: certificatesData.filter(c => c.status === 'active').length
  };
}
