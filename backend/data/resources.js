const { v4: uuidv4 } = require('uuid');
const { users } = require('./users');
const path = require('path');
const fs = require('fs');

const tutor = users.find((u) => u.role === 'tutor');
const pdfFiles = [
  'dm2_Ch1a_Propositonal_Logic_Review_Part_I (1).pdf',
  'dm2_Ch1b_Propositonal_Logic_Review_Part_II.pdf',
  'dm2_Ch1c_Prediacte_Logic.pdf',
  'dm2_Ch1c_Prediacte_Logic_Review.pdf',
  'dm2_Ch1e_Predicate Logic and Introduction to Program Verification.pdf',
  'dm2_Ch1f_Program Verification.pdf',
  'dm2_Ch3_ILP.pdf',
  'Logic and Computation Exercises(solution).pdf',
  'Logic and Computation Exercises.pdf',
  'MM3-ILP-new-landscape.pdf',
  'Slide Advance Logic and Program verification(new).pdf',
];

const documents = pdfFiles.map((file, idx) => {
  const filePath = path.join(process.cwd(), 'backend', 'uploads', 'resources', file);
  let size = '—';
  try {
    const stat = fs.statSync(filePath);
    size = `${(stat.size / 1024 / 1024).toFixed(1)} MB`;
  } catch (e) {
    size = '—';
  }
  return {
    id: uuidv4(),
    name: file,
    description: `Tài liệu demo #${idx + 1}`,
    category: ['lecture', 'exercise', 'reference'][idx % 3],
    uploadedBy: tutor?.id,
    uploadDate: '2025-11-30',
    size,
    type: 'pdf',
    url: `/uploads/resources/${file}`,
    storedName: file,
  };
});

const progresses = [];
const members = users.filter((u) => u.role === 'member').slice(0, 10);
members.forEach((m, idx) => {
  const completed = (idx % 10) + 1;
  const total = 10 + (idx % 5);
  progresses.push({
    id: uuidv4(),
    studentId: m.id,
    studentName: m.name,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    lastUpdate: '2025-11-27',
  });
});

const backups = [];
for (let i = 0; i < 5; i += 1) {
  backups.push({
    id: uuidv4(),
    filename: `backup-2025-11-${20 + i}.sql`,
    createdAt: `2025-11-${20 + i}T00:00:00Z`,
    size: `${(Math.random() * 100 + 20).toFixed(1)} MB`,
  });
}

module.exports = { documents, progresses, backups };
