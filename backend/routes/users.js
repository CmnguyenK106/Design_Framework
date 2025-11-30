const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  updatePassword,
} = require('../controllers/userController');

const router = express.Router();
const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });
const upload = multer({ dest: avatarDir, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.patch('/avatar', auth, upload.single('avatar'), updateAvatar);
router.put('/password', auth, updatePassword);

module.exports = router;
