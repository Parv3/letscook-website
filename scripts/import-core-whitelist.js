/**
 * Let's Cook - Core Member Whitelist Importer
 * 
 * Usage:
 *   node scripts/import-core-whitelist.js --file=path/to/coremembers.csv
 * 
 * Expected CSV columns (case-insensitive):
 *   Email, Role/Title, Full Name, Squad
 *   e.g.:
 *   email,role,name,squad
 *   president@letscook.co.in,President,John Doe,ironman
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../src/data');
const WHITELIST_FILE = path.join(DATA_DIR, 'core-whitelist.json');

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
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

    const rowObj = {};
    header.forEach((key, idx) => {
      rowObj[key] = (tokens[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(rowObj);
  }
  return rows;
}

export function importWhitelistFromCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(filePath, 'utf8');
  const rows = parseCSV(rawText);

  let currentWhitelist = {};
  if (fs.existsSync(WHITELIST_FILE)) {
    try {
      currentWhitelist = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
    } catch (_) {}
  }

  let count = 0;
  for (const row of rows) {
    // Find email column
    const emailKey = Object.keys(row).find(k => k.includes('email')) || 'email';
    const email = (row[emailKey] || '').toLowerCase().trim();
    if (!email || !email.includes('@')) continue;

    // Find role/title column
    const roleKey = Object.keys(row).find(k => k.includes('role') || k.includes('title') || k.includes('designation')) || 'role';
    const roleTitle = row[roleKey] || 'Core Council Head';

    // Find name column
    const nameKey = Object.keys(row).find(k => k.includes('name')) || 'name';
    const fullName = row[nameKey] || '';

    // Find squad column
    const squadKey = Object.keys(row).find(k => k.includes('squad') || k.includes('team')) || 'squad';
    const targetSquad = (row[squadKey] || 'ironman').toLowerCase();

    currentWhitelist[email] = {
      roleTitle,
      role: 'admin',
      fullName,
      targetSquad
    };
    count++;
  }

  fs.writeFileSync(WHITELIST_FILE, JSON.stringify(currentWhitelist, null, 2), 'utf8');
  console.log(`Successfully imported and whitelisted ${count} core members to ${WHITELIST_FILE}`);
}

// CLI Execution
const args = process.argv.slice(2);
const fileArg = args.find(a => a.startsWith('--file='));
if (fileArg) {
  const filePath = fileArg.split('=')[1];
  importWhitelistFromCSV(path.resolve(process.cwd(), filePath));
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("Usage: node scripts/import-core-whitelist.js --file=path/to/coremembers.csv");
}
