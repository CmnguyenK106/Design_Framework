const { v4: uuidv4 } = require('uuid');
const { users } = require('./users');

const documents = [];
const categories = ['lecture', 'exercise', 'reference'];
for (let i = 0; i < 20; i += 1) {
  const tutor = users.find((u) => u.role === 'tutor');
  documents.push({
    id: uuidv4(),
    name: `Tài liệu ${i + 1}`,
    description: `Mô tả tài liệu ${i + 1}`,
    category: categories[i % categories.length],
    uploadedBy: tutor.id,
    uploadDate: '2025-11-27',
    size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
    type: 'pdf',
    url: `/files/document-${i + 1}.pdf`,
  });
}

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
