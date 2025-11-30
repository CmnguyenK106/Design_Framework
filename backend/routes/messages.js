const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  listConversations,
  getMessages,
  createConversation,
  toggleMark,
  toggleMute,
  deleteConversation,
  sendMessage,
  deleteMessage,
  uploadFile,
  downloadAttachment,
  searchUsers,
  markConversationRead,
  removeParticipant,
} = require('../controllers/messageController');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads', 'messages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

router.use(auth);
router.get('/conversations', listConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations', createConversation);
router.patch('/conversations/:id/mark', toggleMark);
router.patch('/conversations/:id/mute', toggleMute);
router.patch('/conversations/:id/read', markConversationRead);
router.delete('/conversations/:id', deleteConversation);

router.post('/', sendMessage);
router.delete('/:id', deleteMessage);
router.post('/upload-file', upload.single('file'), uploadFile);
router.get('/attachments/:id/download', downloadAttachment);
router.get('/users', searchUsers);
router.patch('/conversations/:id/remove', removeParticipant);

module.exports = router;
