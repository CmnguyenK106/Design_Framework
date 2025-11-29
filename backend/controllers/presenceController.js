// Simple in-memory presence tracker for demo
const onlineMap = new Map();
const TIMEOUT_MS = 60 * 1000; // 1 minute considered online

function ping(req, res) {
  onlineMap.set(req.user.userId, Date.now());
  return res.json({ success: true, data: { ok: true } });
}

function getOnline(req, res) {
  const now = Date.now();
  const online = [];
  onlineMap.forEach((ts, userId) => {
    if (now - ts <= TIMEOUT_MS) online.push(userId);
  });
  return res.json({ success: true, data: online });
}

module.exports = { ping, getOnline };
