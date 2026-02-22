@echo off
setlocal enabledelayedexpansion
title CVFlow - Stop
echo ============================================
echo           CVFlow - Stopping Project
echo ============================================
echo.

:: Kill processes on port 8066 (Backend)
echo [1/2] Stopping Backend (port 8066)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8066 ^| findstr LISTENING') do (
    :: Kill the child process (uvicorn server)
    taskkill /F /PID %%a >nul 2>&1
    :: Kill the parent process too (uvicorn --reload watchfiles reloader)
    for /f "tokens=2" %%b in ('wmic process where ^(ProcessId^=%%a^) get ParentProcessId ^| findstr /r "[0-9]"') do (
        taskkill /F /PID %%b >nul 2>&1
    )
    echo   Stopped PID %%a (and reloader parent)
)

:: Also kill any remaining python.exe running uvicorn (belt-and-suspenders)
taskkill /F /FI "WINDOWTITLE eq CVFlow-Backend*" >nul 2>&1

:: Kill processes on port 3066 (Frontend)
echo [2/2] Stopping Frontend (port 3066)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3066 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    for /f "tokens=2" %%b in ('wmic process where ^(ProcessId^=%%a^) get ParentProcessId ^| findstr /r "[0-9]"') do (
        taskkill /F /PID %%b >nul 2>&1
    )
    echo   Stopped PID %%a
)
taskkill /F /FI "WINDOWTITLE eq CVFlow-Frontend*" >nul 2>&1

:: Wait for OS to release ports
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo        CVFlow - Stopped Successfully
echo ============================================
echo.
echo   Port 8066 (Backend): Freed
echo   Port 3066 (Frontend): Freed
echo.
pause
