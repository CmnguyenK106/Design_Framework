# PostgreSQL Database Setup - Quick Start Guide

## 🎯 What's Been Done

Your Tutor Support System has been migrated from in-memory mock data to **PostgreSQL** database with the following components:

### ✅ Created Files

1. **`docker-compose.yml`** - PostgreSQL + pgAdmin containers
2. **`backend/database/init.sql`** - Database schema with 12 tables
3. **`backend/database/db.js`** - Database connection pool
4. **`backend/database/models.js`** - User and Session models
5. **`backend/database/seed.js`** - Data seeding script
6. **`DATABASE_SETUP.md`** - Complete documentation

### ✅ Migrated Controllers

- **authController.js** - Login with database authentication
- **userController.js** - Full CRUD for user management
- **sessionController.js** - Session management with conflict detection
- **middleware/auth.js** - Updated to work with database

### ✅ Updated Configuration

- **package.json** - Added `pg` dependency and `seed` script
- **.env.example** - Database configuration variables
- **server.js** - Database health check endpoint

---

## 🚀 Step-by-Step Setup

### Step 1: Start PostgreSQL

```bash
# From project root (d:\CNPM\Design_Framework)
docker-compose up -d
```

**What this does:**
- Starts PostgreSQL on port 5432
- Starts pgAdmin on port 5050
- Creates database schema automatically

**Verify it's running:**
```bash
docker-compose ps
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install the `pg` (node-postgres) package.

### Step 3: Configure Environment

```bash
# Create .env file from example
copy .env.example .env
```

The default values work with Docker:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tutor_admin
DB_PASSWORD=tutor_password
DB_NAME=tutor_support
```

### Step 4: Seed the Database

```bash
npm run seed
```

**This populates:**
- 50+ users (including admin, tutor, 2312487)
- 100+ sessions
- 20 notifications
- 30 feedback entries
- 15 resources

### Step 5: Start Backend

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Step 6: Test It

**Check health:**
```bash
curl http://localhost:3000/api/health
```

**Test login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin\"}"
```

---

## 🔍 Access pgAdmin

1. Open browser: `http://localhost:5050`
2. Login:
   - Email: `admin@tutorsupport.com`
   - Password: `admin123`

3. Add Server:
   - Right-click "Servers" → Create → Server
   - **General**: Name = `Tutor Support`
   - **Connection**:
     - Host: `postgres`
     - Port: `5432`
     - Database: `tutor_support`
     - Username: `tutor_admin`
     - Password: `tutor_password`

---

## 📊 Database Structure

### Main Tables

```
users (50+)           → User accounts
sessions (100+)       → Tutoring sessions
feedback (30)         → Session ratings
notifications (20)    → Alerts
pair_requests         → Tutor pairings
conversations         → Chat threads
messages              → Chat messages
resources (15)        → Learning materials
```

---

## 🧪 Testing the Migration

### Test User Management

```bash
# Get all users (need admin token)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Session Management

```bash
# Get all sessions
curl http://localhost:3000/api/sessions
```

### Login Accounts

| Username | Password | Role   |
|----------|----------|--------|
| admin    | admin    | Admin  |
| tutor    | tutor    | Tutor  |
| 2312487  | demo     | Student|

---

## ⚠️ Important Notes

### What's Migrated ✅
- Authentication (login)
- User management (profile, admin CRUD)
- Session management (create, register, conflict detection)

### What's Still Mock Data ❌
These still use in-memory data from `/data` folder:
- Feedback system
- Messaging
- Notifications
- Resources
- Pair requests
- Reports

**These can be migrated using the same pattern!**

---

## 🛠️ Common Commands

### Database Operations

```bash
# Stop database
docker-compose down

# Reset database (deletes all data!)
docker-compose down -v
docker-compose up -d
cd backend && npm run seed

# View logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U tutor_admin tutor_support > backup.sql
```

### Development

```bash
# Start backend with auto-reload
npm run dev

# Reseed database
npm run seed
```

---

## 🐛 Troubleshooting

### "Connection refused" error
```bash
# Check containers
docker-compose ps

# Restart
docker-compose restart
```

### "No data found" 
```bash
# Reseed database
cd backend
npm run seed
```

### Port 5432 already in use
```bash
# Check what's using it
netstat -ano | findstr :5432

# Either stop that service or change port in docker-compose.yml
```

---

## 📈 Next Steps

To complete the full migration:

1. **Migrate remaining features:**
   - Copy the pattern from userController/sessionController
   - Add models to `models.js`
   - Update controllers to use models

2. **Add features:**
   - Database transactions for complex operations
   - Connection pooling optimization
   - Query optimization with indexes
   - Backup automation

3. **Production ready:**
   - Change default passwords
   - Add SSL/TLS
   - Set up monitoring
   - Implement migrations (e.g., with Sequelize or Knex)

---

## 📚 Documentation

See **`DATABASE_SETUP.md`** for complete documentation including:
- Detailed schema information
- API examples
- Advanced troubleshooting
- Production deployment guide
- Migration patterns for remaining features

---

## ✅ Success Checklist

- [ ] Docker containers running (`docker-compose ps`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend server running (`npm run dev`)
- [ ] Can login with demo accounts
- [ ] Health check shows database connected
- [ ] pgAdmin accessible at localhost:5050

---

**You're all set! The system now uses PostgreSQL for users and sessions. 🎉**
