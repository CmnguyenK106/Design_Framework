const { v4: uuidv4 } = require('uuid');
const { users } = require('../data/users');

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

function getProfile(req, res) {
  const user = sanitize(req.currentUser);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }
  return res.json({ success: true, data: user });
}

function updateProfile(req, res) {
  const user = req.currentUser;
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  const fields = ['name', 'email', 'phone', 'khoa', 'chuyenNganh', 'skills', 'settings'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  return res.json({ success: true, data: sanitize(user) });
}

function updateAvatar(req, res) {
  const user = req.currentUser;
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Chưa chọn ảnh' } });
  }
  user.avatar = `/uploads/avatars/${req.file.filename}`;
  return res.json({ success: true, data: { avatar: user.avatar } });
}

function updatePassword(req, res) {
  const user = req.currentUser;
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  const { currentPassword, newPassword } = req.body || {};
  if (user.password !== currentPassword) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Mật khẩu hiện tại không đúng' } });
  }
  user.password = newPassword;
  return res.json({ success: true, data: { message: 'Đổi mật khẩu thành công' } });
}

function adminList(req, res) {
  return res.json({ success: true, data: users.map(sanitize) });
}

function adminCreate(req, res) {
  const { username, password, role, name, email, mssv } = req.body || {};
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Thiếu thông tin bắt buộc' } });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Username đã tồn tại' } });
  }

  const newUser = {
    id: uuidv4(),
    username,
    password,
    role,
    name: name || username,
    email: email || `${username}@hcmut.edu.vn`,
    mssv: mssv || username,
    phone: '',
    khoa: 'Khoa CNTT',
    chuyenNganh: '',
    avatar: '/avatars/default.png',
    skills: [],
    settings: {
      emailNotif: true,
      appNotif: true,
      publicProfile: false,
      allowContact: true,
    },
    devices: [],
    status: 'active',
  };
  users.push(newUser);
  return res.status(201).json({ success: true, data: sanitize(newUser) });
}

function adminUpdate(req, res) {
  const target = users.find((u) => u.id === req.params.id);
  if (!target) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User không tồn tại' } });
  }

  const fields = ['name', 'email', 'phone', 'khoa', 'chuyenNganh', 'skills', 'status'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) target[field] = req.body[field];
  });
  return res.json({ success: true, data: sanitize(target) });
}

function adminDelete(req, res) {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User không tồn tại' } });
  }
  users.splice(index, 1);
  return res.json({ success: true, data: { message: 'Đã xóa user' } });
}

function updateRole(req, res) {
  const target = users.find((u) => u.id === req.params.id);
  if (!target) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User không tồn tại' } });
  }
  target.role = req.body.role || target.role;
  return res.json({ success: true, data: sanitize(target) });
}

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  updatePassword,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
  updateRole,
};
