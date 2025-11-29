const { users } = require('./users');
const dayjs = require('dayjs');

const types = ['session_reminder', 'pairing', 'feedback', 'progress', 'system'];
const channels = [['in-app'], ['in-app', 'email'], ['in-app', 'email', 'sms']];

const notifications = [];

for (let i = 0; i < 50; i += 1) {
  const recipient = users[i % users.length];
  const createdAt = dayjs().subtract(i, 'hour');
  notifications.push({
    id: `n-${i + 1}`,
    recipientId: recipient.id,
    type: types[i % types.length],
    title: `Thông báo ${i + 1}`,
    content: `Nội dung thông báo mẫu số ${i + 1} cho ${recipient.name}`,
    channels: channels[i % channels.length],
    priority: 'normal',
    status: i % 4 === 0 ? 'read' : 'unread',
    createdAt: createdAt.toISOString(),
    scheduledAt: null,
  });
}

module.exports = { notifications };
