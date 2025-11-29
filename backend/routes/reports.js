const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  overview,
  tutorMetrics,
  studentMetrics,
  sessionMetrics,
  feedbackSummary,
  exportReport,
} = require('../controllers/reportController');

const router = express.Router();

router.use(auth, roleCheck(['admin']));
router.get('/overview', overview);
router.get('/tutor-metrics', tutorMetrics);
router.get('/student-metrics', studentMetrics);
router.get('/session-metrics', sessionMetrics);
router.get('/feedback-summary', feedbackSummary);
router.post('/export', exportReport);

module.exports = router;
