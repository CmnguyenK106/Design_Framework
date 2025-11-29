const { pairRequests } = require('../data/pairRequests');
const { users } = require('../data/users');
const { notifications } = require('../data/notifications');
const { v4: uuidv4 } = require('uuid');

function listTutors(req, res) {
  const tutors = users.filter((u) => u.role === 'tutor').map((u) => ({
    id: u.id,
    name: u.name,
    dept: u.khoa,
    skills: u.skills || [],
    rating: 4.5,
  }));
  return res.json({ success: true, data: tutors });
}

function sendPairRequest(req, res) {
  const tutorId = req.params.id;
  const tutor = users.find((u) => u.id === tutorId && u.role === 'tutor');
  if (!tutor) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tutor không tồn tại' } });
  }
  const exists = pairRequests.find(
    (p) => p.studentId === req.user.userId && p.tutorId === tutorId && p.status === 'pending',
  );
  if (exists) {
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Đã gửi yêu cầu trước đó' } });
  }
  const request = {
    id: uuidv4(),
    studentId: req.user.userId,
    studentName: users.find((u) => u.id === req.user.userId)?.name || 'Student',
    tutorId,
    tutorName: tutor.name,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  pairRequests.push(request);
  // notify tutor
  notifications.push({
    id: `n-${notifications.length + 1}`,
    recipientId: tutorId,
    type: 'pairing',
    title: 'Yêu cầu ghép cặp mới',
    content: `${request.studentName} muốn ghép cặp`,
    channels: ['in-app'],
    priority: 'normal',
    status: 'unread',
    createdAt: new Date().toISOString(),
  });
  return res.status(201).json({ success: true, data: request });
}

function tutorList(req, res) {
  const items = pairRequests.filter((p) => p.tutorId === req.user.userId);
  return res.json({ success: true, data: items });
}

function tutorAction(req, res) {
  const pr = pairRequests.find((p) => p.id === req.params.id && p.tutorId === req.user.userId);
  if (!pr) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Yêu cầu không tồn tại' } });
  }
  const { action } = req.body || {};
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: 'Hành động không hợp lệ' } });
  }
  pr.status = action === 'accept' ? 'accepted' : 'rejected';
  pr.updatedAt = new Date().toISOString();
  // push notification to student
  notifications.push({
    id: `n-${notifications.length + 1}`,
    recipientId: pr.studentId,
    type: 'pairing',
    title: action === 'accept' ? 'Yêu cầu ghép cặp được chấp nhận' : 'Yêu cầu ghép cặp bị từ chối',
    content: `${pr.tutorName} đã ${action === 'accept' ? 'chấp nhận' : 'từ chối'} yêu cầu ghép cặp của bạn`,
    channels: ['in-app'],
    priority: 'normal',
    status: 'unread',
    createdAt: new Date().toISOString(),
  });
  return res.json({ success: true, data: pr });
}

function pairedList(req, res) {
  const userId = req.user.userId;
  const role = req.user.role;
  const items = pairRequests.filter((p) => {
    if (role === 'tutor') return p.tutorId === userId && p.status === 'accepted';
    if (role === 'member') return p.studentId === userId && p.status === 'accepted';
    return false;
  });
  return res.json({ success: true, data: items });
}

module.exports = {
  listTutors,
  sendPairRequest,
  tutorList,
  tutorAction,
  pairedList,
};
