const { sessions } = require('../data/sessions');
const { feedbackList } = require('../data/feedback');
const { users } = require('../data/users');

function overview(req, res) {
  const totalSessions = sessions.length;
  const totalTutors = users.filter((u) => u.role === 'tutor').length;
  const totalStudents = users.filter((u) => u.role === 'member').length;
  const avgRating =
    feedbackList.reduce((sum, f) => sum + (f.ratings.quality || 0), 0) /
    (feedbackList.length || 1);

  const trendData = sessions.slice(0, 14).map((s, idx) => ({
    date: s.date,
    sessions: (idx % 5) + 5,
  }));

  return res.json({
    success: true,
    data: { totalSessions, totalTutors, totalStudents, avgRating: Number(avgRating.toFixed(2)), trendData },
  });
}

function tutorMetrics(req, res) {
  const tutors = users.filter((u) => u.role === 'tutor').slice(0, 10);
  const topTutors = tutors.map((t, idx) => ({
    id: t.id,
    name: t.name,
    sessions: 20 + idx,
    hours: 40 + idx * 2,
    rating: 4 + (idx % 3) * 0.2,
  }));
  return res.json({
    success: true,
    data: {
      activeTutors: tutors.length,
      activityRate: 92.5,
      avgHours: 12.5,
      recordRate: 88.0,
      topTutors,
    },
  });
}

function studentMetrics(req, res) {
  return res.json({
    success: true,
    data: {
      totalStudents: users.filter((u) => u.role === 'member').length,
      activeRate: 76.4,
      atRisk: 8,
      byDept: [
        { name: 'CNTT', value: 120 },
        { name: 'Cơ khí', value: 60 },
        { name: 'Điện', value: 50 },
      ],
    },
  });
}

function sessionMetrics(req, res) {
  return res.json({
    success: true,
    data: {
      totalHours: 520,
      successRate: 87,
      cancelRate: 6,
      topSubjects: [
        { name: 'CSDL', value: 40 },
        { name: 'CTDL & GT', value: 35 },
        { name: 'Lập trình Web', value: 30 },
      ],
      topDepartments: [
        { name: 'CNTT', value: 80 },
        { name: 'Cơ khí', value: 25 },
        { name: 'Điện', value: 22 },
      ],
    },
  });
}

function feedbackSummary(req, res) {
  const ratingsDist = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: feedbackList.filter((f) => f.ratings.quality === r).length,
  }));
  return res.json({
    success: true,
    data: {
      avgSatisfaction:
        feedbackList.reduce((sum, f) => sum + f.ratings.quality, 0) / (feedbackList.length || 1),
      totalFeedback: feedbackList.length,
      responseRate: 65,
      ratingsDist,
    },
  });
}

function exportReport(req, res) {
  return res.json({
    success: true,
    data: { file: 'report-demo.xlsx', type: req.body?.type || 'overview', format: req.body?.format || 'excel' },
  });
}

module.exports = {
  overview,
  tutorMetrics,
  studentMetrics,
  sessionMetrics,
  feedbackSummary,
  exportReport,
};
