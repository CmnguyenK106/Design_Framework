@echo off
echo ========================================
echo   Tutor Support System - PostgreSQL Setup
echo ========================================
echo.

echo [1/5] Starting PostgreSQL and pgAdmin containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker containers
    echo Make sure Docker Desktop is running!
    pause
    exit /b 1
)
echo ✓ Containers started successfully
echo.

echo Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak > nul
echo.

echo [2/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [3/5] Seeding database with test data...
call npm run seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    echo The database might not be ready yet. Try running: npm run seed
    pause
    exit /b 1
)
echo ✓ Database seeded with test data
echo.

echo [4/5] Testing database connection...
curl -s http://localhost:3000/api/health > nul 2>&1
echo.

echo [5/5] Setup complete!
echo.
echo ========================================
echo   Ready to use!
echo ========================================
echo.
echo PostgreSQL:  localhost:5432
echo pgAdmin:     http://localhost:5050
echo   Login:     admin@tutorsupport.com / admin123
echo.
echo Backend API will start on: http://localhost:3000
echo.
echo Demo Accounts:
echo   Admin:   admin / admin
echo   Tutor:   tutor / tutor
echo   Student: 2312487 / demo
echo.
echo ========================================
echo.
echo To start the backend server, run:
echo   cd backend
echo   npm run dev
echo.
pause
