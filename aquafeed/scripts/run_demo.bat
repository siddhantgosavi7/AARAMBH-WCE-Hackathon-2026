@echo off
echo ==========================================
echo     AquaFeed Optimizer - Demo Launcher   
echo ==========================================

echo Starting Backend Service...
start "AquaFeed Backend" cmd /k "cd /d %~dp0..\backend && uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Seeding Demo Database...
python "%~dp0seed_db.py"

echo Starting Frontend Dev Server...
start "AquaFeed Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo AquaFeed Optimizer is launching!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
