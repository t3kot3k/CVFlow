@echo off
title CVFlow - Start
echo ============================================
echo           CVFlow - Starting Project
echo ============================================
echo.

:: Check if ports are already in use (LISTENING only — ignore TIME_WAIT / ESTABLISHED)
netstat -ano | findstr :8066 | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
    echo [WARNING] Port 8066 is already in use. Run stop.bat first.
    echo.
    pause
    exit /b 1
)

netstat -ano | findstr :3066 | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
    echo [WARNING] Port 3066 is already in use. Run stop.bat first.
    echo.
    pause
    exit /b 1
)

:: Start Backend
echo [1/2] Starting Backend (FastAPI) on port 8066...
cd /d "%~dp0backend"
start "CVFlow-Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8066"
cd /d "%~dp0"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend (Next.js) on port 3066...
cd /d "%~dp0frontend"
start "CVFlow-Frontend" cmd /c "pnpm dev -p 3066"
cd /d "%~dp0"

:: Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo            CVFlow - Running!
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
