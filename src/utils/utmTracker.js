/**
 * Dynamic UTM Tracker Utility
 * Captures incoming UTM parameters from the URL and persists them in sessionStorage.
 * Appends tracked parameters to all outbound CTA links (e.g., Linktree).
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ltsid'];

export const captureUtmParams = () => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmData = {};

  UTM_KEYS.forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      utmData[key] = value;
    }
  });

  if (Object.keys(utmData).length > 0) {
    sessionStorage.setItem('letscook_utm', JSON.stringify(utmData));
  }
};

export const getTrackedUrl = (baseUrl) => {
  if (typeof window === 'undefined') return baseUrl;

  try {
    const url = new URL(baseUrl);
    const storedUtm = sessionStorage.getItem('letscook_utm');
    
    if (storedUtm) {
      const utmData = JSON.parse(storedUtm);
      Object.entries(utmData).forEach(([key, val]) => {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, val);
        }
      });
    }

    return url.toString();
  } catch (err) {
    return baseUrl;
  }
};
