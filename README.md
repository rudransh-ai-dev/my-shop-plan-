# 🚀 BusinessHub ERP — High-Performance AI-Driven Enterprise Suite

[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20PostgreSQL-blue)](https://github.com/rudransh-ai-dev)
[![AI Engine](https://img.shields.io/badge/AI-Ollama%20LLaMA3.1-orange)](https://ollama.ai)
[![Database](https://img.shields.io/badge/Database-6M%2B%20Records-green)](https://www.postgresql.org/)

> **BusinessHub** is a next-generation Enterprise Resource Planning (ERP) platform designed for massive scale. Unlike traditional small-scale projects, BusinessHub is engineered to handle millions of transactions with sub-50ms response times, integrated with a local LLM for real-time business intelligence.

---

## 🔥 What Makes This Special?

- **🚀 2,500x Query Optimization**: Custom-tuned PostgreSQL indexing (Composite B-Tree & GIN) that dropped query times for 5 million records from **106ms to 0.04ms**.
- **🤖 Local-AI Assistant**: A built-in ChatGPT-style business analyst powered by **Llama3.1:latest** via Ollama. It reads your live revenue, stock, and GST data to give you instant strategic advice.
- **⚖️ Real-Time GST Engine**: Automated Indian Tax compliance (CGST/SGST/IGST) with HSN-code mapping and monthly tax liability auditing.
- **📦 Dual-Layer Inventory**: Professional-grade stock management separating "Shop Shelf" from "Store Room" with automated restocking triggers.
- **🌐 IoT Integration**: Connects with live hardware/sensors via HTTP routes, converting real-time stock-shelf weight into software-rendered analytics.
- **🔐 Cyber Security Dashboards**: Proactive Threat Detection and Cryptographic hashing auditing right inside the application.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy (ORM), Pydantic v2 |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Database** | PostgreSQL 15 |
| **AI / LLM** | Ollama (Llama3.1-8B), Requests, Prompt Engineering |
| **Design** | Modern Glassmorphism, Dynamic Micro-Animations, Real-time dark mode |

---

## 🗄️ Demo Data & Environment Enhancements

To make the application functionally vibrant, the database has been primed with realistic data for the Dashboard:

- **Robust Accounts**: Auto-generated Administrative SQL account bypassing dependency hashing issues.
- **Full Ledger System**: **480 randomized Indian orders** spread across current Year & Month, populating dynamic Recharts graphs.
- **Product Ecosystem**: 15 distinct products across 7 categories (Technology, Furniture, Clothing, Food).
- **Responsive Layouts**: Fixed UX styling involving the Global Navigation Header layout overlaps and Recharts responsive container tracking.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
> 🐧 **Note on Environment:** This project was developed and explicitly tested on **Linux Pop!_OS**. Windows users may want to utilize WSL2 to closely match the terminal startup commands.

- **PostgreSQL** (Port 5432)
- **Node.js** (v22+)
- **Python** (v3.12)
- **Ollama** (For AI features)

### 2. Database Environment Setup
Make sure you have PostgreSQL running, and a database named `businesshub` ready with password `password`:
```bash
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE businesshub;"
```

### 3. Backend (FastAPI) Setup
The backend schema handles custom Table structures and data generation automatically.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python migrate_csv.py  # (Builds SQL Schema + Admin user + Stock items)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend (React) Setup
```bash
cd frontend
nvm use 22
npm install
npm run dev
```
Navigate to: **http://localhost:5174**  
Login: `admin@businesshub.com` / `admin123`

### 5. AI Assistant Setup (Optional but recommended)
Launch the local LLM to enable the Business Intelligence chat in your ERP:
```bash
ollama pull llama3.1
ollama run llama3.1
```

---

## 🔒 Security & Compliance
- **JWT Authentication**: Secure stateless user sessions.
- **PII Hashing**: Sensitive customer data is never stored in plain text.
- **Intrusion Detection**: Detects and alerts Brute Force IPs across the company network instances.
- **Audit Trails**: Non-repudiation security logs for all critical stock movements.

---

Built for Speed. Engineered for Intelligence. **BusinessHub ERP.**