const { users, DEMO_USERS } = require('../data/users');
const { signToken } = require('../utils/jwt');

function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Vui lòng nhập MSSV và mật khẩu' },
    });
  }

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Sai MSSV hoặc mật khẩu' },
    });
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  const { password: omitted, ...safeUser } = user; // remove password

  return res.json({
    success: true,
    data: {
      token,
      user: safeUser,
      demoAccounts: DEMO_USERS,
    },
  });
}

function logout(req, res) {
  return res.json({ success: true, data: { message: 'Đã đăng xuất' } });
}

module.exports = { login, logout };
