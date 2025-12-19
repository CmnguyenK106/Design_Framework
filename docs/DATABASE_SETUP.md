# PostgreSQL Integration Guide

This guide explains how to set up and use PostgreSQL database with the Tutor Support System.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Quick Start

### 1. Start PostgreSQL and pgAdmin

```bash
# From the project root directory
docker-compose up -d
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **pgAdmin** on `http://localhost:5050`

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# The default values should work with Docker Compose:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=tutor_admin
# DB_PASSWORD=tutor_password
# DB_NAME=tutor_support
```

### 4. Seed the Database

```bash
npm run seed
```

This will populate the database with:
- 50+ users (admin, tutors, students)
- 100+ sessions
- Sample notifications, feedback, and resources

### 5. Start the Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Database Access

### pgAdmin Access

1. Open `http://localhost:5050` in your browser
2. Login with:
   - Email: `admin@tutorsupport.com`
   - Password: `admin123`

3. Add a new server:
   - Right-click "Servers" → "Create" → "Server"
   - **General Tab:**
     - Name: `Tutor Support DB`
   - **Connection Tab:**
     - Host: `postgres` (Docker network name)
     - Port: `5432`
     - Database: `tutor_support`
     - Username: `tutor_admin`
     - Password: `tutor_password`

### Direct PostgreSQL Connection

```bash
# Using psql (if installed)
psql -h localhost -p 5432 -U tutor_admin -d tutor_support

# Password: tutor_password
```

## Database Schema

### Main Tables

- **users** - User accounts (admin, tutor, member)
- **sessions** - Tutoring sessions
- **feedback** - Session feedback and ratings
- **notifications** - In-app notifications
- **pair_requests** - Tutor-student pairing requests
- **conversations** - Message conversations
- **messages** - Individual messages
- **resources** - Learning materials
- **resource_progress** - Resource completion tracking
- **backups** - System backups

## Migrated Controllers

The following controllers have been migrated to use PostgreSQL:

✅ **authController** - Login/logout with database authentication
✅ **userController** - User management (CRUD operations)
✅ **sessionController** - Session management with conflict detection

### Still Using Mock Data

The following features still use in-memory data (can be migrated similarly):

- Feedback management
- Messaging system
- Notifications
- Resources
- Pair requests
- Reports

## API Changes

All API endpoints remain the same. The migration is transparent to the frontend.

### Example API Usage

```javascript
// Login
POST /api/auth/login
{
  "username": "admin",
  "password": "admin"
}

// Get all sessions
GET /api/sessions

// Create a session (tutor/admin only)
POST /api/sessions
{
  "subject": "Web Development",
  "date": "2025-12-10",
  "startTime": "14:00",
  "endTime": "16:00",
  "location": "H1-101",
  "type": "offline",
  "maxStudents": 15
}

// Register for a session (student)
POST /api/sessions/{sessionId}/register
```

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

```bash
# Check if containers are running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart containers
docker-compose restart
```

### Reset Database

To completely reset the database:

```bash
# Stop and remove containers with volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait a few seconds, then seed
cd backend
npm run seed
```

### Common Issues

**Issue: `Connection refused`**
- Ensure Docker containers are running: `docker-compose ps`
- Check if port 5432 is available: `netstat -an | findstr 5432`

**Issue: `relation does not exist`**
- Run the init script: Tables should auto-create on first startup
- Or manually run: `docker-compose exec postgres psql -U tutor_admin -d tutor_support -f /docker-entrypoint-initdb.d/init.sql`

**Issue: `No data returned`**
- Run the seed script: `npm run seed`

## Development Tips

### Useful Commands

```bash
# View all users
docker-compose exec postgres psql -U tutor_admin -d tutor_support -c "SELECT id, username, role, name FROM users;"

# View all sessions
docker-compose exec postgres psql -U tutor_admin -d tutor_support -c "SELECT id, subject, date, status FROM sessions ORDER BY date DESC LIMIT 10;"

# Check database size
docker-compose exec postgres psql -U tutor_admin -d tutor_support -c "SELECT pg_size_pretty(pg_database_size('tutor_support'));"
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U tutor_admin tutor_support > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U tutor_admin tutor_support < backup.sql
```

## Production Deployment

For production:

1. Change default passwords in `docker-compose.yml`
2. Use environment variables for sensitive data
3. Enable SSL for PostgreSQL connections
4. Set up regular database backups
5. Configure connection pooling appropriately
6. Add proper indexes for performance

## Next Steps

To complete the migration:

1. Migrate remaining controllers (feedback, messages, notifications, etc.)
2. Update models.js with additional model functions
3. Remove old mock data files from `/data` folder
4. Add database migrations for schema changes
5. Implement proper error handling and transactions
6. Add database health checks
7. Set up automated backups

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
