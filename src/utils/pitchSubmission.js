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
  // Replace with your Google Form ID:
  formId: import.meta.env.VITE_GOOGLE_FORM_ID || '',
  fields: {
    projectTitle: import.meta.env.VITE_GF_ENTRY_TITLE || 'entry.1000001',
    techStack: import.meta.env.VITE_GF_ENTRY_STACK || 'entry.1000002',
    description: import.meta.env.VITE_GF_ENTRY_DESC || 'entry.1000003',
    email: import.meta.env.VITE_GF_ENTRY_EMAIL || 'entry.1000004',
  }
};

/**
 * Submit pitch to Google Forms and mirror in local storage
 */
export async function submitPitchData({ projectTitle, techStack, description, email }) {
  const payload = {
    projectTitle,
    techStack,
    description,
    email,
    submittedAt: new Date().toISOString(),
  };

  // 1. Always backup locally in localStorage so nothing is ever lost
  try {
    const existingPitches = JSON.parse(localStorage.getItem('letscook_submitted_pitches') || '[]');
    existingPitches.push(payload);
    localStorage.setItem('letscook_submitted_pitches', JSON.stringify(existingPitches));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }

  // 2. Submit to Google Form if Form ID is configured
  if (GOOGLE_FORM_CONFIG.formId) {
    const formUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;
    const formData = new URLSearchParams();
    
    formData.append(GOOGLE_FORM_CONFIG.fields.projectTitle, projectTitle);
    formData.append(GOOGLE_FORM_CONFIG.fields.techStack, techStack);
    formData.append(GOOGLE_FORM_CONFIG.fields.description, description);
    formData.append(GOOGLE_FORM_CONFIG.fields.email, email);

    try {
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      return { success: true, method: 'google-form' };
    } catch (error) {
      console.error('Google Form submission error:', error);
      return { success: true, method: 'local-backup' };
    }
  } else {
    // Helpful log in developer console
    console.info(
      '%c[Let\'s Cook] Pitch saved to local storage! To stream directly to Google Sheets, configure GOOGLE_FORM_CONFIG in src/utils/pitchSubmission.js',
      'color: #ff2a6d; font-weight: bold;'
    );
    return { success: true, method: 'local-storage' };
  }
}
