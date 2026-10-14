/**
 * Let's Cook - Certificate Import & Ingestion Engine
 * 
 * Usage:
 *   node scripts/import-certificates.js --event=origin-2026 --file=path/to/participants.csv
 *   node scripts/import-certificates.js --seed
 * 
 * Features:
 *   - Automatic deduplication by email (takes latest submission)
 *   - Name normalization (proper Title Case, whitespace trimming)
 *   - Unique sequential Credential ID generation (e.g. LC-ORIG-001)
 *   - Cryptographic verification hash generation
 *   - Multi-event support
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../src/data');
const CERTS_FILE = path.join(DATA_DIR, 'certificates.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// Sample dataset template for importing event participants
const SEED_ORIGIN_CSV = `Timestamp,Email address,Score,What's your full name? ,  Where can we reach you? 📩  (EMAIL),Phone Number,  Which year are you currently in?  ,  What's your branch / program ?
2026-10-10 16:00:00,builder1@example.com,0,Sample Builder,builder1@example.com,0000000000,1st Year,Computer Science`;


function toTitleCase(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => {
      // Special acronyms
      if (word.toUpperCase() === 'S' || word.toUpperCase() === 'M' || word.toUpperCase() === 'V' || word.toUpperCase() === 'H') {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line handling quotes
    const tokens = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        tokens.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    tokens.push(cur.trim());
    rows.push(tokens);
  }
  return rows;
}

export function importParticipants({ eventId = 'origin-2026', csvContent = null, filePath = null } = {}) {
  const rawCsv = csvContent || (filePath ? fs.readFileSync(filePath, 'utf8') : SEED_ORIGIN_CSV);
  const rows = parseCSV(rawCsv);

  let existingCerts = [];
  if (fs.existsSync(CERTS_FILE)) {
    try {
      existingCerts = JSON.parse(fs.readFileSync(CERTS_FILE, 'utf8'));
    } catch {
      existingCerts = [];
    }
  }

  // Remove previous entries for this event if re-importing
  const filteredExisting = existingCerts.filter(c => c.eventId !== eventId);

  // Group & deduplicate by normalized email (take the latest row)
  const participantMap = new Map();

  rows.forEach(parts => {
    if (parts.length < 4) return;
    const timestamp = parts[0] || '';
    const formEmail = (parts[1] || '').trim().toLowerCase();
    const rawName = parts[3] || '';
    const reachEmail = (parts[4] || formEmail).trim().toLowerCase();
    const phone = parts[5] || '';
    const year = parts[6] || '';
    const branch = parts[7] || '';

    const primaryEmail = reachEmail || formEmail;
    if (!primaryEmail || !rawName) return;

    participantMap.set(primaryEmail, {
      rawName,
      email: primaryEmail,
      phone,
      year,
      branch,
      timestamp
    });
  });

  const eventPrefix = eventId.includes('origin') ? 'LC-ORIG' : 'LC-' + eventId.toUpperCase().slice(0, 4);
  const newCerts = [];
  const dispatchRows = [
    ["Full Name", "Email", "Phone", "Branch", "Certificate ID", "Verification Code", "Direct Verification Link"]
  ];
  let index = 1;

  for (const [email, p] of participantMap.entries()) {
    const certId = `${eventPrefix}-${String(index).padStart(3, '0')}`;
    const cleanName = toTitleCase(p.rawName);

    // Cryptographic 6-digit verification code
    const rawHash = crypto.createHash('sha256').update(`${email}|${certId}|LETSCOOK_VERIFY_KEY_2026`).digest('hex');
    const verificationCode = String((parseInt(rawHash.slice(0, 8), 16) % 900000) + 100000);

    // Cryptographic verification hash
    const hashPayload = `${certId}|${eventId}|${email}|${cleanName}|Let's Cook`;
    const verifyHash = crypto.createHash('sha256').update(hashPayload).digest('hex').slice(0, 12).toUpperCase();

    const directLink = `https://letscook.co.in/verify?code=${verificationCode}`;

    newCerts.push({
      id: certId,
      eventId: eventId,
      verificationCode: verificationCode,
      verifyHash: verifyHash,
      recipient: {
        name: cleanName,
        email: email,
        year: p.year,
        branch: p.branch
      },
      credentialType: 'Certificate of Participation',
      issueDate: 'October 10, 2026',
      status: 'active'
    });

    dispatchRows.push([
      `"${cleanName}"`,
      `"${email}"`,
      `"${p.phone}"`,
      `"${p.branch}"`,
      `"${certId}"`,
      `"${verificationCode}"`,
      `"${directLink}"`
    ]);

    index++;
  }

  const merged = [...filteredExisting, ...newCerts];

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(CERTS_FILE, JSON.stringify(merged, null, 2), 'utf8');

  // Also write the email dispatch CSV for organizers
  const dispatchCsvPath = path.resolve(__dirname, '../participants-email-dispatch.csv');
  const csvContentOutput = dispatchRows.map(r => r.join(',')).join('\n');
  fs.writeFileSync(dispatchCsvPath, csvContentOutput, 'utf8');

  console.log(`Successfully imported ${newCerts.length} certificates for event [${eventId}].`);
  console.log(`Saved email dispatch list to: participants-email-dispatch.csv`);
  console.log(`Total database count: ${merged.length} certificates.`);
  return merged;
}

// CLI runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let eventId = 'origin-2026';
  let filePath = null;

  args.forEach(arg => {
    if (arg.startsWith('--event=')) eventId = arg.split('=')[1];
    if (arg.startsWith('--file=')) filePath = arg.split('=')[1];
  });

  importParticipants({ eventId, filePath });
}
