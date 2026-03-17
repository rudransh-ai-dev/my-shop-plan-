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

## 🌟 Phase 2: Enterprise Transformation (Future Roadmap)

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

## 🔐 Production Hardening (Must-Adds Before Scaling)

This system is intended to run as a real shop operations platform. Before scaling users/data, **these safeguards are required**.

### 🧱 Database Schema (tables, relations, indexes)

**Core tables (current + required to formalize):**
- **`companies`**: tenant root
- **`users`**: belongs to `companies` (RBAC via `role`)
- **`products`**: belongs to `companies`
  - **Shop shelf stock**: `products.stock`
  - **Store room stock**: `products.store_room_stock`
  - **Total sold**: `products.total_sold`
- **`invoices`**: belongs to `companies`
- **`invoice_items`**: belongs to `invoices`, references `products`
- **`stock_movements`**: belongs to `companies`, references `products` (all stock-affecting actions)
- **`audit_logs`**: belongs to `companies`, references `users` (who did what, when)

**Relationships (minimum):**
- `users.company_id → companies.id`
- `products.company_id → companies.id`
- `invoices.company_id → companies.id`
- `invoice_items.invoice_id → invoices.id`
- `invoice_items.product_id → products.id`
- `stock_movements.product_id → products.id` (+ `company_id`)
- `audit_logs.user_id → users.id` (+ `company_id`)

**Indexes (minimum for performance + correctness):**
- **Multi-tenant access**: index every tenant-owned row on `company_id`
- **Products lookup**: `(company_id, sku)` unique; `(company_id, name)` for search
- **Invoices**: `(company_id, invoice_date)` for reporting; `(company_id, invoice_number)` unique
- **Invoice items**: `(invoice_id)` and `(product_id)`
- **Stock movements**: `(company_id, product_id, created_at)` for history + analytics
- **Audit logs**: `(company_id, created_at)` and `(company_id, action)`

### 🧾 Audit Logs (who changed what, when)

**Goal**: every business-critical mutation is traceable and explainable.

**What must be logged:**
- Product CRUD, stock updates (move/sell/restock/adjust)
- Invoice create/update/cancel + payment status changes
- Auth events (login, refresh, logout, failed auth)
- Admin actions (role changes, user management)

**Log payload (recommended):**
- **actor**: `user_id`, role, `company_id`, request IP/user-agent
- **action**: stable string enum (e.g., `PRODUCT_STOCK_SALE`)
- **entity**: `entity_type`, `entity_id`
- **before/after**: JSON snapshots or JSON Patch diff (avoid storing secrets)
- **correlation**: `request_id` for end-to-end tracing

### 🧯 Error Handling + Rollback (transactions)

All operations that change money or stock **must be atomic**.

**Rules:**
- Wrap “invoice create + stock reduce + movement log + audit log” in **one DB transaction**
- On any validation or persistence failure, **rollback** and return a clean API error
- Never partially apply stock changes

**Implementation standard (backend):**
- Use a transaction boundary per request (service-layer pattern)
- Use row-level locking for stock (see “Stock locking” below)
- Ensure movement/audit writes happen *inside* the same transaction as the stock/invoice mutation

### 🚦 Rate Limiting + Auth Security

**Auth hardening:**
- Enforce strong password hashing (bcrypt/argon2)
- Token rotation + short-lived access tokens
- Validate tenant context: `X-Company-ID` must match authenticated user’s tenant
- Centralized permission checks (RBAC) per route/service

**Rate limiting (minimum):**
- Limit login, token refresh, and stock mutation endpoints
- Add per-IP + per-user limits (burst + sustained)
- Return `429` with retry-after

**Operational protections:**
- Structured request/response logging (exclude secrets)
- CORS strict allowlist (no `*` in production)
- Security headers (HSTS, CSP as applicable)

---

## 🛡️ Strongly Recommended (You’ll Thank Yourself Later)

### 💾 Backup System (daily auto dump)
- Daily automated PostgreSQL dumps (`pg_dump`) with retention (e.g., 14–30 days)
- Encrypt backups at rest, store off-machine (S3/Drive/NAS)
- Monthly restore drill: verify backups actually restore
- Track backup status/alerts (missed backup = page someone)

### 🔒 Stock Locking (prevent double sale)
Prevent race conditions when two cashiers sell the same item simultaneously.

**Standard approach:**
- Use `SELECT ... FOR UPDATE` on the `products` row during stock mutations
- Validate availability after lock, then decrement and commit
- Keep the locked transaction short (no slow network calls inside)

### 🧾 Invoice PDF Storage
- Generate invoice PDF at create-time or on-demand, then store:
  - **Option A**: filesystem path + metadata in DB
  - **Option B**: object storage (S3-compatible) + signed download URLs
- Add a DB table like `invoice_documents(invoice_id, storage_key, mime_type, created_at, checksum)`

### 🧩 API Versioning
- Introduce versioned routing early: `/api/v1/...`
- Maintain backward compatibility; only break in `/api/v2`
- Document deprecation windows in release notes

---

## 🧩 Nice Later (Roadmap)
- **Webhooks**: push events like `invoice.created`, `stock.low`, `product.updated`
- **Plugin system**: controlled extension points (reporting, integrations, custom workflows)

## 🪟 Getting Started

### 📂 Quick Start
1. **Infra**: `docker-compose up -d`
2. **Backend**: `python -m venv backend/venv` -> `Scripts\activate` -> `pip install -r backend/requirements.txt` -> `uvicorn backend.main:app --reload`
3. **Frontend**: `cd frontend` -> `npm install` -> `npm run dev`

---
*Architectural Blueprint by Senior Systems Architect*
