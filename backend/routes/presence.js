const express = require('express');
const auth = require('../middleware/auth');
const { ping, getOnline } = require('../controllers/presenceController');

const router = express.Router();

router.use(auth);
router.post('/ping', ping);
router.get('/online', getOnline);

module.exports = router;
