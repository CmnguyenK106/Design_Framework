const departments = [
  'Khoa CNTT',
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

const baseUsers = [
  { id: 'u-admin', username: 'admin', password: 'admin', role: 'admin', name: 'Admin User', mssv: 'A0001', email: 'admin@hcmut.edu.vn' },
  { id: 'u-tutor-1', username: 'tutor', password: 'tutor', role: 'tutor', name: 'Tutor User', mssv: 'T1000', email: 'tutor@hcmut.edu.vn' },
  { id: 'u-student-1', username: '2312487', password: 'demo', role: 'member', name: 'Member User', mssv: '2312487', email: '2312487@hcmut.edu.vn' },
];

const users = [];

function buildUser(id, username, password, role, name, mssv, email, department) {
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
    status: 'active',
  };
}

baseUsers.forEach((u) => users.push(buildUser(u.id, u.username, u.password, u.role, u.name, u.mssv, u.email, departments[0])));

for (let i = 2; i <= 11; i += 1) {
  const dept = departments[i % departments.length];
  users.push(buildUser(`u-tutor-${i}`, `tutor${i}`, 'tutor', 'tutor', `Tutor ${i}`, `T${1000 + i}`, `tutor${i}@hcmut.edu.vn`, dept));
}

for (let i = 2; i <= 45; i += 1) {
  const dept = departments[i % departments.length];
  users.push(buildUser(`u-student-${i}`, `23124${70 + i}`, 'demo', 'member', `Student ${i}`, `23124${70 + i}`, `student${i}@hcmut.edu.vn`, dept));
}

const DEMO_USERS = [
  { username: 'admin', password: 'admin', role: 'admin', name: 'Admin User' },
  { username: 'tutor', password: 'tutor', role: 'tutor', name: 'Tutor User' },
  { username: '2312487', password: 'demo', role: 'member', name: 'Member User' },
];

module.exports = { users, DEMO_USERS };
