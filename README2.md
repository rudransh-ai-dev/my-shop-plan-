# 📦 Shop Hub ERP - Enterprise System Vision

A high-performance, multi-tenant ERP platform designed to bridge the gap between simple shop management and enterprise-grade business intelligence.

> [!IMPORTANT]
> **Implementation Guardrails**:
> - All new modules must ensure backward compatibility. No breaking changes to existing database schemas or API contracts.
> - All financial calculations must be **audit-safe and reproducible**.

---

## 🚀 Phase 1: Operational Core (Live)

### 📊 1. Operations Dashboard
- **Real-time Metrics**: Instant tracking of Daily Sales, Monthly Revenue, and Filtered Revenue.
- **Visual Analytics**: Interactive sales trend charts (Last 7 Days) for identifying peak business hours.
- **Critical Alerts**: Counter for "Low Stock" and "Out of Stock" items relative to safety stock levels.

### 🏭 2. Dual-Layer Inventory
- **Multi-Location Hierarchy**: Independent tracking for **Shop Shelf** vs. **Store Room**.
- **Logistics Flow**:
  ```mermaid
  flowchart LR
  Supplier -- Purchase --> StoreRoom
  StoreRoom -- Replenish --> Shop
  Shop -- Sale --> Customer
  Supplier -- Direct --> Shop
  ```

### 🧾 3. Compliant Invoicing
- **GST Engine**: Automated calculation of CGST, SGST, and IGST based on HSN logic.
- **Smart Sequence**: Dynamic invoice numbering aligned with the Indian Financial Year (April–March).
- **Precision Auditing**: Every transaction captures a precise **purchase date and timestamp** for historical accuracy.
- **Advanced Data Recovery**: Built-in search and filtering engine to isolate records by:
  - **Customer Identity**: Search by name or phone.
  - **Time Windows**: Filter by date range (Today, This Month, Custom).

---

## 🏗️ Phase 2: Business Intelligence Expansion (Current Focus)

### 📦 1. Advanced Inventory & Unit Logic
- **Precision Trading**: Support for fractional units (kg, g, pieces).
  - *Logic*: `Final Price = Actual Weight * Rate`.
  - *Storage*: **All quantities stored in base unit (e.g., kg)**. UI handles conversion/display (g, mg).
  - *Example*: 250g item @ ₹100/kg automatically bills at ₹25.
- **Inventory Precision**: Automated stock reduction based on fractional units.
- **Supplier Relationship Management (SRM)**: 
  - Track **Procurement Costs** vs. **Sales Revenue**.
  - Supplier-wise performance and lead-time tracking.

### 💰 2. Integrated Finance Layer
- **Payment Lifecycle Management**:
  - Support for **Cash, UPI, Card, and Store Credit (Udhaar)**.
  - **Customer Ledger**: Track "to-be-paid" balances for regular clients.
- **Valuation & Accounting**:
  - **FIFO/Average Costing**: Know the exact value of your warehouse at any moment.
  - **Profit Intelligence**: `Real Profit = Selling Price - Landed Cost (Purchase + Tax)`.
- **Dynamic Discounting**: Product-level (%) and Bill-level (Flat/%) discount triggers.

### 🤖 3. AI-Assisted System
- **Proactive Restocking**: Detects usage patterns to predict when stock will run out (**human approval required**).
- **Anomaly Detection**: Flags suspicious transactions or data errors for manual review.
- **Decision Support**: Recommends price adjustments based on sales velocity.

---

## 🌟 Phase 3: Enterprise Transformation (Future Roadmap)

### 👥 1. CRM & Loyalty Ecosystem
- **Customer Profiles**: Store purchase history, favorites, and contact data.
- **Loyalty Rewards**: Automated point calculation (e.g., 1 point per ₹100 spent) to drive repeat business.
- **Targeted Promotions**: Send customized offers via WhatsApp/SMS based on purchase history.

### 👔 2. Staff & Workforce Management
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Employees vs. Managers.
- **Attendance & Payroll**: Basic clock-in/out tracking integrated with monthly payroll calculation.
- **Commission Logic**: Incentivize staff with sales-based bonus tracking.

### 🏢 3. Multi-Store & Cloud Sync
- **Branch Management**: Centrally manage multiple shop locations from one Master Admin account.
- **Stock Transfers**: Inter-branch stock movement to optimize inventory across the city.
- **Unified Reporting**: Compare performance across different outlets in one dashboard.

### 📑 4. Compliance & Digital Integration
- **One-Click Tax Export**: Export GSTR-1 and GSTR-3B ready files for accountants.
- **Digital Billing**: WhatsApp integration to send PDF invoices directly to customer phones.
- **UPI Deep-Linking**: Verification of UPI payment status before stock is reduced (Zero-leakage).

---

## 🛠️ Technical Stack & Architecture
- **Frontend**: React + Tailwind CSS + Vite (Optimized for low-latency UI).
- **Backend**: FastAPI + Uvicorn (Asynchronous Python for high concurrency).
- **Security**: JWT-based Auth + Company-level data isolation (Tenant ID).
- **Persistence**: PostgreSQL + Redis (Caching for dashboard metrics).

---

## 🪟 Getting Started

### 📂 Quick Start
1. **Infra**: `docker-compose up -d`
2. **Backend**: `python -m venv backend/venv` -> `Scripts\activate` -> `pip install -r backend/requirements.txt` -> `uvicorn backend.main:app --reload`
3. **Frontend**: `cd frontend` -> `npm install` -> `npm run dev`

---
*Architectural Blueprint by Senior Systems Architect*
