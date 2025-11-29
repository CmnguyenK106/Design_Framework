const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  list,
  getOne,
  create,
  update,
  remove,
  register,
  unregister,
} = require('../controllers/sessionController');

const router = express.Router();

router.get('/', auth, list);
router.get('/:id', auth, getOne);
router.post('/', auth, roleCheck(['tutor', 'admin']), create);
router.put('/:id', auth, roleCheck(['tutor', 'admin']), update);
router.delete('/:id', auth, roleCheck(['tutor', 'admin']), remove);
router.post('/:id/register', auth, roleCheck(['member']), register);
router.delete('/:id/unregister', auth, roleCheck(['member']), unregister);

module.exports = router;
