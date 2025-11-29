require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => res.json({ success: true, data: 'ok' }));
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
