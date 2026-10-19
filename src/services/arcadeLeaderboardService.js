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

export function getPlayerCallsign() {
  if (typeof window === 'undefined') return 'PARV';
  const currentUser = getStoredUser();
  if (currentUser?.fullName) {
    return currentUser.fullName.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 10) || 'PARV';
  }
  return localStorage.getItem('lc_gba_player_callsign') || 'PARV';
}

export function setPlayerCallsign(newCallsign) {
  if (typeof window === 'undefined' || !newCallsign) return;
  const clean = String(newCallsign).toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 10) || 'PARV';
  localStorage.setItem('lc_gba_player_callsign', clean);

  // Update callsign across existing local entries
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) {
      let entries = JSON.parse(raw);
      entries = entries.map(e => (e.isPlayer ? { ...e, callsign: clean } : e));
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    }
  } catch (_) {}

  window.dispatchEvent(new CustomEvent('arcade_leaderboard_updated'));
  return clean;
}

export function getLeaderboard(gameId = 'all') {
  if (typeof window === 'undefined') return [];
  let entries = [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    } else {
      // Check if v1 has genuine player entries to migrate
      const rawV1 = localStorage.getItem('lc_arcade_leaderboard_v1');
      if (rawV1) {
        try {
          const v1List = JSON.parse(rawV1);
          entries = v1List.filter(e => !FAKE_MOCK_CALLSIGNS.has(e.callsign));
        } catch (_) {}
      }
    }
  } catch (_) {
    entries = [];
  }

  // Auto-sync personal best scores from lc_gba_*_hi so played scores NEVER disappear!
  const personalBests = [
    { gameId: 'dino', key: 'lc_gba_dino_hi' },
    { gameId: 'stark', key: 'lc_gba_stark_hi' },
    { gameId: 'shield', key: 'lc_gba_shield_hi' },
    { gameId: 'snake', key: 'lc_gba_snake_hi' }
  ];

  const currentUser = getStoredUser();
  const playerCallsign = getPlayerCallsign();
  const squad = currentUser?.targetSquad || localStorage.getItem('lc_gba_player_squad') || 'ironman';
  const fullName = currentUser?.fullName || (playerCallsign === 'PARV' ? 'Parv Mishra' : playerCallsign);

  let updated = false;
  personalBests.forEach(pb => {
    const hi = parseInt(localStorage.getItem(pb.key) || '0', 10);
    if (hi > 0) {
      // Check if a player entry already covers this score
      const existing = entries.find(e => e.gameId === pb.gameId && (e.isPlayer || e.callsign === playerCallsign || e.callsign === 'PARV'));
      if (!existing) {
        entries.push({
          id: `lb-hi-${pb.gameId}`,
          gameId: pb.gameId,
          callsign: playerCallsign,
          fullName,
          squad,
          score: hi,
          isPlayer: true,
          date: new Date().toISOString().split('T')[0]
        });
        updated = true;
      } else if (existing.score < hi) {
        existing.score = hi;
        existing.callsign = playerCallsign;
        existing.fullName = fullName;
        existing.squad = squad;
        existing.isPlayer = true;
        updated = true;
      }
    }
  });

  // Filter out any mock entries
  entries = entries.filter(e => !FAKE_MOCK_CALLSIGNS.has(e.callsign));

  if (updated) {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch (_) {}
  }

  // Filter by gameId if not 'all'
  if (gameId && gameId !== 'all') {
    entries = entries.filter(e => e.gameId === gameId);
  }

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

export async function fetchGlobalLeaderboard(gameId = 'all') {
  try {
    const res = await fetch('/api/portal/leaderboard');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        const rawLocal = localStorage.getItem(LEADERBOARD_KEY);
        let localEntries = rawLocal ? JSON.parse(rawLocal) : [];
        const remoteClean = data.leaderboard.filter(e => !FAKE_MOCK_CALLSIGNS.has(e.callsign));

        // Merge remote entries into local storage
        const seenIds = new Set(localEntries.map(e => e.id));
        remoteClean.forEach(re => {
          if (!seenIds.has(re.id)) {
            localEntries.push(re);
            seenIds.add(re.id);
          }
        });

        localEntries.sort((a, b) => b.score - a.score);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(localEntries));
        window.dispatchEvent(new CustomEvent('arcade_leaderboard_updated'));
      }
    }
  } catch (_) {}

  return getLeaderboard(gameId);
}

export function submitScore(gameId, score, customCallsign = null) {
  if (typeof window === 'undefined' || !score || score <= 0) return null;

  const currentUser = getStoredUser();
  const playerCallsign = customCallsign || getPlayerCallsign();
  const squad = currentUser?.targetSquad || localStorage.getItem('lc_gba_player_squad') || 'ironman';
  const fullName = currentUser?.fullName || (playerCallsign === 'PARV' ? 'Parv Mishra' : playerCallsign);

  // Update personal best immediately in localStorage
  const keyMap = {
    dino: 'lc_gba_dino_hi',
    stark: 'lc_gba_stark_hi',
    shield: 'lc_gba_shield_hi',
    snake: 'lc_gba_snake_hi'
  };
  const hiKey = keyMap[gameId];
  if (hiKey) {
    const prevHi = parseInt(localStorage.getItem(hiKey) || '0', 10);
    if (score > prevHi) {
      localStorage.setItem(hiKey, String(score));
    }
  }

  const newEntry = {
    id: `lb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gameId,
    callsign: playerCallsign,
    fullName,
    squad,
    score,
    isPlayer: true,
    date: new Date().toISOString().split('T')[0]
  };

  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    let entries = raw ? JSON.parse(raw) : [];

    // Filter out mock entries
    entries = entries.filter(e => !FAKE_MOCK_CALLSIGNS.has(e.callsign));

    // If player already has an entry for this game, update it if current score is higher
    const existingPlayerIdx = entries.findIndex(e => e.gameId === gameId && (e.isPlayer || e.callsign === playerCallsign));
    if (existingPlayerIdx >= 0) {
      if (score >= entries[existingPlayerIdx].score) {
        entries[existingPlayerIdx] = newEntry;
      }
    } else {
      entries.push(newEntry);
    }

    // Keep top 100 overall
    entries.sort((a, b) => b.score - a.score);
    if (entries.length > 100) entries = entries.slice(0, 100);

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (_) {}

  // Broadcast event so any open UI refreshes instantly
  try {
    window.dispatchEvent(new CustomEvent('arcade_leaderboard_updated', { detail: newEntry }));
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
