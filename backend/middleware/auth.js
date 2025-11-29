const { verifyToken } = require('../utils/jwt');
const { users } = require('../data/users');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing token' },
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    req.currentUser = users.find((u) => u.id === decoded.userId);
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid' },
    });
  }
};
