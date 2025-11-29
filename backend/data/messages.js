const { users } = require('./users');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

// Build some conversations between tutor/member/admin
const member = users.find((u) => u.role === 'member');
const tutor = users.find((u) => u.role === 'tutor');
const admin = users.find((u) => u.role === 'admin');
const otherStudents = users.filter((u) => u.role === 'member').slice(1, 4);

const conversations = [
  {
    id: 'c-1',
    participants: [member.id, tutor.id],
    type: 'direct',
    lastMessage: null,
    unread: {},
    isMarked: false,
    isMuted: false,
  },
  {
    id: 'c-2',
    participants: [member.id, admin.id],
    type: 'direct',
    lastMessage: null,
    unread: {},
    isMarked: true,
    isMuted: false,
  },
  {
    id: 'c-3',
    participants: [tutor.id, ...otherStudents.map((s) => s.id)],
    type: 'group',
    lastMessage: null,
    unread: {},
    isMarked: false,
    isMuted: false,
  },
];

const messages = [];

function addMessage(conversationId, senderId, content, minutesAgo, attachments = []) {
  const msg = {
    id: uuidv4(),
    conversationId,
    senderId,
    content,
    attachments,
    timestamp: dayjs().subtract(minutesAgo, 'minute').toISOString(),
  };
  messages.push(msg);
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = { content: msg.content, timestamp: msg.timestamp, senderId: msg.senderId };
  }
}

// Seed a few realistic starter messages
addMessage('c-1', tutor.id, 'Chào em, buổi tới nhớ ôn lại chương 2 nhé.', 50);
addMessage('c-1', member.id, 'Dạ vâng ạ, em sẽ xem lại.', 40);
addMessage('c-1', tutor.id, 'Anh gửi slide tại đây.', 35, [{ id: 'file-1', name: 'slide-ch2.pdf', url: '/files/slide-ch2.pdf' }]);

addMessage('c-2', admin.id, 'Bạn có thắc mắc về lịch tư vấn không?', 120);
addMessage('c-2', member.id, 'Em cần cập nhật email, nhờ anh hỗ trợ.', 110);

otherStudents.forEach((s, idx) => {
  addMessage('c-3', s.id, `Em ${s.name} đã hoàn thành bài tập ${idx + 1}`, 30 - idx * 3);
});
addMessage('c-3', tutor.id, 'Cảm ơn các em, tuần tới sẽ có bài lab.', 10);

module.exports = { conversations, messages };
