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
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json({ success: true, leaderboard: data });
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

      list.push(entry);
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
