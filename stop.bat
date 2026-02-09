@echo off
title Recruit AI - Stop
echo ============================================
echo         RECRUIT AI - Stopping Project
echo ============================================
echo.

set FOUND=0

:: Kill processes on port 8066 (Backend)
echo [1/2] Stopping Backend (port 8066)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8066 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel!==0 (
        echo   Killed PID %%a
        set FOUND=1
    )
)

:: Also kill by window title
taskkill /FI "WINDOWTITLE eq Recruit-AI-Backend*" /F >nul 2>&1

:: Kill processes on port 3066 (Frontend)
echo [2/2] Stopping Frontend (port 3066)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3066 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel!==0 (
        echo   Killed PID %%a
        set FOUND=1
    )
)

:: Also kill by window title
taskkill /FI "WINDOWTITLE eq Recruit-AI-Frontend*" /F >nul 2>&1

echo.
echo ============================================
echo       RECRUIT AI - Stopped Successfully
echo ============================================
echo.
echo   Port 8066 (Backend): Freed
echo   Port 3066 (Frontend): Freed
echo.
pause
