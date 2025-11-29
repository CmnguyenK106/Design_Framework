const express = require('express');
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  updatePassword,
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.patch('/avatar', auth, updateAvatar);
router.put('/password', auth, updatePassword);

module.exports = router;
