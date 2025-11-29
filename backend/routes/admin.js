const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
  updateRole,
} = require('../controllers/userController');

const router = express.Router();

router.use(auth, roleCheck(['admin']));

router.get('/users', adminList);
router.post('/users', adminCreate);
router.put('/users/:id', adminUpdate);
router.delete('/users/:id', adminDelete);
router.patch('/users/:id/role', updateRole);

module.exports = router;
