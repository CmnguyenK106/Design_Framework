@echo off
echo ========================================
echo   Starting Tutor Support System
echo ========================================
echo.

echo Checking if PostgreSQL is running...
docker-compose ps | findstr postgres > nul
if %errorlevel% neq 0 (
    echo PostgreSQL is not running. Starting containers...
    docker-compose up -d
    timeout /t 5 /nobreak > nul
) else (
    echo ✓ PostgreSQL is running
)
echo.

echo Starting backend server...
cd backend
call npm run dev
