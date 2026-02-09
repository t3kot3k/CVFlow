@echo off
title Recruit AI - Start
echo ============================================
echo         RECRUIT AI - Starting Project
echo ============================================
echo.

:: Check if ports are already in use
netstat -ano | findstr :8066 >nul 2>&1
if %errorlevel%==0 (
    echo [WARNING] Port 8066 is already in use. Run stop.bat first.
    echo.
    pause
    exit /b 1
)

netstat -ano | findstr :3066 >nul 2>&1
if %errorlevel%==0 (
    echo [WARNING] Port 3066 is already in use. Run stop.bat first.
    echo.
    pause
    exit /b 1
)

:: Start Backend
echo [1/2] Starting Backend (FastAPI) on port 8066...
cd /d "%~dp0backend"
start "Recruit-AI-Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8066"
cd /d "%~dp0"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend (Next.js) on port 3066...
cd /d "%~dp0frontend"
start "Recruit-AI-Frontend" cmd /c "npx next dev -p 3066"
cd /d "%~dp0"

:: Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo         RECRUIT AI - Running!
echo ============================================
echo.
echo   Backend API:  http://localhost:8066
echo   API Docs:     http://localhost:8066/api/v1/docs
echo   Frontend:     http://localhost:3066
echo.
echo   To stop: run stop.bat
echo ============================================
echo.
pause
