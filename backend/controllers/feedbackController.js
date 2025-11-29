const { feedbackList } = require('../data/feedback');
const { sessions } = require('../data/sessions');
const { users } = require('../data/users');

const criteria = ['quality', 'knowledge', 'communication', 'helpfulness', 'timeManagement'];

function validateRatings(ratings) {
  if (!ratings) return false;
  return criteria.every((key) => {
    const v = ratings[key];
    return typeof v === 'number' && v >= 1 && v <= 5;
  });
}

function completedSessions(req, res) {
  const studentId = req.user.userId;
  const result = sessions.filter(
    (s) => s.status === 'completed' && s.students.includes(studentId),
  );
  return res.json({ success: true, data: result });
}

function submitFeedback(req, res) {
  const studentId = req.user.userId;
  const { sessionId, ratings, comment = '', goodPoints = '', improvements = '', recommend = false, anonymous = false } = req.body || {};
  const session = sessions.find((s) => s.id === sessionId);
  if (!session || !session.students.includes(studentId) || session.status !== 'completed') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_SESSION', message: 'Bạn chỉ có thể đánh giá các buổi đã hoàn thành' } });
  }

  if (!validateRatings(ratings)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_RATINGS', message: 'Cần chấm đủ 5 tiêu chí (1-5)' } });
  }

  if (comment.trim().length < 10) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_COMMENT', message: 'Nhận xét tối thiểu 10 ký tự' } });
  }

  const tutor = users.find((u) => u.id === session.tutorId);
  const student = users.find((u) => u.id === studentId);
  const newItem = {
    id: `f-${feedbackList.length + 1}`,
    sessionId,
    studentId,
    studentName: anonymous ? 'Ẩn danh' : student?.name || 'Student',
    tutorId: tutor?.id || session.tutorId,
    tutorName: tutor?.name || 'Tutor',
    subject: session.subject,
    ratings,
    goodPoints,
    improvements,
    comment,
    recommend: !!recommend,
    anonymous: !!anonymous,
    status: 'published',
    tutorViewed: false,
    createdAt: new Date().toISOString(),
  };
  feedbackList.unshift(newItem);
  return res.status(201).json({ success: true, data: newItem });
}

function myHistory(req, res) {
  const studentId = req.user.userId;
  const items = feedbackList.filter((f) => f.studentId === studentId);
  return res.json({ success: true, data: items });
}

function tutorFeedback(req, res) {
  const tutorId = req.user.userId;
  const items = feedbackList.filter((f) => f.tutorId === tutorId);
  const avg =
    items.reduce((sum, f) => sum + f.ratings.quality, 0) / (items.length || 1);
  return res.json({
    success: true,
    data: { items, stats: { total: items.length, avgQuality: Number(avg.toFixed(2)) } },
  });
}

function markViewed(req, res) {
  const tutorId = req.user.userId;
  const item = feedbackList.find((f) => f.id === req.params.id && f.tutorId === tutorId);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback không tồn tại' } });
  }
  item.tutorViewed = true;
  return res.json({ success: true, data: item });
}

function adminList(req, res) {
  return res.json({ success: true, data: feedbackList });
}

module.exports = {
  completedSessions,
  submitFeedback,
  myHistory,
  tutorFeedback,
  markViewed,
  adminList,
};
