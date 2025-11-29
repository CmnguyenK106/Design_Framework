const { notifications } = require('../data/notifications');
const { users } = require('../data/users');

function list(req, res) {
  const { status, type } = req.query;
  let items = notifications.filter((n) => n.recipientId === req.user.userId);
  if (status) items = items.filter((n) => n.status === status);
  if (type) items = items.filter((n) => n.type === type);
  return res.json({ success: true, data: items });
}

function markRead(req, res) {
  const item = notifications.find((n) => n.id === req.params.id && n.recipientId === req.user.userId);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification không tồn tại' } });
  }
  item.status = 'read';
  return res.json({ success: true, data: item });
}

function markAllRead(req, res) {
  notifications.forEach((n) => {
    if (n.recipientId === req.user.userId) n.status = 'read';
  });
  const items = notifications.filter((n) => n.recipientId === req.user.userId);
  return res.json({ success: true, data: items });
}

function getSettings(req, res) {
  const user = users.find((u) => u.id === req.user.userId);
  return res.json({
    success: true,
    data: user?.notifSettings || {
      session: { inApp: true, email: true, sms: false },
      pairing: { inApp: true, email: true, sms: false },
      feedback: { inApp: true, email: true, sms: false },
      progress: { inApp: true, email: true, sms: false },
    },
  });
}

function updateSettings(req, res) {
  const user = users.find((u) => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }
  user.notifSettings = req.body || user.notifSettings;
  return res.json({ success: true, data: user.notifSettings });
}

module.exports = { list, markRead, markAllRead, getSettings, updateSettings };
