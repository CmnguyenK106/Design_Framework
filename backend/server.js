require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./database/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const feedbackRoutes = require('./routes/feedback');
const messageRoutes = require('./routes/messages');
const resourceRoutes = require('./routes/resources');
const reportRoutes = require('./routes/reports');
const presenceRoutes = require('./routes/presence');
const pairingRoutes = require('./routes/pairing');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static('uploads'));

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ success: true, data: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ success: false, data: 'degraded', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api', pairingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
