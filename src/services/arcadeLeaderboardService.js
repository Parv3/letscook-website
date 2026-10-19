/**
 * Arcade Leaderboard Service
 * Manages local and global persistent high scores for all GBA games:
 * - Cyber Dino Run ('dino')
 * - Stark Flight ('stark')
 * - Shield Breaker ('shield')
 * - Matrix Snake ('snake')
 */

import { getStoredUser } from './portalService';

const LEADERBOARD_KEY = 'lc_arcade_leaderboard_v2';

// Clean start: no fake/mock entries. Only actual player records.
const DEFAULT_LEADERBOARD = [];

const FAKE_MOCK_CALLSIGNS = new Set([
  'TONY_S', 'STEVE_R', 'RHODEY', 'BANNER', 'NATALIA', 
  'PETER_P', 'BUCKY', 'SAM_W', 'CLINT_B', 'THOR_O'
]);

export function getLeaderboard(gameId = 'all') {
  if (typeof window === 'undefined') return [];
  let entries = [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    } else {
      // Clear out old v1 mock cache if present
      localStorage.removeItem('lc_arcade_leaderboard_v1');
      entries = [];
    }
  } catch (_) {
    entries = [];
  }

  // Filter out any mock entries that might have persisted
  entries = entries.filter(e => !FAKE_MOCK_CALLSIGNS.has(e.callsign));

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
