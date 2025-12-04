const { v4: uuidv4 } = require('uuid');
const { UserModel } = require('../database/models');

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  // Convert snake_case to camelCase for frontend
  if (rest.chuyen_nganh !== undefined) {
    rest.chuyenNganh = rest.chuyen_nganh;
    delete rest.chuyen_nganh;
  }
  return rest;
};

async function getProfile(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    return res.json({ success: true, data: sanitize(user) });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get profile' } });
  }
}

async function updateProfile(req, res) {
  try {
    const fields = ['name', 'email', 'phone', 'khoa', 'chuyenNganh', 'skills', 'settings'];
    const updates = {};
    
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await UserModel.update(req.user.userId, updates);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    return res.json({ success: true, data: sanitize(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update profile' } });
  }
}

async function updateAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Chưa chọn ảnh' } });
    }

    const avatar = `/uploads/avatars/${req.file.filename}`;
    const user = await UserModel.update(req.user.userId, { avatar });
    
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    return res.json({ success: true, data: { avatar: user.avatar } });
  } catch (error) {
    console.error('Update avatar error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update avatar' } });
  }
}

async function updatePassword(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Mật khẩu hiện tại không đúng' } });
    }

    await UserModel.updatePassword(req.user.userId, newPassword);
    return res.json({ success: true, data: { message: 'Đổi mật khẩu thành công' } });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update password' } });
  }
}

async function adminList(req, res) {
  try {
    const users = await UserModel.findAll();
    return res.json({ success: true, data: users.map(sanitize) });
  } catch (error) {
    console.error('Admin list error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get users' } });
  }
}

async function adminCreate(req, res) {
  try {
    const { username, password, role, name, email, mssv } = req.body || {};
    if (!username || !password || !role) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Thiếu thông tin bắt buộc' } });
    }

    const existing = await UserModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Username đã tồn tại' } });
    }

    const newUser = await UserModel.create({
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
    });

    return res.status(201).json({ success: true, data: sanitize(newUser) });
  } catch (error) {
    console.error('Admin create error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create user' } });
  }
}

async function adminUpdate(req, res) {
  try {
    const fields = ['name', 'email', 'phone', 'khoa', 'chuyenNganh', 'skills', 'status'];
    const updates = {};
    
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await UserModel.update(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User không tồn tại' } });
    }

    return res.json({ success: true, data: sanitize(user) });
  } catch (error) {
    console.error('Admin update error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update user' } });
  }
}

async function adminDelete(req, res) {
  try {
    const user = await UserModel.delete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User không tồn tại' } });
    }

    return res.json({ success: true, data: { message: 'Đã xóa user' } });
  } catch (error) {
    console.error('Admin delete error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete user' } });
  }
}

async function updateRole(req, res) {
  try {
    const user = await UserModel.update(req.params.id, { role: req.body.role });
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User không tồn tại' } });
    }

    return res.json({ success: true, data: sanitize(user) });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update role' } });
  }
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
