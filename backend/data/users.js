const departments = [
  'Khoa Khoa học và Kĩ thuật Máy tính',
  'Khoa Cơ khí',
  'Khoa Điện - Điện tử',
  'Khoa Hóa',
  'Khoa Quản lý Công nghiệp',
  'Khoa Môi trường',
  'Khoa Kỹ thuật Xây dựng',
  'Khoa Khoa học Ứng dụng',
  'Khoa Vật lý Vật liệu',
];

const skillsPool = ['ReactJS', 'NodeJS', 'Python', 'Java', 'SQL', 'Data Viz', 'Docker', 'CI/CD', 'ML Basics', 'DevOps'];

const mustHavePeople = [
  { name: 'ThS. Lê Đình Thuận', mssv: 'AD0001', role: 'admin', username: 'admin', password: 'admin' },
  { name: 'Mai Xuân Phúc', mssv: '2312687', role: 'member' },
  { name: 'Ngô Chí Lực', mssv: '2312001', role: 'member' },
  { name: 'Văn Thái Quân', mssv: '2312861', role: 'member' },
  { name: 'Lưu Nguyễn Vũ', mssv: '2314058', role: 'member' },
  { name: 'Phan Thành Nghĩa', mssv: '2312275', role: 'member' },
  { name: 'Nguyễn Đại Phú Sang', mssv: '2312934', role: 'member' },
  { name: 'Huỳnh Hồ Nam', mssv: '2312159', role: 'member' },
  { name: 'Chu Minh Nguyễn', mssv: '2312332', role: 'member' },
];

const users = [];

function buildUser({
  id, username, password, role, name, mssv, email, department, status = 'active',
}) {
  return {
    id,
    username,
    password,
    role,
    name,
    mssv,
    email,
    phone: '0901234567',
    khoa: department,
    chuyenNganh: 'Công nghệ phần mềm',
    avatar: '/avatars/default.png',
    skills: skillsPool.slice(0, Math.max(2, Math.floor(Math.random() * skillsPool.length))),
    settings: {
      emailNotif: true,
      appNotif: true,
      publicProfile: false,
      allowContact: true,
    },
    devices: [{ id: 'dev-1', name: 'Chrome on Windows', lastLogin: '2025-11-27 10:30' }],
    status,
  };
}

// Add must-have accounts first (admin + named mentees)
mustHavePeople.forEach((p, idx) => {
  const username = p.username || p.mssv;
  const password = p.password || 'demo123';
  const email = `${username}@hcmut.edu.vn`;
  const dept = departments[idx % departments.length];
  users.push(buildUser({
    id: `u-required-${idx + 1}`,
    username,
    password,
    role: p.role,
    name: p.name,
    mssv: p.mssv,
    email,
    department: dept,
  }));
});

// Tutors: 10 accounts
for (let i = 1; i <= 10; i += 1) {
  const username = `tutor${i}`;
  const dept = departments[i % departments.length];
  users.push(buildUser({
    id: `u-tutor-${i}`,
    username,
    password: 'tutor',
    role: 'tutor',
    name: `Tutor ${i}`,
    mssv: `T${1000 + i}`,
    email: `${username}@hcmut.edu.vn`,
    department: dept,
  }));
}

// Mentees: ensure at least 39 more (besides mustHave mentees)
let menteeIndex = 1;
while (users.filter((u) => u.role === 'member').length < 39) {
  const dept = departments[menteeIndex % departments.length];
  const username = `st${2312400 + menteeIndex}`;
  users.push(buildUser({
    id: `u-student-${menteeIndex}`,
    username,
    password: 'demo',
    role: 'member',
    name: `Student ${menteeIndex}`,
    mssv: `${2312400 + menteeIndex}`,
    email: `${username}@hcmut.edu.vn`,
    department: dept,
  }));
  menteeIndex += 1;
}

// Fill up to 100 total records (inactive mock users)
let filler = 1;
while (users.length < 100) {
  const dept = departments[filler % departments.length];
  const username = `mock${filler}`;
  users.push(buildUser({
    id: `u-mock-${filler}`,
    username,
    password: 'demo',
    role: filler % 3 === 0 ? 'tutor' : 'member',
    name: `Mock User ${filler}`,
    mssv: `M${100000 + filler}`,
    email: `${username}@hcmut.edu.vn`,
    department: dept,
    status: filler <= 50 ? 'active' : 'inactive',
  }));
  filler += 1;
}

// Update DEMO_USERS list with accessible accounts (50 active accounts)
const activeUsers = users.filter((u) => u.status === 'active' && u.role !== 'admin');
const DEMO_USERS = [
  { username: 'admin', password: 'admin', role: 'admin', name: 'Admin' },
  ...activeUsers.slice(0, 49).map((u) => ({
    username: u.username,
    password: u.password,
    role: u.role,
    name: u.name,
  })),
];

module.exports = { users, DEMO_USERS };
