@echo off
setlocal enabledelayedexpansion

echo.
echo  ^<3  Starting HeartCheck AI...
echo.

:: ── Backend ──────────────────────────────────────────
echo [1/5] Setting up Python virtual environment...
cd /d "%~dp0backend"

if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat

echo [2/5] Installing Django dependencies...
pip install -q django djangorestframework djangorestframework-simplejwt django-cors-headers

echo [3/5] Running migrations and loading data...
python manage.py migrate --run-syncdb
python manage.py loaddata api/fixtures/initial_data.json 2>nul

echo [4/5] Starting Django backend on http://localhost:8000 ...
start "HeartCheck Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python manage.py runserver"

:: ── Frontend ─────────────────────────────────────────
echo [5/5] Installing and starting React frontend...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing npm packages - this may take a minute...
    npm install
)

echo.
echo =========================================
echo   HeartCheck AI is starting up!
echo   Open: http://localhost:3000
echo   API:  http://localhost:8000/api
echo =========================================
echo.
echo Close this window or press Ctrl+C to stop the frontend.
echo (Also close the Backend window to fully stop the app.)
echo.

set REACT_APP_API_URL=http://localhost:8000/api
npm start

