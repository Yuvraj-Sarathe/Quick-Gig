@echo off
REM QuickGig backend — Flask + SQLite on http://127.0.0.1:5001
cd /d "%~dp0backend"

if not exist .venv\Scripts\python.exe (
  echo [First run] creating Python environment and installing dependencies...
  python -m venv .venv
  .\.venv\Scripts\python.exe -m pip install -r requirements.txt
)

echo [Backend] starting Flask on http://127.0.0.1:5001 ...
echo [Backend] keep this window OPEN while using the app.
.\.venv\Scripts\python.exe app.py

echo.
echo Backend stopped.
pause
