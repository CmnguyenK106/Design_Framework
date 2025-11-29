const dayjs = require('dayjs');
const { sessions } = require('../data/sessions');
const { users } = require('../data/users');

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Simple overlap checker for same day slots
const isOverlap = (a, b) => {
  if (a.date !== b.date) return false;
  const startA = toMinutes(a.startTime);
  const endA = toMinutes(a.endTime);
  const startB = toMinutes(b.startTime);
  const endB = toMinutes(b.endTime);
  return startA < endB && startB < endA;
};

function list(req, res) {
  const { status } = req.query;
  let result = sessions;
  if (status) {
    result = result.filter((s) => s.status === status);
  }
  return res.json({ success: true, data: result });
}

function getOne(req, res) {
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
  }
  return res.json({ success: true, data: session });
}

function create(req, res) {
  const payload = req.body || {};
  const now = dayjs();
  if (dayjs(payload.date).isBefore(now, 'day')) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TIME', message: 'Không tạo lịch trong quá khứ' } });
  }
  if (toMinutes(payload.endTime) - toMinutes(payload.startTime) < 30) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_DURATION', message: 'Thời lượng tối thiểu 30 phút' } });
  }

  const tutorId = req.user.userId;
  const newSession = {
    id: `s-${sessions.length + 1}`,
    tutorId,
    tutorName: users.find((u) => u.id === tutorId)?.name || 'Tutor',
    subject: payload.subject || 'Chủ đề chưa đặt',
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    location: payload.location || 'Online',
    type: payload.type || 'online',
    link: payload.link || null,
    maxStudents: payload.maxStudents || 10,
    registered: 0,
    status: 'scheduled',
    students: [],
  };

  const tutorConflicts = sessions.some((s) => s.tutorId === tutorId && s.status === 'scheduled' && isOverlap(s, newSession));
  if (tutorConflicts) {
    return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'Bị trùng lịch hiện có' } });
  }

  sessions.push(newSession);
  return res.status(201).json({ success: true, data: newSession });
}

function update(req, res) {
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
  }

  const payload = req.body || {};
  const updated = { ...session, ...payload };
  if (payload.startTime && payload.endTime) {
    if (toMinutes(updated.endTime) - toMinutes(updated.startTime) < 30) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_DURATION', message: 'Thời lượng tối thiểu 30 phút' } });
    }
  }

  const overlap = sessions.some((s) => s.id !== session.id && s.tutorId === session.tutorId && s.status === 'scheduled' && isOverlap(s, updated));
  if (overlap) {
    return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'Bị trùng lịch' } });
  }

  Object.assign(session, updated);
  return res.json({ success: true, data: session });
}

function remove(req, res) {
  const index = sessions.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
  }
  sessions.splice(index, 1);
  return res.json({ success: true, data: { message: 'Đã xóa session' } });
}

function register(req, res) {
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
  }
  if (session.status !== 'scheduled') {
    return res.status(400).json({ success: false, error: { code: 'NOT_AVAILABLE', message: 'Phiên không còn mở đăng ký' } });
  }
  if (session.registered >= session.maxStudents) {
    return res.status(400).json({ success: false, error: { code: 'FULL', message: 'Phiên đã full' } });
  }

  const studentId = req.user.userId;
  const hasConflict = sessions.some(
    (s) => s.students?.includes(studentId) && s.status === 'scheduled' && isOverlap(s, session),
  );
  if (hasConflict) {
    return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'Trùng lịch đã đăng ký' } });
  }

  if (!session.students.includes(studentId)) {
    session.students.push(studentId);
    session.registered = session.students.length;
  }
  return res.json({ success: true, data: session });
}

function unregister(req, res) {
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
  }
  const studentId = req.user.userId;
  session.students = session.students.filter((id) => id !== studentId);
  session.registered = session.students.length;
  return res.json({ success: true, data: session });
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  register,
  unregister,
};
