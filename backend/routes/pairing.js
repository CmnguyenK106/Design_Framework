const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  listTutors,
  sendPairRequest,
  tutorList,
  tutorAction,
  pairedList,
} = require('../controllers/pairingController');

const router = express.Router();

router.use(auth);

router.get('/tutors', listTutors);
router.post('/tutors/:id/pair-request', roleCheck(['member']), sendPairRequest);
router.get('/tutor/pair-requests', roleCheck(['tutor']), tutorList);
router.put('/tutor/pair-requests/:id', roleCheck(['tutor']), tutorAction);
router.get('/paired', roleCheck(['tutor', 'member']), pairedList);

module.exports = router;
