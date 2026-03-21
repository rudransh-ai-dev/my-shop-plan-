# 🏪 Shop Hub ERP — AI-Powered Enterprise Resource Planning

> A full-stack, AI-integrated ERP system built as a **BCA 6th Semester Final Year Project**. Covers all 4 core subjects through real-world implementation.

---

## 🎓 BCA Subject Coverage

| Code | Subject | Implementation |
|------|---------|---------------|
| **BCA6001** | Information & Cyber Security | Audit trails, brute-force detection, SHA-256 PII hashing, encryption compliance dashboard |
| **BCA6002** | Internet of Things | Virtual sensor mesh, real-time weight/RFID simulation, hardware-to-cloud stock sync |
| **BCA6003** | E-Commerce | GST-compliant invoicing (CGST/SGST/IGST), customer billing, dual-layer inventory, multi-tenant architecture |
| **BCA6004** | Data Science & Machine Learning | Sales forecasting (Linear Regression), anomaly detection (Z-Score), consumption velocity analysis |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | FastAPI + Uvicorn (Python) |
| Database | PostgreSQL |
| ML/DS | scikit-learn, NumPy, Pandas, Statsmodels |
| Security | JWT Auth + bcrypt + SHA-256 |
| DevOps | Docker Compose + Git |

---

## 📂 Project Structure

```
shop-system/
├── backend/
│   ├── main.py                    # FastAPI application entry
│   ├── models.py                  # SQLAlchemy ORM models
│   ├── routers/
│   │   ├── auth.py                # JWT authentication
│   │   ├── dashboard.py           # Sales metrics & KPIs
│   │   ├── inventory.py           # Dual-layer stock management
│   │   ├── invoices.py            # GST-compliant billing
│   │   └── analytics.py           # ML/DS/IoT/Security endpoints
│   └── services/
│       ├── analytics.py           # [BCA6004] ML models
│       ├── cybersecurity.py       # [BCA6001] Threat detection
│       ├── iot.py                 # [BCA6002] Sensor simulation
│       ├── inventory_service.py   # Stock operations
│       └── invoice_service.py     # Invoice logic + GST
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx      # Operations hub
│       │   ├── AIInsights.jsx     # [BCA6004] ML predictions
│       │   ├── SecurityCenter.jsx # [BCA6001] Cyber security
│       │   ├── IoTMonitor.jsx     # [BCA6002] IoT dashboard
│       │   ├── Inventory.jsx      # Product management
│       │   ├── StoreRoom.jsx      # Warehouse management
│       │   ├── Invoices.jsx       # [BCA6003] Billing
│       │   └── Reports.jsx        # GST reports
│       └── components/
│           ├── Sidebar.jsx        # Navigation with BCA modules
│           └── Layout.jsx         # App shell
└── docker-compose.yml
```

---

## 🚀 Quick Start

### 1. Infrastructure
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🤖 ML/DS Features (BCA6004)

### Sales Forecasting
- **Algorithm**: `sklearn.linear_model.LinearRegression`
- **Input**: 30-day historical sales data
- **Output**: 7-day predicted revenue trend

### Anomaly Detection
- **Method**: Z-Score statistical analysis
- **Formula**: `Z = (X - μ) / σ`
- **Threshold**: |2.5| for medium, |3.5| for high severity

### Inventory Optimization
- **Method**: Consumption Velocity = `Σ(units_sold) / days`
- **Output**: Days-to-zero prediction per product

---

## 🔒 Cyber Security Features (BCA6001)

- **Brute-Force Detection**: Monitors login failures and flags suspicious patterns
- **PII Hashing**: Live SHA-256 cryptography demo
- **Encryption Compliance**: Automated scan for bcrypt/PBKDF2 compliance
- **Audit Trails**: Immutable logs for all security-sensitive operations

---

## 📡 IoT Features (BCA6002)

- **Virtual Sensor Mesh**: Simulates shelf-mounted weight/RFID sensors
- **Device Health Monitoring**: Signal strength, battery level, connectivity
- **Cloud Sync**: Real-time sensor → database stock updates

---

## 🛒 E-Commerce Features (BCA6003)

- **GST Engine**: Automated CGST, SGST, IGST calculation by HSN
- **Invoice Numbering**: Indian Financial Year format (APR–MAR)
- **Dual Inventory**: Shop Shelf vs. Store Room management
- **Customer Search**: By name, phone, date range

---

*Built with ❤️ as a BCA Final Year Project*