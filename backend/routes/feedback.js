const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  completedSessions,
  submitFeedback,
  myHistory,
  tutorFeedback,
  markViewed,
  adminList,
} = require('../controllers/feedbackController');

const router = express.Router();

// Student
router.get('/sessions/completed', auth, roleCheck(['member']), completedSessions);
router.post('/', auth, roleCheck(['member']), submitFeedback);
router.get('/my-history', auth, roleCheck(['member']), myHistory);

// Tutor
router.get('/tutor', auth, roleCheck(['tutor']), tutorFeedback);
router.patch('/tutor/:id/mark-viewed', auth, roleCheck(['tutor']), markViewed);

// Admin
router.get('/admin', auth, roleCheck(['admin']), adminList);

module.exports = router;
