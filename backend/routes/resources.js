const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  listResources,
  uploadResource,
  deleteResource,
  downloadResource,
  tutorProgress,
  updateProgress,
  adminBackups,
  createBackup,
} = require('../controllers/resourceController');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads', 'resources');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

router.use(auth);
router.get('/', listResources);
router.get('/:id/download', downloadResource);
router.post('/upload', roleCheck(['tutor', 'admin']), upload.single('file'), uploadResource);
router.delete('/:id', roleCheck(['tutor', 'admin']), deleteResource);

router.get('/tutor/progress', roleCheck(['tutor']), tutorProgress);
router.put('/tutor/progress/:id', roleCheck(['tutor']), updateProgress);

router.get('/admin/backups', roleCheck(['admin']), adminBackups);
router.post('/admin/backup', roleCheck(['admin']), createBackup);

module.exports = router;
