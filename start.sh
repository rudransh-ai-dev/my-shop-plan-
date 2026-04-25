#!/bin/bash


#use . /start.sh for starting the project

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "  My Shop Plan - Setup & Start"
echo "========================================"

# --- PostgreSQL ---
echo ""
echo "[1/5] Starting PostgreSQL..."
sudo service postgresql start
echo "  PostgreSQL started."

# --- Backend Dependencies ---
echo ""
echo "[2/5] Installing backend dependencies..."
cd "$PROJECT_DIR/backend"

if [ ! -f "venv/bin/activate" ]; then
    echo "  Creating virtual environment..."
    rm -rf venv
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
echo "  Backend dependencies installed."

# --- Frontend Dependencies ---
echo ""
echo "[3/5] Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install --silent
echo "  Frontend dependencies installed."

# --- Start Backend ---
echo ""
echo "[4/5] Starting backend (uvicorn on port 8000)..."
cd "$PROJECT_DIR"
source backend/venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "  Backend started (PID: $BACKEND_PID)"

# --- Start Frontend ---
echo ""
echo "[5/5] Starting frontend (vite on port 5173)..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "  Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "========================================"
echo "  Both servers are running!"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "========================================"
echo "  Press Ctrl+C to stop both servers."
echo ""

# Stop both servers on Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Done.'; exit 0" SIGINT SIGTERM

# Wait so the script stays alive
wait