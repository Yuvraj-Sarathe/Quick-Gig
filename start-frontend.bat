@echo off
REM QuickGig frontend — React + Vite on http://localhost:3000
cd /d "%~dp0frontend"

if not exist node_modules (
  echo [First run] installing npm dependencies...
  call npm install
)

echo [Frontend] starting Vite on http://localhost:3000 ...
echo [Frontend] THE APP lives here: open http://localhost:3000 in your browser.
call npm run dev

echo.
echo Frontend stopped.
pause
