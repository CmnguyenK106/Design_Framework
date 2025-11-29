const dayjs = require('dayjs');
const { users } = require('./users');

const subjects = ['Cơ sở dữ liệu', 'CTDL & GT', 'Lập trình Web', 'Toán rời rạc', 'Hệ điều hành', 'Mạng máy tính', 'Phân tích thiết kế hệ thống'];
const locations = ['H1-101', 'H2-201', 'H6-404', 'Library', 'Online'];

const tutors = users.filter((u) => u.role === 'tutor');
const students = users.filter((u) => u.role === 'member');

const sessions = [];

function randomStudents(max) {
  const list = [];
  for (let i = 0; i < max; i += 1) {
    const pick = students[Math.floor(Math.random() * students.length)];
    if (!list.includes(pick.id)) list.push(pick.id);
  }
  return list;
}

function addSession(opts) {
  const tutor = tutors[opts.tutorIndex % tutors.length];
  const subject = subjects[opts.subjectIndex % subjects.length];
  const date = dayjs().add(opts.dayOffset, 'day');
  const maxStudents = opts.maxStudents || 10;
  const registeredStudents = randomStudents(Math.min(maxStudents, opts.registered || 0));
  const entry = {
    id: `s-${sessions.length + 1}`,
    tutorId: tutor.id,
    tutorName: tutor.name,
    subject,
    date: date.format('YYYY-MM-DD'),
    startTime: opts.startTime || '14:00',
    endTime: opts.endTime || '16:00',
    location: locations[opts.locationIndex % locations.length],
    type: opts.type || (Math.random() > 0.5 ? 'offline' : 'online'),
    link: opts.type === 'online' ? 'https://meet.hcmut.edu.vn/example' : null,
    maxStudents,
    registered: registeredStudents.length,
    status: opts.status,
    students: registeredStudents,
  };
  sessions.push(entry);
}

// 30 upcoming scheduled
for (let i = 0; i < 30; i += 1) {
  addSession({
    tutorIndex: i,
    subjectIndex: i,
    dayOffset: i + 1,
    registered: (i % 6) + 2,
    status: 'scheduled',
    locationIndex: i,
    type: i % 3 === 0 ? 'online' : 'offline',
  });
}

// 50 completed
for (let i = 0; i < 50; i += 1) {
  addSession({
    tutorIndex: i,
    subjectIndex: i + 2,
    dayOffset: -(i + 1),
    registered: (i % 8) + 4,
    status: 'completed',
    locationIndex: i,
    type: i % 4 === 0 ? 'online' : 'offline',
  });
}

// 10 cancelled (future)
for (let i = 0; i < 10; i += 1) {
  addSession({
    tutorIndex: i + 3,
    subjectIndex: i + 4,
    dayOffset: i + 5,
    registered: i % 3,
    status: 'cancelled',
    locationIndex: i,
    type: 'offline',
  });
}

// 10 past (for testing)
for (let i = 0; i < 10; i += 1) {
  addSession({
    tutorIndex: i + 5,
    subjectIndex: i + 5,
    dayOffset: -(20 + i),
    registered: (i % 5) + 1,
    status: 'scheduled',
    locationIndex: i,
    type: 'offline',
  });
}

// Ensure demo student has at least one completed session
sessions.push({
  id: `s-${sessions.length + 1}`,
  tutorId: tutors[0].id,
  tutorName: tutors[0].name,
  subject: 'Ôn tập React',
  date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '10:30',
  location: 'Online',
  type: 'online',
  link: 'https://meet.hcmut.edu.vn/demo',
  maxStudents: 10,
  registered: 1,
  status: 'completed',
  students: ['u-student-1'],
});

module.exports = { sessions };
