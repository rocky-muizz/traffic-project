@echo off
title SmartFlow AI - Bangalore Adaptive Traffic Controller
echo =========================================================
echo   SmartFlow AI: Traffic Signal Control System
echo =========================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js LTS from: https://nodejs.org/
    echo (After installing, close and reopen Command Prompt and run this file again.)
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js detected:
node -v
echo.

:: Install dependencies if node_modules does not exist
if not exist node_modules (
    echo [2/3] First-time setup: Installing lightweight dependencies (~150MB)...
    echo       (This may take 1-2 minutes, please wait)
    call npm install --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] npm install failed.
        echo Possible reasons:
        echo 1. Your disk is out of free space. Clear at least 300MB on your drive.
        echo 2. Check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies already present.
)

echo.
echo =========================================================
echo   SELECT DEMO MODE:
echo =========================================================
echo   1. Full Graphical Web Demo (Browser: http://localhost:3000) [Default]
echo   2. Command Prompt Live Code Demo (Runs directly inside this terminal)
echo =========================================================
set /p DEMO_CHOICE="Enter 1 or 2 (Press Enter for 1): "

if "%DEMO_CHOICE%"=="2" (
    echo.
    echo Launching Command Prompt Terminal Demo...
    node demo.js
    pause
    exit /b 0
)

echo.
echo [3/3] Launching web server on http://localhost:3000 ...
echo =========================================================
echo Open your browser and navigate to: http://localhost:3000
echo Press Ctrl + C in this window to stop the server.
echo =========================================================
echo.

call npm run dev
pause
