const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { UserModel } = require('../database/models');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Demo accounts for login page display
const DEMO_USERS = [
  { username: 'admin', password: 'admin', role: 'admin', label: 'Admin Account' },
  { username: 'tutor', password: 'tutor', role: 'tutor', label: 'Tutor Account' },
  { username: '2312487', password: 'demo', role: 'member', label: 'Student Account' },
];

async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Vui lòng nhập MSSV và mật khẩu' },
      });
    }

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Sai MSSV hoặc mật khẩu' } });
    }
    if (!user.email_verified) {
      return res.status(403).json({ success: false, error: { code: 'EMAIL_NOT_VERIFIED', message: 'Email chưa được xác thực. Vui lòng kiểm tra email.' } });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Sai MSSV hoặc mật khẩu' },
      });
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });
    await UserModel.addRefreshToken(user.id, refreshToken);
    const { password: omitted, ...safeUser } = user; // remove password

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 7 * 24 * 3600 * 1000 });
    return res.json({
      success: true,
      data: {
        token,
        user: safeUser,
        demoAccounts: DEMO_USERS,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Login failed' },
    });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      const user = await UserModel.findByRefreshToken(refreshToken);
      if (user) {
        await UserModel.removeRefreshToken(user.id, refreshToken);
      }
    }
    // Clear cookie
    res.clearCookie('refreshToken');
    return res.json({ success: true, data: { message: 'Đã đăng xuất' } });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, error: { message: 'Logout failed' } });
  }
}

async function register(req, res) {
  try {
    const { username, password, name, email, mssv, role = 'member' } = req.body || {};

    // Validation
    if (!username || !password) {
      return res.status(400).json({ success: false, error: { message: 'Username và mật khẩu là bắt buộc' } });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: { message: 'Mật khẩu phải có ít nhất 6 ký tự' } });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Tên là bắt buộc' } });
    }

    if (!email || email.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Email là bắt buộc' } });
    }
    // Validate email domain
    const emailValue = email.trim();
    const domainRegex = /@hcmut\.edu\.vn$/i;
    if (!domainRegex.test(emailValue)) {
      return res.status(400).json({ success: false, error: { message: 'Email phải có định dạng @hcmut.edu.vn' } });
    }

    // Check if username already exists
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ success: false, error: { message: 'Username đã tồn tại' } });
    }

    // Check if email already exists
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, error: { message: 'Email đã được sử dụng' } });
    }

    // Check if MSSV already exists (if provided)
    const userMssv = mssv && mssv.trim() !== '' ? mssv.trim() : username;
    const existingMssv = await UserModel.findByMssv(userMssv);
    if (existingMssv) {
      return res.status(409).json({ success: false, error: { message: 'MSSV đã được sử dụng' } });
    }

    // Only allow registering as 'member' or 'tutor' (not admin)
    const allowedRoles = ['member', 'tutor'];
    const userRole = allowedRoles.includes(role) ? role : 'member';

    // Create new user (hash password, create verification token)
    const hashedPass = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // Create new user
    const newUser = await UserModel.create({
      id: uuidv4(),
      username: username.trim(),
      password: hashedPass,
      role: userRole,
      name: name.trim(),
      mssv: userMssv,
      email: email.trim(),
      phone: '',
      khoa: 'Khoa Khoa học và Kĩ thuật Máy tính',
      chuyenNganh: 'Công nghệ phần mềm',
      avatar: '/avatars/default.png',
      skills: [],
      settings: {
        emailNotif: true,
        appNotif: true,
        publicProfile: false,
        allowContact: true,
      },
      devices: [],
      refresh_tokens: [],
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      reset_token: null,
      reset_token_expires: null,
      status: 'active',
    });

    const { password: omitted, ...safeUser } = newUser;

    // Send verification email
    try {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'localhost', port: process.env.SMTP_PORT || 1025, secure: false });
      const verifyLink = `${FRONTEND_URL}/verify?token=${verificationToken}`;
      await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@tutorsupport.com', to: newUser.email, subject: 'Xác thực email - Tutor Support', text: `Click to verify: ${verifyLink}`, html: `Nhấn <a href="${verifyLink}">vào đây</a> để xác thực email.` });
    } catch (emailErr) {
      console.error('Error sending verification email:', emailErr);
    }

    // Don't auto issue tokens until email verification; send success response
    return res.status(201).json({ success: true, data: { user: safeUser, message: 'Đăng ký thành công, vui lòng xác thực email.' } });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Đăng ký thất bại',
    });
  }
}

// exported at bottom: login, logout, register, refresh, forgot, reset, verify
async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, error: { message: 'No refresh token provided' } });
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ success: false, error: { message: 'Invalid refresh token' } });
    }
    const user = await UserModel.findById(payload.userId);
    if (!user || !user.refresh_tokens || !user.refresh_tokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token revoked or invalid' } });
    }
    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    const { password: omitted, ...safeUser } = user;
    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ success: false, error: { message: 'Refresh failed' } });
  }
}

async function forgot(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: { message: 'Email required' } });
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(200).json({ success: true, data: { message: 'If email exists you will receive a reset link' } });
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour
    await UserModel.update(user.id, { reset_token: resetToken, reset_token_expires: resetExpires });
    // Send reset email
    try {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'localhost', port: process.env.SMTP_PORT || 1025, secure: false });
      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
      await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@tutorsupport.com', to: user.email, subject: 'Reset password token', text: `Reset: ${resetLink}`, html: `Reset your password <a href="${resetLink}">here</a>` });
    } catch (mailErr) {
      console.error('Forgot email sending error:', mailErr);
    }
    return res.json({ success: true, data: { message: 'If email exists you will receive a reset link' } });
  } catch (err) {
    console.error('Forgot error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
}

async function reset(req, res) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ success: false, error: { message: 'Token and new password required' } });
    const user = await UserModel.findByResetToken(token);
    if (!user) return res.status(400).json({ success: false, error: { message: 'Invalid or expired reset token' } });
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired reset token' } });
    }
    if (newPassword.length < 6) return res.status(400).json({ success: false, error: { message: 'Mật khẩu phải có ít nhất 6 ký tự' } });
    const hashed = await bcrypt.hash(newPassword, 12);
    await UserModel.updatePassword(user.id, hashed);
    // Clear reset token
    await UserModel.update(user.id, { reset_token: null, reset_token_expires: null });
    return res.json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (err) {
    console.error('Reset error:', err);
    return res.status(500).json({ success: false, message: 'Reset failed' });
  }
}

async function verify(req, res) {
  try {
    const token = req.params.token || req.body?.token;
    if (!token) return res.status(400).json({ success: false, error: { message: 'Verification token required' } });
    const user = await UserModel.findByVerificationToken(token);
    if (!user) return res.status(400).json({ success: false, error: { message: 'Invalid verification token' } });
    if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ success: false, error: { message: 'Verification token expired' } });
    }
    await UserModel.update(user.id, { email_verified: true, verification_token: null, verification_token_expires: null });
    return res.json({ success: true, data: { message: 'Email verified successfully' } });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ success: false, message: 'Verify failed' });
  }
}

module.exports = { login, logout, register, refresh, forgot, reset, verify };
