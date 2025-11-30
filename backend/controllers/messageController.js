const fs = require('fs');
const path = require('path');
const { conversations, messages } = require('../data/messages');
const { users } = require('../data/users');
const { v4: uuidv4 } = require('uuid');

function listConversations(req, res) {
  const userId = req.user.userId;
  const data = conversations
    .filter((c) => c.participants.includes(userId))
    .map((c) => ({
      ...c,
      unreadCount: c.unread?.[userId] || 0,
      participantsDetail: c.participants.map((id) => {
        const u = users.find((x) => x.id === id);
        return { id: u?.id, name: u?.name, role: u?.role, email: u?.email };
      }),
    }));
  return res.json({ success: true, data });
}

function getMessages(req, res) {
  const convo = conversations.find((c) => c.id === req.params.id);
  if (!convo || !convo.participants.includes(req.user.userId)) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  const list = messages.filter((m) => m.conversationId === convo.id).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
  return res.json({ success: true, data: list });
}

function createConversation(req, res) {
  const { participantIds = [], type = 'direct', title } = req.body || {};
  const unique = Array.from(new Set([req.user.userId, ...participantIds]));
  if (unique.length < 2) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Cần ít nhất 2 người tham gia' } });
  }
  const convo = {
    id: `c-${conversations.length + 1}`,
    participants: unique,
    type,
    title: type === 'group' ? (title || `Nhóm ${conversations.length + 1}`) : undefined,
    lastMessage: null,
    unreadCount: 0,
    isMarked: false,
    isMuted: false,
  };
  conversations.push(convo);
  return res.status(201).json({ success: true, data: convo });
}

function toggleMark(req, res) {
  const convo = conversations.find((c) => c.id === req.params.id && c.participants.includes(req.user.userId));
  if (!convo) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  convo.isMarked = !convo.isMarked;
  return res.json({ success: true, data: convo });
}

function toggleMute(req, res) {
  const convo = conversations.find((c) => c.id === req.params.id && c.participants.includes(req.user.userId));
  if (!convo) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  convo.isMuted = !convo.isMuted;
  return res.json({ success: true, data: convo });
}

function deleteConversation(req, res) {
  const idx = conversations.findIndex((c) => c.id === req.params.id && c.participants.includes(req.user.userId));
  if (idx === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  conversations.splice(idx, 1);
  return res.json({ success: true, data: { message: 'Đã xóa hội thoại' } });
}

function sendMessage(req, res) {
  const { conversationId, content, attachments = [] } = req.body || {};
  const convo = conversations.find((c) => c.id === conversationId && c.participants.includes(req.user.userId));
  if (!convo) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  if (!content && attachments.length === 0) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Nội dung trống' } });
  }
  const msg = {
    id: uuidv4(),
    conversationId,
    senderId: req.user.userId,
    content: content || '',
    attachments,
    timestamp: new Date().toISOString(),
  };
  messages.push(msg);
  convo.lastMessage = { content: msg.content || 'Attachment', timestamp: msg.timestamp, senderId: msg.senderId };
  // Increase unread for others
  convo.participants.forEach((pid) => {
    if (!convo.unread) convo.unread = {};
    if (pid !== req.user.userId) {
      convo.unread[pid] = (convo.unread[pid] || 0) + 1;
    }
  });
  return res.status(201).json({ success: true, data: msg });
}

function deleteMessage(req, res) {
  const idx = messages.findIndex((m) => m.id === req.params.id && m.senderId === req.user.userId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tin nhắn không tồn tại' } });
  }
  messages.splice(idx, 1);
  return res.json({ success: true, data: { message: 'Đã xóa tin nhắn' } });
}

function uploadFile(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Chưa chọn file' } });
  }
  return res.status(201).json({
    success: true,
    data: {
      id: uuidv4(),
      name: file.originalname,
      size: file.size,
      url: `/uploads/messages/${file.filename}`,
      mime: file.mimetype,
    },
  });
}

function downloadAttachment(req, res) {
  const attachmentId = req.params.id;
  // Tìm attachment trong các message của user
  const msg = messages.find(
    (m) => m.attachments?.some((a) => a.id === attachmentId) && m.conversationId
      && conversations.some((c) => c.id === m.conversationId && c.participants.includes(req.user.userId)),
  );
  if (!msg) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tệp đính kèm' } });
  }
  const attachment = msg.attachments.find((a) => a.id === attachmentId);
  if (!attachment || !attachment.url) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tệp đính kèm' } });
  }
  const fileName = path.basename(attachment.url);
  const filePath = path.join(process.cwd(), 'uploads', 'messages', fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File không tồn tại trên server' } });
  }
  return res.download(filePath, attachment.name);
}

function searchUsers(req, res) {
  const q = (req.query.q || '').toLowerCase();
  const result = users
    .filter((u) => u.id !== req.user.userId && u.status !== 'inactive')
    .filter((u) => (q ? `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(q) : true))
    .slice(0, 20)
    .map((u) => ({
      id: u.id, name: u.name, username: u.username, role: u.role, email: u.email,
    }));
  return res.json({ success: true, data: result });
}

function markConversationRead(req, res) {
  const convo = conversations.find((c) => c.id === req.params.id && c.participants.includes(req.user.userId));
  if (!convo) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  if (!convo.unread) convo.unread = {};
  convo.unread[req.user.userId] = 0;
  return res.json({ success: true, data: convo });
}

module.exports = {
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
};
