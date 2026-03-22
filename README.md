# 🚀 BusinessHub ERP — High-Performance AI-Driven Enterprise Suite

[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20PostgreSQL-blue)](https://github.com/rudransh-ai-dev)
[![AI Engine](https://img.shields.io/badge/AI-Ollama%20LLaMA3-orange)](https://ollama.ai)
[![Database](https://img.shields.io/badge/Database-6M%2B%20Records-green)](https://www.postgresql.org/)

> **BusinessHub** is a next-generation Enterprise Resource Planning (ERP) platform designed for massive scale. Unlike traditional small-scale projects, BusinessHub is engineered to handle millions of transactions with sub-50ms response times, integrated with a local LLM for real-time business intelligence.

---

## 🔥 What Makes This Special? (The "Spice")

- **🚀 2,500x Query Optimization**: Custom-tuned PostgreSQL indexing (Composite B-Tree & GIN) that dropped query times for 5 million records from **106ms to 0.04ms**.
- **🤖 Local-AI Assistant**: A built-in ChatGPT-style business analyst powered by **Llama3:8B** via Ollama. It reads your live revenue, stock, and GST data to give you instant strategic advice.
- **⚖️ Real-Time GST Engine**: Automated Indian Tax compliance (CGST/SGST/IGST) with HSN-code mapping and monthly tax liability auditing.
- **📦 Dual-Layer Inventory**: Professional-grade stock management separating "Shop Shelf" from "Store Room" with automated restocking triggers.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy (ORM), Pydantic v2 |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts (Modern UI/UX) |
| **Database** | PostgreSQL 15 (Native Linux/WSL Setup) |
| **AI / LLM** | Ollama (Llama3-8B), Requests, Prompt Engineering |
| **Caching** | Redis (Built-in Rate Limiting) |
| **Design** | HSL-based Dark Mode, Glassmorphism, Micro-animations |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **PostgreSQL** (Port 5433)
- **Redis** (Default Port)
- **Ollama** (For AI features)
- **Node.js & Python 3.10+**

### 2. Database Environment Setup
Ensure your PostgreSQL instance is running and the database `businesshub` is created.
```bash
# Example psql command
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE businesshub;"
```

### 3. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 5. AI Assistant Setup (Optional but recommended)
Launch the local LLM to enable the Business Intelligence chat:
```bash
ollama pull llama3
ollama run llama3  # Keeps the model 'warm' in RAM for faster responses
```

---

## 📂 Project Architecture

```text
├── backend/
│   ├── routers/        # API Endpoints (Invoices, Inventory, Analytics)
│   ├── models/         # Database Schema (SQLAlchemy)
│   ├── middleware/     # JWT Auth & Multi-tenant logic
│   └── services/       # Core Business Logic (GST Calc, Stock Flow)
├── frontend/
│   ├── src/pages/      # Dashboard, Invoices, Security, AI Chat
│   ├── src/components/ # Reusable UI Modules (Sidebar, Charts)
│   └── src/api/        # Axios client interceptors
└── README.md
```

---

## 📈 Engineering Depth: Performance Benchmarking

During development, we tested the engine against **6,000,000 records**. 

| Query Type | Original (Sequential) | Optimized (Indexed) | Speed Increase |
| :--- | :--- | :--- | :--- |
| **Invoice History** | 106.40 ms | **0.04 ms** | **2,500x ⚡** |
| **Monthly Revenue** | 283.15 ms | **130.42 ms** | **2.2x ⚡** |
| **SKU Search** | 0.45 ms | **0.38 ms** | Fast Baseline |

---

## 🔒 Security & Compliance
- **JWT Authentication**: Secure stateless user sessions.
- **PII Hashing**: Sensitive customer data is never stored in plain text.
- **GST Auditing**: Pre-calculated SGST/CGST split for every invoice.
- **Audit Trails**: Security logs for all critical stock movements.

---

Built for Speed. Engineered for Intelligence. **BusinessHub ERP.**