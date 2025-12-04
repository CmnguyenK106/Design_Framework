# 🚀 Quick Start - PostgreSQL Integration

Your Tutor Support System now uses **PostgreSQL** database instead of mock data!

## ⚡ Quick Setup (3 Steps)

### Option A: Automated Setup (Windows)
```bash
# Run the setup script
setup-database.bat
```

### Option B: Manual Setup

**Step 1: Start Database**
```bash
docker-compose up -d
```

**Step 2: Install & Seed**
```bash
cd backend
npm install
npm run seed
```

**Step 3: Start Server**
```bash
npm run dev
```

---

## 🎯 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:3000 | - |
| **pgAdmin** | http://localhost:5050 | admin@tutorsupport.com / admin123 |
| **PostgreSQL** | localhost:5432 | tutor_admin / tutor_password |

---

## 👤 Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin | Admin |
| tutor | tutor | Tutor |
| 2312487 | demo | Student |

### 🆕 Register New Account
Users can now register their own accounts!
```bash
POST /api/auth/register
{
  "username": "your_username",
  "password": "password123",
  "name": "Your Full Name",
  "role": "member"  # or "tutor"
}
```
See **[API_REGISTRATION.md](API_REGISTRATION.md)** for complete registration API documentation.

---

## 📚 Documentation

- **[POSTGRES_QUICKSTART.md](POSTGRES_QUICKSTART.md)** - Quick reference guide
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Complete documentation
- **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - What changed
- **[API_REGISTRATION.md](API_REGISTRATION.md)** - User registration API 🆕

---

## ✅ What's Migrated

✅ **User Management** - Full CRUD with PostgreSQL
✅ **Authentication** - Login & Registration with database 🆕
✅ **Session Management** - Create, register, conflict detection

⏳ **Still Mock Data** - Feedback, Messages, Notifications, Resources

---

## 🔍 Quick Test

```bash
# Health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin\"}"
```

---

## 🛠️ Common Commands

```bash
# Start everything
setup-database.bat

# Start backend only
start-backend.bat

# Stop database
docker-compose down

# Reset database (deletes all data!)
docker-compose down -v
docker-compose up -d
cd backend && npm run seed

# View logs
docker-compose logs -f postgres
```

---

## 📊 Database Info

- **12 tables** created
- **50+ users** seeded
- **100+ sessions** seeded
- **Connection pooling** enabled
- **Indexes** for performance

---

## 🎓 Next Steps

1. ✅ Database is running
2. ✅ Backend is connected
3. 📱 Start frontend: `cd frontend && npm run dev`
4. 🌐 Access app: http://localhost:5173
5. 🔐 Login with demo accounts

---

## 🐛 Troubleshooting

**Docker not starting?**
- Ensure Docker Desktop is running
- Check port 5432 and 5050 are available

**Connection error?**
- Wait a few seconds after `docker-compose up`
- Check `.env` file in backend folder

**No data?**
- Run: `cd backend && npm run seed`

---

**Need help?** Check the documentation files above! 📖
