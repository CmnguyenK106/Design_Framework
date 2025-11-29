const path = require('path');
const fs = require('fs');
const { documents, progresses, backups } = require('../data/resources');
const { v4: uuidv4 } = require('uuid');

function listResources(req, res) {
  return res.json({ success: true, data: documents });
}

function uploadResource(req, res) {
  const file = req.file;
  const { description = '', category = 'lecture' } = req.body || {};
  if (!file) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Chưa chọn file' } });
  }
  const ext = path.extname(file.originalname).replace('.', '') || 'bin';
  const doc = {
    id: uuidv4(),
    name: file.originalname,
    description,
    category,
    uploadedBy: req.user.userId,
    uploadDate: new Date().toISOString(),
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    type: ext,
    url: `/uploads/resources/${file.filename}`,
    storedName: file.filename,
  };
  documents.unshift(doc);
  return res.status(201).json({ success: true, data: doc });
}

function deleteResource(req, res) {
  const idx = documents.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' } });
  }
  documents.splice(idx, 1);
  return res.json({ success: true, data: { message: 'Đã xóa tài liệu' } });
}

function downloadResource(req, res) {
  const doc = documents.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' } });
  }
  if (!doc.storedName) {
    // Mock docs chưa upload thật: trả metadata
    return res.json({ success: true, data: doc });
  }
  const filePath = path.join(process.cwd(), 'uploads', 'resources', doc.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File không tồn tại trên server' } });
  }
  return res.download(filePath, doc.name);
}

function tutorProgress(req, res) {
  return res.json({ success: true, data: progresses });
}

function updateProgress(req, res) {
  const item = progresses.find((p) => p.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bản ghi' } });
  }
  const { completed, total } = req.body || {};
  if (completed !== undefined) item.completed = completed;
  if (total !== undefined) item.total = total;
  item.percentage = Math.round((item.completed / item.total) * 100);
  return res.json({ success: true, data: item });
}

function adminBackups(req, res) {
  return res.json({ success: true, data: backups });
}

function createBackup(req, res) {
  const backup = {
    id: uuidv4(),
    filename: `backup-${new Date().toISOString().slice(0, 10)}.sql`,
    createdAt: new Date().toISOString(),
    size: `${(Math.random() * 120 + 20).toFixed(1)} MB`,
  };
  backups.unshift(backup);
  return res.status(201).json({ success: true, data: backup });
}

module.exports = {
  listResources,
  uploadResource,
  deleteResource,
  downloadResource,
  tutorProgress,
  updateProgress,
  adminBackups,
  createBackup,
};
