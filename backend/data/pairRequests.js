const { users } = require('./users');

const pairRequests = [];

const member = users.find((u) => u.role === 'member');
const tutor = users.find((u) => u.role === 'tutor');

if (member && tutor) {
  pairRequests.push({
    id: 'pr-1',
    studentId: member.id,
    studentName: member.name,
    tutorId: tutor.id,
    tutorName: tutor.name,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
}

module.exports = { pairRequests };
