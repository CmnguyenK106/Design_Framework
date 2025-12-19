const fs = require('fs');
const path = require('path');
const { conversations, messages } = require('../data/messages');
const { UserModel } = require('../database/models');
const { v4: uuidv4 } = require('uuid');

async function listConversations(req, res) {
  try {
    const userId = req.user.userId;
    const userConversations = conversations.filter((c) => c.participants.includes(userId));
    
    // Fetch all users from database to get participant details
    const allUsers = await UserModel.findAll();
    
    const data = userConversations.map((c) => ({
      ...c,
      unreadCount: c.unread?.[userId] || 0,
      participantsDetail: c.participants.map((id) => {
        const u = allUsers.find((x) => x.id === id);
        return u ? {
          id: u.id, 
          name: u.name, 
          role: u.role, 
          email: u.email, 
          avatar: u.avatar,
        } : null;
      }).filter(Boolean),
    }));
    
    return res.json({ success: true, data });
  } catch (error) {
    console.error('List conversations error:', error);
    return res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load conversations' } 
    });
  }
}

function getMessages(req, res) {
  const convo = conversations.find((c) => c.id === req.params.id);
  if (!convo || !convo.participants.includes(req.user.userId)) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  const list = messages.filter((m) => m.conversationId === convo.id).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
  console.log(`[Messages] User ${req.user.userId} fetching conversation ${req.params.id}: ${list.length} messages`);
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
  console.log(`[Messages] User ${req.user.userId} sent message to conversation ${conversationId}. Total messages: ${messages.length}`);
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

async function searchUsers(req, res) {
  try {
    const q = (req.query.q || '').toLowerCase();
    
    // Get all users from database except current user and inactive users
    const allUsers = await UserModel.findAll();
    
    const base = allUsers
      .filter((u) => u.id !== req.user.userId)
      .filter((u) => u.status !== 'inactive');

    let result = base;
    
    // Filter by search query if provided
    if (q) {
      result = base.filter((u) => 
        `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(q)
      );
    }

    // Limit to 50 results
    result = result
      .slice(0, 50)
      .map((u) => ({
        id: u.id, 
        name: u.name, 
        username: u.username, 
        role: u.role, 
        email: u.email, 
        avatar: u.avatar,
      }));
      
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to search users' } 
    });
  }
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

function removeParticipant(req, res) {
  const convo = conversations.find((c) => c.id === req.params.id && c.participants.includes(req.user.userId));
  if (!convo) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hội thoại' } });
  }
  if (convo.type !== 'group') {
    return res.status(400).json({ success: false, error: { code: 'INVALID', message: 'Chỉ nhóm mới chỉnh sửa thành viên' } });
  }
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Thiếu userId' } });
  }
  convo.participants = convo.participants.filter((id) => id !== userId);
  if (convo.participants.length < 2) {
    // auto delete conversation nếu dưới 2 người
    const idx = conversations.findIndex((c) => c.id === convo.id);
    if (idx !== -1) conversations.splice(idx, 1);
    return res.json({ success: true, data: { message: 'Đã xóa hội thoại' } });
  }
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
  removeParticipant,
  searchUsers,
  markConversationRead,
};
