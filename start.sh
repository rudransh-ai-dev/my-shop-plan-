#!/bin/bash

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

# --- Database ---
echo ""
echo "[1.5/5] Ensuring database exists..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'businesshub'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE businesshub"
echo "  Database ready."

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

# --- Setup Database Tables ---
echo ""
echo "[3.5/5] Setting up database tables..."
cd "$PROJECT_DIR"
source backend/venv/bin/activate
python3 -c "
from backend.database import engine, Base
import backend.models
Base.metadata.create_all(bind=engine)
print('  Tables created.')
"
# Stamp alembic so migrations know current state
alembic -c backend/alembic.ini stamp head 2>/dev/null || true
# Seed admin user if not exists
python3 << 'SEED_EOF'
import psycopg2
from backend.security import get_password_hash
conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/businesshub')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM users')
if cur.fetchone()[0] == 0:
    cur.execute("INSERT INTO companies (name, gstin, address, is_active, created_at, updated_at) VALUES ('Main Shop', '27AADCB2230M1Z2', '123 Market St', true, now(), now()) RETURNING id")
    comp_id = cur.fetchone()[0]
    hashed = get_password_hash('admin123')
    cur.execute("INSERT INTO users (company_id, email, hashed_password, role, is_active, created_at, updated_at) VALUES (%s, 'admin@businesshub.com', %s, 'admin', true, now(), now())", (comp_id, hashed))
    conn.commit()
    print('  Admin user created (admin@businesshub.com / admin123)')
else:
    print('  Users already exist, skipping seed.')
cur.close()
conn.close()
SEED_EOF
echo "  Database setup done."

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