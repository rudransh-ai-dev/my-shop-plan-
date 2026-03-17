# Shop Project

A full-stack shop management system with FastAPI and React.

## 🪟 Windows Setup Guide

If you are moving this project from Linux to Windows, follow these steps to get started:

### 1. Prerequisites
* [Python 3.10+](https://www.python.org/downloads/)
* [Node.js & npm](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (For Database & Redis)
* [Git for Windows](https://git-scm.com/download/win)

### 2. Database Setup
1. Open Docker Desktop.
2. Open PowerShell or Command Prompt in the project root:
   ```powershell
   docker-compose up -d
   ```

### 3. Backend Setup
1. Navigate to the project root and create a fresh Windows virtual environment:
   ```powershell
   python -m venv backend/venv
   ```
2. Activate the virtual environment:
   ```powershell
   .\backend\venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```
4. Start the backend:
   ```powershell
   uvicorn backend.main:app --reload
   ```

### 4. Frontend Setup
1. Open a new terminal window.
2. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
3. Install and start:
   ```powershell
   npm install
   npm run dev
   ```

### 5. Access the App
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐧 Linux Setup (Original)
```bash
# Start Docker
sudo docker compose up -d

# Start Backend
source backend/venv/bin/activate
uvicorn backend.main:app --reload

# Start Frontend
cd frontend
npm run dev
```
 1. date 3 / 18 / 2026 project phase 1 compleat and phase 2 start we also compleat the live demo of this project on 3 / 16 / 2026 of phase 1 
 2. we made a small changes also 
