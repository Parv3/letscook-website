import fs from 'fs';
import path from 'path';

function getLeaderboardFilePath() {
  const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isVercel) {
    return path.join('/tmp', 'portal-leaderboard.json');
  }
  const localDir = path.resolve(process.cwd(), 'src/data');
  return path.join(localDir, 'portal-leaderboard.json');
}

export default async function handler(req, res) {
  const filePath = getLeaderboardFilePath();

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(filePath)) {
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Deduplicate: strictly 1 highest score per user per game
        const bestMap = new Map();
        data.forEach(item => {
          const key = `${item.gameId}-${String(item.callsign || item.fullName).toUpperCase()}`;
          const existing = bestMap.get(key);
          if (!existing || item.score > existing.score) {
            bestMap.set(key, item);
          }
        });
        const deduplicated = Array.from(bestMap.values());
        deduplicated.sort((a, b) => b.score - a.score);
        return res.status(200).json({ success: true, leaderboard: deduplicated });
      }
    } catch (_) {}
    return res.status(200).json({ success: true, leaderboard: [] });
  }

  if (req.method === 'POST') {
    try {
      const entry = req.body;
      if (!entry || !entry.score) {
        return res.status(400).json({ success: false, error: 'Invalid score record' });
      }

      let list = [];
      if (fs.existsSync(filePath)) {
        try {
          list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (_) {
          list = [];
        }
      }

      // Check if entry for this player and game already exists
      const userKey = `${entry.gameId}-${String(entry.callsign || entry.fullName).toUpperCase()}`;
      const existingIdx = list.findIndex(e => `${e.gameId}-${String(e.callsign || e.fullName).toUpperCase()}` === userKey);

      if (existingIdx >= 0) {
        // Only update if new score is higher
        if (entry.score >= list[existingIdx].score) {
          list[existingIdx] = { ...list[existingIdx], ...entry };
        }
      } else {
        list.push(entry);
      }

      list.sort((a, b) => b.score - a.score);
      if (list.length > 100) list = list.slice(0, 100);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
      return res.status(200).json({ success: true, entry });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
