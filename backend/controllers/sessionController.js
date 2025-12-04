const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const { SessionModel, UserModel } = require('../database/models');

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Convert DB format to API format
const formatSession = (session) => {
  if (!session) return null;
  return {
    id: session.id,
    tutorId: session.tutor_id,
    tutorName: session.tutor_name,
    subject: session.subject,
    date: session.date,
    startTime: session.start_time,
    endTime: session.end_time,
    location: session.location,
    type: session.type,
    link: session.link,
    maxStudents: session.max_students,
    registered: session.registered,
    status: session.status,
    students: session.students || [],
  };
};

async function list(req, res) {
  try {
    const { status } = req.query;
    const sessions = await SessionModel.findAll(status || null);
    return res.json({ success: true, data: sessions.map(formatSession) });
  } catch (error) {
    console.error('List sessions error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get sessions' } });
  }
}

async function getOne(req, res) {
  try {
    const session = await SessionModel.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
    }
    return res.json({ success: true, data: formatSession(session) });
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get session' } });
  }
}

async function create(req, res) {
  try {
    const payload = req.body || {};
    const now = dayjs();
    
    if (dayjs(payload.date).isBefore(now, 'day')) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TIME', message: 'Không tạo lịch trong quá khứ' } });
    }
    
    if (toMinutes(payload.endTime) - toMinutes(payload.startTime) < 30) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_DURATION', message: 'Thời lượng tối thiểu 30 phút' } });
    }

    const tutorId = req.user.userId;
    const tutor = await UserModel.findById(tutorId);
    
    // Check for overlapping sessions
    const overlapping = await SessionModel.findOverlapping(
      tutorId,
      payload.date,
      payload.startTime,
      payload.endTime
    );
    
    if (overlapping.length > 0) {
      return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'Bị trùng lịch hiện có' } });
    }

    const newSession = await SessionModel.create({
      id: uuidv4(),
      tutorId,
      tutorName: tutor?.name || 'Tutor',
      subject: payload.subject || 'Chủ đề chưa đặt',
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: payload.location || 'Online',
      type: payload.type || 'online',
      link: payload.link || null,
      maxStudents: payload.maxStudents || 10,
      registered: 0,
      status: 'scheduled',
      students: [],
    });

    return res.status(201).json({ success: true, data: formatSession(newSession) });
  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create session' } });
  }
}

async function update(req, res) {
  try {
    const session = await SessionModel.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
    }

    const payload = req.body || {};
    const startTime = payload.startTime || session.start_time;
    const endTime = payload.endTime || session.end_time;
    
    if (toMinutes(endTime) - toMinutes(startTime) < 30) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_DURATION', message: 'Thời lượng tối thiểu 30 phút' } });
    }

    // Check for overlapping sessions
    const overlapping = await SessionModel.findOverlapping(
      session.tutor_id,
      payload.date || session.date,
      startTime,
      endTime,
      session.id
    );
    
    if (overlapping.length > 0) {
      return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'Bị trùng lịch' } });
    }

    const updates = {};
    const allowedFields = ['subject', 'date', 'startTime', 'endTime', 'location', 'type', 'link', 'maxStudents', 'status'];
    allowedFields.forEach(field => {
      if (payload[field] !== undefined) {
        updates[field] = payload[field];
      }
    });

    const updated = await SessionModel.update(req.params.id, updates);
    return res.json({ success: true, data: formatSession(updated) });
  } catch (error) {
    console.error('Update session error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update session' } });
  }
}

async function remove(req, res) {
  try {
    const session = await SessionModel.delete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
    }
    return res.json({ success: true, data: { message: 'Đã xóa session' } });
  } catch (error) {
    console.error('Delete session error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete session' } });
  }
}

async function register(req, res) {
  try {
    const session = await SessionModel.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
    }
    
    if (session.status !== 'scheduled') {
      return res.status(400).json({ success: false, error: { code: 'NOT_AVAILABLE', message: 'Phiên không còn mở đăng ký' } });
    }
    
    if (session.registered >= session.max_students) {
      return res.status(400).json({ success: false, error: { code: 'FULL', message: 'Phiên đã full' } });
    }

    const studentId = req.user.userId;
    
    // Check if already registered
    if (session.students && session.students.includes(studentId)) {
      return res.json({ success: true, data: formatSession(session) });
    }

    // Check for conflicts - get all sessions where student is registered
    const db = require('../database/db');
    const conflictCheck = await db.query(
      `SELECT * FROM sessions 
       WHERE $1 = ANY(students) 
       AND status = 'scheduled' 
       AND date = $2
       AND id != $3
       AND (
         (start_time < $5 AND end_time > $4)
       )`,
      [studentId, session.date, session.id, session.start_time, session.end_time]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'Trùng lịch đã đăng ký' } });
    }

    const updated = await SessionModel.addStudent(req.params.id, studentId);
    return res.json({ success: true, data: formatSession(updated) });
  } catch (error) {
    console.error('Register session error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to register session' } });
  }
}

async function unregister(req, res) {
  try {
    const session = await SessionModel.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session không tồn tại' } });
    }

    const studentId = req.user.userId;
    const updated = await SessionModel.removeStudent(req.params.id, studentId);
    return res.json({ success: true, data: formatSession(updated) });
  } catch (error) {
    console.error('Unregister session error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to unregister session' } });
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  register,
  unregister,
};
