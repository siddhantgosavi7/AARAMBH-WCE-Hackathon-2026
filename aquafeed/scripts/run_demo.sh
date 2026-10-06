#!/usr/bin/env bash
# AquaFeed Optimizer One-Click Demo Runner
set -e

echo "=========================================="
echo "    AquaFeed Optimizer - Demo Launcher   "
echo "=========================================="

# Check if docker-compose is available
if command -v docker &> /dev/null; then
    echo "Starting services via Docker Compose..."
    docker compose up --build -d
    echo "Waiting for backend health check..."
    sleep 5
    echo "Seeding demo database with 3 scenario ponds..."
    docker compose exec backend python /app/../scripts/seed_db.py || python ../scripts/seed_db.py
    echo "Demo ready!"
    echo "Frontend UI: http://localhost:3000"
    echo "Backend API: http://localhost:8000/docs"
else
    echo "Docker not detected. Starting local processes..."
    cd ../backend
    pip install -r requirements.txt
    uvicorn app.main:app --port 8000 &
    BACKEND_PID=$!
    cd ../scripts
    python seed_db.py
    cd ../frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    echo "AquaFeed Optimizer running locally!"
    wait $BACKEND_PID $FRONTEND_PID
fi
