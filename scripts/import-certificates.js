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

// Default initial dataset from ORIGIN 2026 Google Form export
const SEED_ORIGIN_CSV = `Timestamp,Email address,Score,What's your full name? ,  Where can we reach you? 📩  (EMAIL),Phone Number,  Which year are you currently in?  ,  What's your branch / program ?
2026-10-10 16:32:40,shiv194819@gmail.com,0,Khushal Aggarwal,khushal2009aggarwal@gmail.com,9650071118,1st Year,AIML
2026-10-10 16:34:14,ishaansaxena0807@gmail.com,0,Ishaan Saxena,ishaansaxena0807@gmail.com,9634646697,1st Year,B.Tech CSE AIML
2026-10-10 16:34:52,saaaaam.5906@gmail.com,0,Samarth Yadav,saaaaam.5906@gmail.com,8953554956,1st Year,Btech cs
2026-10-10 16:36:09,saksham.pathak_cs.aiml26@gla.ac.in,0,Saksham Pathak ,saksham.pathak_cs.aiml26@gla.ac.in,7906717608,1st Year,B.tech cse aiml
2026-10-10 16:36:20,pandeyvishal2918@gmail.com,0,Vishal Pandey ,pandeyvishal2918@gmail.com,6307784013,1st Year,B.tech cse AIML
2026-10-10 16:36:51,dhara.agrawal_cs26@gla.ac.in,0,Dhara Agrawal ,dhara.agrawal_cs26@gla.ac.in,7579950715,1st Year,B. Tech Cs
2026-10-10 16:36:52,singhsisodiadushyant@gmail.com,0,Dushyant,singhsisodiadushyant@gmail.com,6282083496,1st Year,Btech Cse
2026-10-10 16:37:46,jitharman234@gmail.com,0,Harmanjit Kaur ,jitharman234@gmail.com,9464070907,3rd Year,BTech: CSE with specialization AI&ML
2026-10-10 16:40:54,sanjeevan28060@gmail.com,0,Sanjeevan M ,sanjeevans408@gmail.com,9047332065,4th Year,BE.CSE
2026-10-10 16:41:10,hinatalan113@gmail.com,0,Hina Talan,hinatalan113@gmail.com,8266051925,1st Year,B.Tech CS(AI/ML)
2026-10-10 16:41:30,anshhshuklaa123@gmail.com,0,ANSH SHUKLA,anshhshuklaa123@gmail.com,7267827615,3rd Year,CSE CORE
2026-10-10 16:42:02,ishaansaxena0807@gmail.com,0,Ishaan Saxena,ishaansaxena0807@gmail.com,9634646697,1st Year,B.Tech CSE AIML
2026-10-10 16:42:04,anantjain2145@gmail.com,0,Anant jain, anantjain2145@gmail.com,8003204363,1st Year,B.tech CSE- (aiml)
2026-10-10 16:55:07,abhishek.chaudhary_cs.aiml25@gla.ac.in,0,Abhishek Chuadhary,abhishek.chaudhary_cs.aiml25@gla.ac.in,7417994129,2nd Year,B.Tech CS(AIML)
2026-10-10 16:58:07,ananya.agrawal_cs26@gla.ac.in,0,Ananya Agrawal,ananya.agrawal_cs26@gla.ac.in,6307768077,1st Year,Btech CSE
2026-10-10 16:58:28,himankmehariya78@gmail.com,0,Himank Mehariya ,himankmehariya78@gmail.com,7505852542,1st Year,B.tech cse hons
2026-10-10 16:59:36,satyambhagat078@gmail.com,0,SATYAM BHAGAT,satyambhagat078@gmail.com,7549133870,1st Year,BTECH CSE(AIML)
2026-10-10 17:00:12,bjain7829@gmail.com,0,Bhavya Jain,bjain7829@gmail.com,7725917365,1st Year,B.Tech CSE (AIML)
2026-10-10 17:03:14,aditya.pachauri_cs26@gla.ac.in,0,Aditya Pachauri ,aditya.pachauri2023@gmail.com,7895954309,1st Year,BTECH CSE
2026-10-10 17:04:30,avanishmaurya2009@gmail.com,0,AVNISH KUMAR MAURYA,avanishmaurya2009@gmail.com,9125959718,1st Year,B TECH CSE(AL&ML)
2026-10-10 17:12:47,shukladivyansh929@gmail.com,0,Divyansh shukla ,Shukladivyansh929@gmail.com,7983529709,2nd Year,Bca core
2026-10-10 17:13:51,2728a8s@gmail.com,0,harsh tiwari,2728a8s@gmail.com,8127273700,1st Year,B.TECH CSE(AIML)
2026-10-10 17:19:52,suriyaprasanth495@gmail.com,0,SURIYAPRASANTH S,suriyaprasanth495@gmail.com,9688183041,1st Year,BSC (information technology)
2026-10-10 17:23:13,abhinav.dixit_cs.aiml25@gla.ac.in,0,Abhinav Dixit,abhidixit780@gmail.com,8218563238,2nd Year,CS(AIML)
2026-10-10 17:24:31,jitjaat09@gmail.com,0,Arjit Solanki,jitjaat09@gmail.com,8865881111,1st Year,Btech CSE AIML
2026-10-10 17:25:02,arya.rastogi_cs26@gla.ac.in,0,Arya Rastogi ,arya.rastogi_cs26@gla.ac.in,7454040453,1st Year,B.tech CS
2026-10-10 17:26:48,kmpayalshukla@gmail.com,0,Payal Shukla ,kmpayalshukla@gmail.com,8577818912,1st Year,B.tech CSE (AIML)
2026-10-10 18:20:08,rkesarwanithb@gmail.com,0,Riddhi kesarwani ,riddhi.kesarwani_cs26@gla.ac.in,7522080005,1st Year,Btech cs
2026-10-10 18:24:35,kamaleshramu1009@gmail.com,0,Kamalesh Ramu S V,kamaleshramu1009@gmail.com,9345389816,1st Year,B.Sc. AI & ML
2026-10-10 18:26:39,radhika.kaushik_cs26@gla.ac.in,0,Radhika Kaushik ,Kaushikradhika185@gmail.com,7817803517,1st Year,Btech cse
2026-10-10 18:36:48,soothebites7807@gmail.com,0,Yash Sharma,soothebites7807@gmail.com,9990074666,1st Year,B.Sc. CS
2026-10-10 18:48:04,kishan.gla_cs.aiml26@gla.ac.in,0,Kishan,kishan.gla_cs.aiml26@gla.ac.in ,9027537047,1st Year,Btech - computer science
2026-10-10 18:51:09,kishan.gla_cs.aiml26@gla.ac.in,0,Kishan,kishan.gla_cs.aiml26@gla.ac.in,9027537047,1st Year,Btech computer science
2026-10-10 21:20:28,parameshwaran1372005@gmail.com,0,Parameshwaran H,parameshwaran1372005@gmail.com,9025197736,4th Year,B.E CSE
2026-10-10 21:40:40,aastha.singh_cs.aiml26@gla.ac.in,0,Aastha Singh ,aastha.singh_cs.aiml26@gla.ac.in,6398232006,1st Year,B.tech
2026-10-10 21:45:10,mahi.porwal_cs26@gla.ac.in,0,Mahi Porwal ,mahi.porwal_cs26@gla.ac.in,7817055300,1st Year,Cse core`;

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
        phone: p.phone,
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
