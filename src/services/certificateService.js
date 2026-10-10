import eventsData from '../data/events.json';
import certificatesData from '../data/certificates.json';

// In-memory indexed maps for O(1) performance under high traffic load
const eventMap = new Map();
eventsData.forEach(event => {
  eventMap.set(event.id, event);
  if (event.slug) eventMap.set(event.slug, event);
});

// Map of verification code -> certificate (Privacy-preserving access control)
const certByCodeMap = new Map();
// Map of email -> certificate
const certByEmailMap = new Map();
// Map of certId -> certificate
const certByIdMap = new Map();

certificatesData.forEach(cert => {
  if (cert.verificationCode) {
    const cleanCode = cert.verificationCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    certByCodeMap.set(cleanCode, cert);
  }
  if (cert.recipient?.email) {
    certByEmailMap.set(cert.recipient.email.toLowerCase().trim(), cert);
  }
  if (cert.id) {
    certByIdMap.set(cert.id.toUpperCase().trim(), cert);
  }
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
 * Verify and unlock a participant's certificate using their confidential verification code
 * Supports entering just the code (e.g. "547162") or email + code
 */
export function verifyAndGetCertificate({ code = '', email = '', certId = '' } = {}) {
  const cleanCode = code ? code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim() : '';
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const cleanId = certId ? certId.toUpperCase().trim() : '';

  // 1. Direct code match (Primary confidential method sent in email)
  if (cleanCode && certByCodeMap.has(cleanCode)) {
    const cert = certByCodeMap.get(cleanCode);
    // If email was also provided, double check it matches
    if (cleanEmail && cert.recipient.email.toLowerCase() !== cleanEmail) {
      return { success: false, error: 'Verification code does not match this email address.' };
    }
    return { 
      success: true, 
      certificate: { ...cert, event: getEventById(cert.eventId) } 
    };
  }

  // 2. Email + Code match
  if (cleanEmail && certByEmailMap.has(cleanEmail)) {
    const cert = certByEmailMap.get(cleanEmail);
    if (cleanCode && cert.verificationCode.toUpperCase() === cleanCode) {
      return { 
        success: true, 
        certificate: { ...cert, event: getEventById(cert.eventId) } 
      };
    } else if (cleanCode) {
      return { success: false, error: 'Invalid verification code for this email address.' };
    }
  }

  // 3. ID + Code match
  if (cleanId && certByIdMap.has(cleanId)) {
    const cert = certByIdMap.get(cleanId);
    if (cleanCode && cert.verificationCode.toUpperCase() === cleanCode) {
      return { 
        success: true, 
        certificate: { ...cert, event: getEventById(cert.eventId) } 
      };
    } else {
      return { success: false, error: 'Confidential verification code required to unlock this certificate.' };
    }
  }

  return { 
    success: false, 
    error: 'No matching certificate found. Please check your verification code sent via email.' 
  };
}

/**
 * Get quick statistics for the portal header without exposing participant identities
 */
export function getPortalStats() {
  return {
    totalIssued: certificatesData.length,
    totalEvents: eventsData.length,
    activeVerifications: certificatesData.filter(c => c.status === 'active').length
  };
}
