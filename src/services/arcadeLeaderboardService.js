/**
 * Arcade Leaderboard Service
 * Manages local and global persistent high scores for all GBA games:
 * - Cyber Dino Run ('dino')
 * - Stark Flight ('stark')
 * - Shield Breaker ('shield')
 * - Matrix Snake ('snake')
 */

import { getStoredUser } from './portalService';

const LEADERBOARD_KEY = 'lc_arcade_leaderboard_v1';

// Initial pre-seeded community records from Foundry Builders & Core Whitelist
const DEFAULT_LEADERBOARD = [
  // CYBER DINO RUN
  { id: 'lb-1', gameId: 'dino', callsign: 'PARV', fullName: 'Parv Mishra', squad: 'ironman', score: 1840, date: '2026-10-18' },
  { id: 'lb-2', gameId: 'dino', callsign: 'KRISHNA', fullName: 'Krishna', squad: 'ironman', score: 1420, date: '2026-10-17' },
  { id: 'lb-3', gameId: 'dino', callsign: 'SHREYASH', fullName: 'Shreyash Shukla', squad: 'captain', score: 1190, date: '2026-10-19' },
  { id: 'lb-4', gameId: 'dino', callsign: 'PETER_P', fullName: 'Peter Parker', squad: 'tech', score: 980, date: '2026-10-16' },
  { id: 'lb-5', gameId: 'dino', callsign: 'TONY_S', fullName: 'Tony Stark', squad: 'ironman', score: 760, date: '2026-10-15' },

  // STARK FLIGHT
  { id: 'lb-6', gameId: 'stark', callsign: 'TONY_S', fullName: 'Tony Stark', squad: 'ironman', score: 2650, date: '2026-10-19' },
  { id: 'lb-7', gameId: 'stark', callsign: 'PARV', fullName: 'Parv Mishra', squad: 'ironman', score: 2180, date: '2026-10-18' },
  { id: 'lb-8', gameId: 'stark', callsign: 'RHODEY', fullName: 'James Rhodes', squad: 'ironman', score: 1640, date: '2026-10-17' },
  { id: 'lb-9', gameId: 'stark', callsign: 'KRISHNA', fullName: 'Krishna', squad: 'ironman', score: 1350, date: '2026-10-16' },
  { id: 'lb-10', gameId: 'stark', callsign: 'SHREYASH', fullName: 'Shreyash Shukla', squad: 'captain', score: 890, date: '2026-10-15' },

  // SHIELD BREAKER
  { id: 'lb-11', gameId: 'shield', callsign: 'STEVE_R', fullName: 'Steve Rogers', squad: 'captain', score: 1850, date: '2026-10-19' },
  { id: 'lb-12', gameId: 'shield', callsign: 'SHREYASH', fullName: 'Shreyash Shukla', squad: 'captain', score: 1540, date: '2026-10-18' },
  { id: 'lb-13', gameId: 'shield', callsign: 'BUCKY', fullName: 'Bucky Barnes', squad: 'captain', score: 1220, date: '2026-10-17' },
  { id: 'lb-14', gameId: 'shield', callsign: 'PARV', fullName: 'Parv Mishra', squad: 'ironman', score: 980, date: '2026-10-16' },
  { id: 'lb-15', gameId: 'shield', callsign: 'SAM_W', fullName: 'Sam Wilson', squad: 'captain', score: 710, date: '2026-10-15' },

  // MATRIX SNAKE
  { id: 'lb-16', gameId: 'snake', callsign: 'BANNER', fullName: 'Bruce Banner', squad: 'hulk', score: 1240, date: '2026-10-19' },
  { id: 'lb-17', gameId: 'snake', callsign: 'KRISHNA', fullName: 'Krishna', squad: 'ironman', score: 1020, date: '2026-10-18' },
  { id: 'lb-18', gameId: 'snake', callsign: 'PARV', fullName: 'Parv Mishra', squad: 'ironman', score: 860, date: '2026-10-17' },
  { id: 'lb-19', gameId: 'snake', callsign: 'NATALIA', fullName: 'Natasha Romanoff', squad: 'pr', score: 740, date: '2026-10-16' },
  { id: 'lb-20', gameId: 'snake', callsign: 'SHREYASH', fullName: 'Shreyash Shukla', squad: 'captain', score: 530, date: '2026-10-15' }
];

export function getLeaderboard(gameId = 'all') {
  if (typeof window === 'undefined') return [];
  let entries = [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    } else {
      entries = [...DEFAULT_LEADERBOARD];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    }
  } catch (_) {
    entries = [...DEFAULT_LEADERBOARD];
  }

  // Filter by gameId if not 'all'
  if (gameId && gameId !== 'all') {
    entries = entries.filter(e => e.gameId === gameId);
  }

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

export function submitScore(gameId, score, customCallsign = null) {
  if (typeof window === 'undefined' || !score || score <= 0) return null;

  // Retrieve current active user if signed into portal
  const currentUser = getStoredUser();
  const rawCallsign = customCallsign || (currentUser ? currentUser.fullName : localStorage.getItem('lc_gba_player_callsign') || 'GUEST');
  
  // Format clean callsign (max 10 uppercase chars)
  const callsign = String(rawCallsign).toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 10) || 'CHEF';
  const squad = currentUser?.targetSquad || localStorage.getItem('lc_gba_player_squad') || 'ironman';
  const fullName = currentUser?.fullName || callsign;

  const newEntry = {
    id: `lb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gameId,
    callsign,
    fullName,
    squad,
    score,
    date: new Date().toISOString().split('T')[0]
  };

  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    let entries = raw ? JSON.parse(raw) : [...DEFAULT_LEADERBOARD];
    entries.push(newEntry);

    // Keep top 100 overall
    entries.sort((a, b) => b.score - a.score);
    if (entries.length > 100) entries = entries.slice(0, 100);

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (_) {}

  // Attempt backend API sync asynchronously if available
  try {
    fetch('/api/portal/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    }).catch(() => {});
  } catch (_) {}

  return newEntry;
}

export function getPlayerPersonalBest(gameId) {
  if (typeof window === 'undefined') return 0;
  const keyMap = {
    dino: 'lc_gba_dino_hi',
    stark: 'lc_gba_stark_hi',
    shield: 'lc_gba_shield_hi',
    snake: 'lc_gba_snake_hi'
  };
  const key = keyMap[gameId];
  return key ? parseInt(localStorage.getItem(key) || '0', 10) : 0;
}
