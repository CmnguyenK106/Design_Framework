const express = require('express');
const auth = require('../middleware/auth');
const { list, markRead, markAllRead, getSettings, updateSettings } = require('../controllers/notificationController');

const router = express.Router();

router.use(auth);
router.get('/', list);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markRead);
router.get('/settings/me', getSettings);
router.put('/settings/me', updateSettings);

module.exports = router;
