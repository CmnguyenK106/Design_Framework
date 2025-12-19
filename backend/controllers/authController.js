const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { UserModel } = require('../database/models');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send verification email with 6-digit code
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Xác thực email - Design Framework',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Xác thực email của bạn</h2>
        <p>Cảm ơn bạn đã đăng ký! Vui lòng sử dụng mã xác thực sau để hoàn tất đăng ký:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Mã xác thực này có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

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
    
    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isHashed = /^\$2[ayb]\$/.test(user.password);
    let isMatch = false;
    
    if (isHashed) {
      // Compare with hashed password
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Compare with plain text password (for legacy users)
      isMatch = password === user.password;
    }
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Sai MSSV hoặc mật khẩu' },
      });
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await UserModel.create({
      id: uuidv4(),
      username: username.trim(),
      password: hashedPassword,
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
      status: 'active',
    });

    const { password: omitted, ...safeUser } = newUser;

    // Auto-login after registration: generate tokens
    const accessToken = signToken({ userId: newUser.id, role: newUser.role });
    const refreshToken = signRefreshToken({ userId: newUser.id });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return success with tokens for auto-login
    return res.status(201).json({ 
      success: true, 
      data: { 
        user: safeUser, 
        token: accessToken,
        message: 'Đăng ký thành công!' 
      } 
    });
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
  // Disabled: requires reset_token and reset_token_expires columns
  return res.status(501).json({ 
    success: false, 
    error: { message: 'Tính năng đặt lại mật khẩu tạm thời không khả dụng' } 
  });
}

async function reset(req, res) {
  // Disabled: requires reset_token and reset_token_expires columns
  return res.status(501).json({ 
    success: false, 
    error: { message: 'Tính năng đặt lại mật khẩu tạm thời không khả dụng' } 
  });
}

async function verify(req, res) {
  // Disabled: email verification not required
  return res.status(501).json({ 
    success: false, 
    error: { message: 'Tính năng xác thực email tạm thời không khả dụng' } 
  });
}

module.exports = { login, logout, register, refresh, forgot, reset, verify };
