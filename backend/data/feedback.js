const { sessions } = require('./sessions');
const { users } = require('./users');

const feedbackList = [];

function randomRating() {
  return {
    quality: Math.ceil(Math.random() * 5),
    knowledge: Math.ceil(Math.random() * 5),
    communication: Math.ceil(Math.random() * 5),
    helpfulness: Math.ceil(Math.random() * 5),
    timeManagement: Math.ceil(Math.random() * 5),
  };
}

for (let i = 0; i < 80; i += 1) {
  const session = sessions[i % sessions.length];
  const tutor = users.find((u) => u.id === session.tutorId);
  const studentId = session.students[0];
  const student = users.find((u) => u.id === studentId) || users.find((u) => u.role === 'member');
  feedbackList.push({
    id: `f-${i + 1}`,
    sessionId: session.id,
    studentId: student?.id || 'unknown',
    studentName: student?.name || 'Student',
    tutorId: tutor?.id || 'tutor',
    tutorName: tutor?.name || 'Tutor',
    subject: session.subject,
    ratings: randomRating(),
    goodPoints: 'Giảng dễ hiểu, đúng trọng tâm.',
    improvements: 'Thêm ví dụ thực tế.',
    comment: 'Buổi học hữu ích.',
    recommend: i % 5 !== 0,
    anonymous: false,
    status: 'published',
    tutorViewed: i % 3 === 0,
    createdAt: session.date,
  });
}

module.exports = { feedbackList };
