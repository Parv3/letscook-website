/**
 * pitchSubmission: Handles transmitting pitch proposals into Google Form & Google Sheets
 * 
 * How to connect your own Google Sheet:
 * 1. Create a Google Form (e.g. titled "Let's Cook - Project Pitches")
 * 2. Add 4 fields (Short Answer / Paragraph):
 *    - "Project Title"
 *    - "Tech Stack"
 *    - "Project Description"
 *    - "Email or Discord Contact"
 * 3. In Google Forms: Click the 3 dots menu -> "Get pre-filled link" -> enter dummy values -> "Get link".
 * 4. Look at the copied URL:
 *    https://docs.google.com/forms/d/e/{FORM_ID}/viewform?entry.{ID1}=...&entry.{ID2}=...
 * 5. Update GOOGLE_FORM_CONFIG below with your FORM_ID and the 4 entry IDs!
 * 6. In Google Forms, switch to the "Responses" tab and click "Link to Sheets".
 *    Every submission from your website will instantly appear in that Google Sheet!
 */

export const GOOGLE_FORM_CONFIG = {
  formId: import.meta.env.VITE_GOOGLE_FORM_ID || '1FAIpQLSfI3jrnWBM1RJkitXjTCT9_UUFAiuhK7gpfb4VSVvZuwZUPrA',
  fields: {
    projectTitle: import.meta.env.VITE_GF_ENTRY_TITLE || 'entry.1129128780',
    techStack: import.meta.env.VITE_GF_ENTRY_STACK || 'entry.461833103',
    description: import.meta.env.VITE_GF_ENTRY_DESC || 'entry.1806044077',
    email: import.meta.env.VITE_GF_ENTRY_EMAIL || 'entry.1110776376',
  }
};

let lastPitchSubmissionTimestamp = 0;
const PITCH_SUBMIT_COOLDOWN_MS = 20 * 1000; // 20s cooldown between submissions

/**
 * Submit pitch to Google Forms and mirror in local storage
 */
export async function submitPitchData({ projectTitle, techStack, description, email, honeypot = '' }) {
  // 0. Bot protection: If honeypot is filled, silently discard
  if (honeypot && honeypot.trim().length > 0) {
    return { success: true, method: 'bot-filtered' };
  }

  // 1. Throttling protection
  const now = Date.now();
  if (now - lastPitchSubmissionTimestamp < PITCH_SUBMIT_COOLDOWN_MS) {
    const waitSec = Math.ceil((PITCH_SUBMIT_COOLDOWN_MS - (now - lastPitchSubmissionTimestamp)) / 1000);
    throw new Error(`Please wait ${waitSec} seconds before submitting another pitch.`);
  }
  lastPitchSubmissionTimestamp = now;

  const payload = {
    projectTitle: (projectTitle || '').trim().slice(0, 100),
    techStack: (techStack || '').trim().slice(0, 150),
    description: (description || '').trim().slice(0, 1000),
    email: (email || '').trim().slice(0, 100),
    submittedAt: new Date().toISOString(),
  };

  // 2. Always backup locally in localStorage so nothing is ever lost
  try {
    const existingPitches = JSON.parse(localStorage.getItem('letscook_submitted_pitches') || '[]');
    existingPitches.push(payload);
    localStorage.setItem('letscook_submitted_pitches', JSON.stringify(existingPitches));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }

  // 3. Submit to Google Form if Form ID is configured (Single reliable dispatch)
  if (GOOGLE_FORM_CONFIG.formId) {
    const formUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;

    try {
      const formData = new URLSearchParams();
      formData.append(GOOGLE_FORM_CONFIG.fields.projectTitle, payload.projectTitle);
      formData.append(GOOGLE_FORM_CONFIG.fields.techStack, payload.techStack);
      formData.append(GOOGLE_FORM_CONFIG.fields.description, payload.description);
      formData.append(GOOGLE_FORM_CONFIG.fields.email, payload.email);

      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
    } catch (e) {
      // Fallback to hidden iframe if fetch is blocked by browser policies
      try {
        let iframe = document.getElementById('gform_hidden_iframe');
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.id = 'gform_hidden_iframe';
          iframe.name = 'gform_hidden_iframe';
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        }

        const form = document.createElement('form');
        form.action = formUrl;
        form.method = 'POST';
        form.target = 'gform_hidden_iframe';
        form.style.display = 'none';

        const fields = [
          { name: GOOGLE_FORM_CONFIG.fields.projectTitle, value: payload.projectTitle },
          { name: GOOGLE_FORM_CONFIG.fields.techStack, value: payload.techStack },
          { name: GOOGLE_FORM_CONFIG.fields.description, value: payload.description },
          { name: GOOGLE_FORM_CONFIG.fields.email, value: payload.email },
        ];

        fields.forEach(({ name, value }) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          if (form.parentNode) form.parentNode.removeChild(form);
        }, 2000);
      } catch (iframeErr) {
        console.warn('Iframe fallback warning:', iframeErr);
      }
    }

    return { success: true, method: 'google-form' };
  } else {
    // Helpful log in developer console
    console.info(
      '%c[Let\'s Cook] Pitch saved to local storage! To stream directly to Google Sheets, configure GOOGLE_FORM_CONFIG in src/utils/pitchSubmission.js',
      'color: #ff2a6d; font-weight: bold;'
    );
    return { success: true, method: 'local-storage' };
  }
}
