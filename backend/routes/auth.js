const express = require('express');
const { login, logout, register, refresh, forgot, reset, verify } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot', forgot);
router.post('/reset', reset);
// Email verification disabled
// router.post('/verify', verify);

module.exports = router;
