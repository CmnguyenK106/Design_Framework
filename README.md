# HCMUT Tutor Support System

A comprehensive web application for managing tutoring sessions, student-tutor interactions, and academic support services at Ho Chi Minh City University of Technology (HCMUT).

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Demo Accounts](#-demo-accounts)

## ✨ Features

### For Students
- 📅 **Session Management**: Browse, register, and track tutoring sessions
- 💬 **Real-time Messaging**: Communicate with tutors and peers
- 📚 **Resource Access**: Download study materials and resources
- ⭐ **Feedback System**: Rate and review completed sessions
- 🔔 **Notifications**: Stay updated with real-time notifications
- 👤 **Profile Management**: Manage personal information and preferences

### For Tutors
- 📝 **Session Creation**: Create and manage tutoring sessions
- 👥 **Student Management**: Track registered students and attendance
- 📤 **Resource Upload**: Share study materials with students
- 📊 **Feedback Review**: View and respond to student feedback
- 📈 **Analytics**: Monitor session performance and statistics

### For Administrators
- 🔧 **User Management**: Full CRUD operations on users
- 📊 **Reports & Analytics**: Comprehensive system reports and KPIs
- 🎯 **System Monitoring**: Track overall platform usage and performance
- 🛠️ **Resource Management**: Manage all system resources and backups

### Core Features
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- ✉️ **Email Verification**: Email-based account verification system
- 🔄 **Password Recovery**: Secure password reset functionality
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🌐 **RESTful API**: Well-documented REST API endpoints
- 🐳 **Docker Support**: Easy deployment with Docker Compose
- 🗄️ **PostgreSQL Database**: Robust and scalable data storage

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 7
- **State Management**: Zustand 5
- **Forms**: React Hook Form 7 + Yup validation
- **HTTP Client**: Axios 1.13
- **Icons**: Lucide React
- **Charts**: Recharts 3
- **Date Picker**: React Datepicker 8

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL 15
- **ORM**: Raw SQL queries with pg driver
- **Authentication**: JWT (jsonwebtoken 9)
- **Password Hashing**: bcrypt 5
- **Validation**: Joi 18
- **Email**: Nodemailer 6
- **File Upload**: Multer 2
- **Date Handling**: dayjs 1.11
- **CORS**: cors 2.8

### DevOps & Tools
- **Database Management**: Docker + PostgreSQL 15 Alpine
- **Admin UI**: pgAdmin 4
- **Version Control**: Git
- **Package Manager**: npm

## 📁 Project Structure

```
Design_Framework/
├── backend/                      # Express.js API Server
│   ├── controllers/             # Request handlers
│   │   ├── authController.js   # Authentication logic
│   │   ├── userController.js   # User management
│   │   ├── sessionController.js # Session management
│   │   ├── messageController.js # Messaging
│   │   ├── feedbackController.js # Feedback system
│   │   ├── resourceController.js # Resource management
│   │   ├── notificationController.js # Notifications
│   │   ├── reportController.js # Reports & analytics
│   │   └── pairingController.js # Pairing requests
│   ├── database/               # Database configuration
│   │   ├── db.js              # PostgreSQL connection
│   │   ├── models.js          # Data models
│   │   ├── init.sql           # Database schema
│   │   └── seed.js            # Seed data script
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── roleCheck.js      # Role-based access control
│   │   └── errorHandler.js   # Error handling
│   ├── routes/               # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User routes
│   │   ├── sessions.js      # Session routes
│   │   ├── messages.js      # Messaging routes
│   │   ├── feedback.js      # Feedback routes
│   │   ├── resources.js     # Resource routes
│   │   ├── notifications.js # Notification routes
│   │   ├── reports.js       # Report routes
│   │   ├── pairing.js       # Pairing routes
│   │   └── admin.js         # Admin routes
│   ├── utils/               # Utility functions
│   │   └── jwt.js          # JWT utilities
│   ├── uploads/            # File storage
│   │   ├── avatars/       # User avatars
│   │   ├── messages/      # Message attachments
│   │   └── resources/     # Learning resources
│   ├── server.js          # Application entry point
│   └── package.json       # Backend dependencies
│
├── frontend/                    # React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/            # Images, icons, etc.
│   │   ├── components/        # Reusable components
│   │   │   ├── layout/       # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ProtectedLayout.jsx
│   │   │   └── messages/     # Message components
│   │   │       └── MessagesLayout.jsx
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── student/      # Student pages
│   │   │   └── tutor/        # Tutor pages
│   │   ├── services/         # API services
│   │   │   └── api.js       # Axios configuration
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # Application entry
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── eslint.config.js      # ESLint configuration
│   └── package.json          # Frontend dependencies
│
├── diagrams/                    # PlantUML diagrams
│   ├── overview.puml           # System overview
│   ├── auth_user.puml         # Authentication flow
│   ├── sessions_pairing.puml  # Session management
│   ├── messaging.puml         # Messaging system
│   ├── feedback.puml          # Feedback system
│   ├── notifications.puml     # Notification system
│   ├── resources.puml         # Resource management
│   ├── reports.puml           # Reporting system
│   └── sequences/             # Sequence diagrams
│       ├── auth_login.puml
│       ├── student_register_session.puml
│       ├── tutor_create_update_session.puml
│       ├── pairing_flow.puml
│       ├── messaging_realtime.puml
│       ├── feedback_flow.puml
│       ├── notifications_flow.puml
│       └── resources_upload_download.puml
│
├── docs/                        # Documentation
│   ├── API_REGISTRATION.md    # API registration guide
│   ├── ARCHITECTURE.txt       # System architecture
│   ├── DATABASE_SETUP.md      # Database setup guide
│   ├── POSTGRES_QUICKSTART.md # PostgreSQL quickstart
│   ├── MIGRATION_SUMMARY.md   # Migration notes
│   └── START_HERE.md          # Getting started guide
│
├── docker-compose.yml          # Docker configuration
├── setup-database.bat         # Database setup script (Windows)
├── start-backend.bat          # Backend startup script (Windows)
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🗄️ Database Schema

The application uses **PostgreSQL 15** with the following main tables:

- **users**: User accounts (students, tutors, admins)
- **sessions**: Tutoring sessions
- **messages**: User-to-user messaging
- **conversations**: Message threads
- **feedback**: Session ratings and reviews
- **resources**: Learning materials
- **notifications**: User notifications
- **pairing_requests**: Tutor-student pairing
- **reports**: System reports and analytics

See [database/init.sql](backend/database/init.sql) for complete schema.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **PostgreSQL** 15.x ([Download](https://www.postgresql.org/download/))
  - OR **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/)) for containerized database
- **Git** ([Download](https://git-scm.com/downloads))

## 🚀 Installation & Setup
1. Clone repo và cài đặt frontend:
   ```bash
   cd frontend
   cp .env.example .env   # chỉnh VITE_API_URL nếu cần
   npm install
   npm run dev   # http://localhost:5173
   ```
2. Cài đặt backend:
   ```bash
   cd backend
   cp .env.example .env   # chỉnh JWT_SECRET nếu cần
   npm install
   npm run dev   # http://localhost:3000
   ```
3. Đăng nhập với một tài khoản demo, hệ thống sẽ tự điều hướng dashboard theo vai trò.

## API (tóm tắt các endpoint hiện có)
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`

### 1. Clone the Repository

```bash
git clone https://github.com/CmnguyenK106/Design_Framework.git
cd Design_Framework
```

### 2. Database Setup (Choose One Option)

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and pgAdmin containers
docker-compose up -d

# Verify containers are running
docker ps

# The database will be automatically initialized with the schema
```

**Docker Services:**
- PostgreSQL: `localhost:5433`
- pgAdmin: `http://localhost:5051`
  - Email: `admin@tutorsupport.com`
  - Password: `admin123`

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 15 on your system
2. Create database and user:

```bash
# Windows (using setup script)
setup-database.bat

# Or manually with psql
psql -U postgres
CREATE DATABASE tutor;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE tutor TO postgres;
\q

# Initialize schema
psql -U postgres -d tutor -f backend/database/init.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy and configure the following:
```

Create `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=tutor
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
FRONTEND_URL=http://localhost:5173
```

```bash
# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
```

Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎮 Running the Application

### Development Mode

**Using Batch Scripts (Windows):**
```bash
# Start backend (from root directory)
start-backend.bat

# Start frontend (open new terminal)
cd frontend
npm run dev
```

**Manual Start:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
# Serve with your preferred static file server

# Run backend in production
cd backend
npm start
```

### Using Docker (Full Stack)

You can extend the `docker-compose.yml` to include backend and frontend services.

## 🔑 Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `5000` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5433` | Yes |
| `DB_NAME` | Database name | `tutor` | Yes |
| `DB_USER` | Database user | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` | No |
| `EMAIL_USER` | SMTP email address | - | Yes |
| `EMAIL_PASS` | SMTP password/app password | - | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | Yes |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` | No |

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | User logout | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | List all users | Yes | Admin |
| GET | `/users/:id` | Get user by ID | Yes | All |
| PUT | `/users/:id` | Update user | Yes | Owner/Admin |
| DELETE | `/users/:id` | Delete user | Yes | Admin |
| GET | `/users/me` | Get current user profile | Yes | All |
| PUT | `/users/me` | Update current user | Yes | All |

### Session Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/sessions` | List all sessions | No | - |
| GET | `/sessions/:id` | Get session details | No | - |
| POST | `/sessions` | Create new session | Yes | Tutor |
| PUT | `/sessions/:id` | Update session | Yes | Tutor (Owner) |
| DELETE | `/sessions/:id` | Delete session | Yes | Tutor (Owner) |
| POST | `/sessions/:id/register` | Register for session | Yes | Student |
| POST | `/sessions/:id/unregister` | Unregister from session | Yes | Student |

### Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/messages/conversations` | Get user conversations | Yes |
| GET | `/messages/conversation/:userId` | Get messages with user | Yes |
| POST | `/messages` | Send message | Yes |
| PUT | `/messages/:id/read` | Mark as read | Yes |
| DELETE | `/messages/:id` | Delete message | Yes |

### Feedback Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/feedback` | List feedback | Yes | Tutor/Admin |
| GET | `/feedback/:id` | Get feedback details | Yes | All |
| POST | `/feedback` | Submit feedback | Yes | Student |
| PUT | `/feedback/:id` | Update feedback | Yes | Owner |
| DELETE | `/feedback/:id` | Delete feedback | Yes | Admin |

### Resource Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/resources` | List resources | Yes | All |
| GET | `/resources/:id` | Get resource details | Yes | All |
| POST | `/resources` | Upload resource | Yes | Tutor/Admin |
| PUT | `/resources/:id` | Update resource | Yes | Owner/Admin |
| DELETE | `/resources/:id` | Delete resource | Yes | Owner/Admin |
| GET | `/resources/:id/download` | Download resource | Yes | All |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/users` | Manage users | Yes | Admin |
| GET | `/admin/stats` | System statistics | Yes | Admin |
| GET | `/admin/reports` | Generate reports | Yes | Admin |
| POST | `/admin/users/:id/suspend` | Suspend user | Yes | Admin |
| POST | `/admin/users/:id/activate` | Activate user | Yes | Admin |

For detailed API documentation, see [docs/API_REGISTRATION.md](docs/API_REGISTRATION.md)

## 👤 Demo Accounts

Use these credentials to test different user roles:

| Role | Email | Password | Username |
|------|-------|----------|----------|
| **Admin** | admin@hcmut.edu.vn | admin123 | admin |
| **Tutor** | tutor@hcmut.edu.vn | tutor123 | tutor_demo |
| **Student** | student@hcmut.edu.vn | student123 | 2312487 |

> **Note**: These accounts are created automatically when you run `npm run seed` in the backend.

## 🧪 Testing

### Manual Testing

1. **Register a new account**:
   - Navigate to `http://localhost:5173/register`
   - Fill in the registration form
   - Check your email for verification link

2. **Test session registration**:
   - Login as a student
   - Browse available sessions
   - Register for a session
   - Try to register for a conflicting session (should fail)

3. **Test messaging**:
   - Login as a student or tutor
   - Send messages to other users
   - Check real-time updates

### Database Verification

```bash
# Connect to PostgreSQL
psql -U postgres -d tutor -h localhost -p 5433

# Check tables
\dt

# View users
SELECT id, username, email, role FROM users;

# View sessions
SELECT id, subject, date, status FROM sessions;

# Exit
\q
```

## 📚 Additional Documentation

- [Architecture Overview](docs/ARCHITECTURE.txt) - System architecture and design patterns
- [Database Setup](docs/DATABASE_SETUP.md) - Detailed database configuration
- [PostgreSQL Quick Start](docs/POSTGRES_QUICKSTART.md) - PostgreSQL tips and tricks
- [Migration Summary](docs/MIGRATION_SUMMARY.md) - Database migration history
- [Getting Started](docs/START_HERE.md) - Quickstart guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is developed for educational purposes at HCMUT.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if PostgreSQL is running
docker ps
# or
pg_isready -h localhost -p 5433

# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME
```

**Port Already in Use**
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

**Frontend Cannot Connect to Backend**
- Verify backend is running: `http://localhost:5000/api/health`
- Check CORS settings in `backend/server.js`
- Verify `VITE_API_URL` in `frontend/.env`

**Email Verification Not Working**
- Configure Gmail app password in `backend/.env`
- Enable "Less secure app access" or use App Passwords
- Check spam folder for verification emails

## 📧 Contact

For questions or support:
- Repository: https://github.com/CmnguyenK106/Design_Framework
- Open an issue on GitHub for bug reports or feature requests

## 🙏 Acknowledgments

- HCMUT for project requirements and support
- React and Express.js communities for excellent documentation
- All open-source contributors whose libraries made this project possible

---

**Made with ❤️ for HCMUT Students**

