# BusinessHub ERP — AI-Driven Enterprise Resource Planning Suite

![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20PostgreSQL-blue)
![AI Engine](https://img.shields.io/badge/AI-Ollama%20LLaMA3.1%3A8B-orange)
![Database](https://img.shields.io/badge/Database-100K%2B%20Records-green)

> **BusinessHub** is a next-generation ERP platform designed for retail businesses. It handles orders, inventory, customers, and provides AI-powered business insights using a local LLM.

---

## Features

- **Dashboard Analytics** — Sales, profit, regional performance, monthly trends
- **Dual-Layer Inventory** — Shop shelf and store room stock management
- **Order Management** — Full order lifecycle tracking
- **AI Business Assistant** — Chat with your data using Ollama Llama3.1:8B
- **Inventory Optimization** — ML-based stock recommendations
- **Anomaly Detection** — Z-Score based transaction outlier detection
- **Dark/Light Mode** — Modern responsive UI

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, Pydantic v2 |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts |
| **Database** | PostgreSQL |
| **AI** | Ollama (Llama3.1:8B) |

---

## Quick Start

### Prerequisites
- PostgreSQL (Port 5432)
- Node.js v22+
- Python 3.12
- Ollama (for AI features)

### Start Application

```bash
./start.sh
```

This will:
1. Start PostgreSQL
2. Create virtual environment & install dependencies
3. Setup database tables
4. Start backend on port 8000
5. Start frontend on port 5173

**Login**: `admin@businesshub.com` / `admin123`

---

## Data

The database contains realistic Indian retail data spanning **2019-2026**:
- 100,000+ customers
- 100,000+ products across 6 categories
- 100,000+ orders
- Store room inventory with realistic stock levels

### Generate Fake Data

To add more test data:
```bash
cd backend
source venv/bin/activate
python generate_fake_data.py
```

---

## AI Setup (Optional)

To enable AI insights:

```bash
ollama pull llama3.1:8b
ollama serve
```

The AI assistant will answer questions about your actual data range (2019-2026) and won't hallucinate information.

---

## Project Structure

```
├── backend/
│   ├── main.py           # FastAPI app entry
│   ├── models.py         # SQLAlchemy models
│   ├── routers/          # API endpoints
│   │   ├── dashboard.py  # Dashboard metrics
│   │   ├── inventory.py  # Inventory management
│   │   ├── orders.py     # Order management
│   │   └── analytics.py  # AI & analytics
│   └── services/         # Business logic
├── frontend/
│   └── src/
│       ├── pages/        # React pages
│       └── components/   # UI components
├── start.sh              # One-command startup
└── README.md
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/login` | User login |
| `GET /api/v1/dashboard/metrics` | Dashboard data |
| `GET /api/v1/inventory/` | Product list |
| `GET /api/v1/inventory/summary` | Inventory summary |
| `GET /api/v1/orders/` | Order list |
| `POST /api/v1/analytics/chat` | AI assistant |

---

Built for Intelligence. Designed for Business. **BusinessHub ERP.**
