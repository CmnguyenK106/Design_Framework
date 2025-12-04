const db = require('./db');

const UserModel = {
  // Create a new user
  create: async (userData) => {
    const query = `
      INSERT INTO users (id, username, password, role, name, mssv, email, phone, khoa, chuyen_nganh, avatar, skills, settings, devices, refresh_tokens, email_verified, verification_token, verification_token_expires, reset_token, reset_token_expires, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;
    const values = [
      userData.id,
      userData.username,
      userData.password,
      userData.role,
      userData.name,
      userData.mssv,
      userData.email,
      userData.phone || null,
      userData.khoa || null,
      userData.chuyenNganh || null,
      userData.avatar || '/avatars/default.png',
      userData.skills || [],
      userData.settings || { emailNotif: true, appNotif: true, publicProfile: false, allowContact: true },
      userData.devices || [],
      userData.refresh_tokens || [],
      userData.email_verified || false,
      userData.verification_token || null,
      userData.verification_token_expires || null,
      userData.reset_token || null,
      userData.reset_token_expires || null,
      userData.status || 'active',
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Find user by username
  findByUsername: async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findByVerificationToken: async (token) => {
    const result = await db.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    return result.rows[0];
  },

  findByRefreshToken: async (token) => {
    const result = await db.query('SELECT * FROM users WHERE $1 = ANY(refresh_tokens)', [token]);
    return result.rows[0];
  },

  findByResetToken: async (token) => {
    const result = await db.query('SELECT * FROM users WHERE reset_token = $1', [token]);
    return result.rows[0];
  },

  // Find user by MSSV
  findByMssv: async (mssv) => {
    const result = await db.query('SELECT * FROM users WHERE mssv = $1', [mssv]);
    return result.rows[0];
  },

  // Get all users with optional role filter
  findAll: async (role = null) => {
    if (role) {
      const result = await db.query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
      return result.rows;
    }
    const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  // Update user profile
  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        const dbKey = key === 'chuyenNganh' ? 'chuyen_nganh' : key;
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete user
  delete: async (id) => {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Update password
  updatePassword: async (id, newPassword) => {
    const result = await db.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
      [newPassword, id]
    );
    return result.rows[0];
  },

  addRefreshToken: async (id, token) => {
    const result = await db.query('UPDATE users SET refresh_tokens = array_append(refresh_tokens, $1) WHERE id = $2 RETURNING *', [token, id]);
    return result.rows[0];
  },

  removeRefreshToken: async (id, token) => {
    const result = await db.query('UPDATE users SET refresh_tokens = array_remove(refresh_tokens, $1) WHERE id = $2 RETURNING *', [token, id]);
    return result.rows[0];
  },

  clearAllRefreshTokens: async (id) => {
    const result = await db.query('UPDATE users SET refresh_tokens = $1 WHERE id = $2 RETURNING *', [[], id]);
    return result.rows[0];
  },
};

const SessionModel = {
  // Create a new session
  create: async (sessionData) => {
    const query = `
      INSERT INTO sessions (id, tutor_id, tutor_name, subject, date, start_time, end_time, location, type, link, max_students, registered, status, students)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      sessionData.id,
      sessionData.tutorId,
      sessionData.tutorName,
      sessionData.subject,
      sessionData.date,
      sessionData.startTime,
      sessionData.endTime,
      sessionData.location,
      sessionData.type,
      sessionData.link || null,
      sessionData.maxStudents || 10,
      sessionData.registered || 0,
      sessionData.status,
      sessionData.students || [],
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Find session by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM sessions WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Get all sessions with optional status filter
  findAll: async (status = null) => {
    if (status) {
      const result = await db.query(
        'SELECT * FROM sessions WHERE status = $1 ORDER BY date DESC, start_time DESC',
        [status]
      );
      return result.rows;
    }
    const result = await db.query('SELECT * FROM sessions ORDER BY date DESC, start_time DESC');
    return result.rows;
  },

  // Find sessions by tutor
  findByTutor: async (tutorId) => {
    const result = await db.query(
      'SELECT * FROM sessions WHERE tutor_id = $1 ORDER BY date DESC',
      [tutorId]
    );
    return result.rows;
  },

  // Find sessions with overlapping time
  findOverlapping: async (tutorId, date, startTime, endTime, excludeId = null) => {
    let query = `
      SELECT * FROM sessions 
      WHERE tutor_id = $1 AND date = $2 
      AND status != 'cancelled'
      AND (
        (start_time < $4 AND end_time > $3)
      )
    `;
    const values = [tutorId, date, startTime, endTime];

    if (excludeId) {
      query += ' AND id != $5';
      values.push(excludeId);
    }

    const result = await db.query(query, values);
    return result.rows;
  },

  // Update session
  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        const dbKey = key
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .replace(/^_/, '');
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete session
  delete: async (id) => {
    const result = await db.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Add student to session
  addStudent: async (sessionId, studentId) => {
    const result = await db.query(
      `UPDATE sessions 
       SET students = array_append(students, $1),
           registered = registered + 1
       WHERE id = $2 AND NOT ($1 = ANY(students))
       RETURNING *`,
      [studentId, sessionId]
    );
    return result.rows[0];
  },

  // Remove student from session
  removeStudent: async (sessionId, studentId) => {
    const result = await db.query(
      `UPDATE sessions 
       SET students = array_remove(students, $1),
           registered = GREATEST(0, registered - 1)
       WHERE id = $2
       RETURNING *`,
      [studentId, sessionId]
    );
    return result.rows[0];
  },
};

module.exports = {
  UserModel,
  SessionModel,
};
