require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const db = require('./db');

// Import original data for reference
const { users: originalUsers } = require('../data/users');
const { sessions: originalSessions } = require('../data/sessions');

async function seedDatabase() {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await client.query('DELETE FROM messages');
    await client.query('DELETE FROM conversations');
    await client.query('DELETE FROM feedback');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM pair_requests');
    await client.query('DELETE FROM resource_progress');
    await client.query('DELETE FROM resources');
    await client.query('DELETE FROM backups');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM users');

    // Seed Users
    console.log('👥 Seeding users...');
    for (const user of originalUsers) {
      // Ensure password is hashed
      const hashedPass = await bcrypt.hash(user.password, 12);
      await client.query(
        `INSERT INTO users (id, username, password, role, name, mssv, email, phone, khoa, chuyen_nganh, avatar, skills, settings, devices, refresh_tokens, email_verified, verification_token, verification_token_expires, reset_token, reset_token_expires, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          user.id,
          user.username,
          hashedPass,
          user.role,
          user.name,
          user.mssv,
          user.email,
          user.phone || null,
          user.khoa || null,
          user.chuyenNganh || null,
          user.avatar || '/avatars/default.png',
          user.skills || [],
          JSON.stringify(user.settings || { emailNotif: true, appNotif: true, publicProfile: false, allowContact: true }),
          JSON.stringify(user.devices || []),
          [],
          true,
          null,
          null,
          null,
          null,
          user.status || 'active',
        ]
      );
    }
    console.log(`✅ Seeded ${originalUsers.length} users`);

    // Seed Sessions
    console.log('📅 Seeding sessions...');
    for (const session of originalSessions) {
      await client.query(
        `INSERT INTO sessions (id, tutor_id, tutor_name, subject, date, start_time, end_time, location, type, link, max_students, registered, status, students)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          session.id,
          session.tutorId,
          session.tutorName,
          session.subject,
          session.date,
          session.startTime,
          session.endTime,
          session.location,
          session.type,
          session.link || null,
          session.maxStudents || 10,
          session.registered || 0,
          session.status,
          session.students || [],
        ]
      );
    }
    console.log(`✅ Seeded ${originalSessions.length} sessions`);

    // Seed Sample Notifications
    console.log('🔔 Seeding notifications...');
    const students = originalUsers.filter(u => u.role === 'member');
    const tutors = originalUsers.filter(u => u.role === 'tutor');
    
    for (let i = 0; i < 20; i++) {
      const recipient = i % 2 === 0 ? students[i % students.length] : tutors[i % tutors.length];
      await client.query(
        `INSERT INTO notifications (id, recipient_id, type, title, content, channels, priority, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `n-${i + 1}`,
          recipient.id,
          ['pairing', 'session', 'feedback', 'system'][i % 4],
          `Notification ${i + 1}`,
          `This is notification content ${i + 1}`,
          ['in-app', 'email'],
          i % 3 === 0 ? 'high' : 'normal',
          i % 3 === 0 ? 'unread' : 'read',
          dayjs().subtract(i, 'day').toISOString(),
        ]
      );
    }
    console.log('✅ Seeded 20 notifications');

    // Seed Sample Feedback
    console.log('⭐ Seeding feedback...');
    const completedSessions = originalSessions.filter(s => s.status === 'completed');
    for (let i = 0; i < Math.min(30, completedSessions.length); i++) {
      const session = completedSessions[i];
      if (session.students && session.students.length > 0) {
        const studentId = session.students[0];
        const student = originalUsers.find(u => u.id === studentId);
        
        await client.query(
          `INSERT INTO feedback (id, session_id, student_id, student_name, tutor_id, tutor_name, subject, ratings, good_points, improvements, comment, recommend, anonymous, status, tutor_viewed, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            `f-${i + 1}`,
            session.id,
            studentId,
            i % 3 === 0 ? 'Ẩn danh' : (student?.name || 'Student'),
            session.tutorId,
            session.tutorName,
            session.subject,
            JSON.stringify({
              quality: Math.floor(Math.random() * 2) + 4,
              knowledge: Math.floor(Math.random() * 2) + 4,
              communication: Math.floor(Math.random() * 2) + 4,
              helpfulness: Math.floor(Math.random() * 2) + 4,
              timeManagement: Math.floor(Math.random() * 2) + 4,
            }),
            'Great session overall',
            'Could improve timing',
            'Very helpful and knowledgeable tutor. Highly recommended!',
            Math.random() > 0.3,
            i % 3 === 0,
            'published',
            Math.random() > 0.5,
            dayjs().subtract(i, 'day').toISOString(),
          ]
        );
      }
    }
    console.log('✅ Seeded feedback entries');

    // Seed Sample Resources
    console.log('📚 Seeding resources...');
    const resourceCategories = ['lecture', 'exercise', 'reference'];
    for (let i = 0; i < 15; i++) {
      const tutor = tutors[i % tutors.length];
      await client.query(
        `INSERT INTO resources (id, name, description, category, uploaded_by, size, type, url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          `Document ${i + 1}.pdf`,
          `Sample document ${i + 1} for learning`,
          resourceCategories[i % 3],
          tutor.id,
          `${(Math.random() * 5 + 1).toFixed(2)} MB`,
          'pdf',
          `/uploads/resources/sample-${i + 1}.pdf`,
        ]
      );
    }
    console.log('✅ Seeded 15 resources');

    await client.query('COMMIT');
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run seeding
seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
