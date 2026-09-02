@echo off
REM One-click launcher for the Help Desk Portal (Windows).
REM Opens two windows: the backend API and the frontend dev server.
REM Close either window to stop that server.

echo == Help Desk Portal ==

echo.
echo [1/2] Starting backend (helpdesk-server) on http://localhost:4000 ...
start "Help Desk - Backend" cmd /k "cd /d %~dp0helpdesk-server && npm install && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting frontend (helpdesk-app) on http://localhost:5173 ...
start "Help Desk - Frontend" cmd /k "cd /d %~dp0helpdesk-app && npm install && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Your browser should open automatically once the frontend is ready.
echo Keep both windows open while you use the site.
