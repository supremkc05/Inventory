# DokanDaftar

**Inventory, Billing & VAT Management for Nepali Businesses**

DokanDaftar ("Shop Records") is a multi-tenant SaaS platform that helps Nepali retailers, wholesalers, and small businesses manage inventory, generate IRD-compliant VAT invoices, track customer dues, and stay compliant with Nepal's fiscal year and VAT filing requirements — all in one place.

---

## Table of Contents

1. [Decisions Locked](#decisions-locked)
2. [Problem Statement](#problem-statement)
3. [Goals & Non-Goals](#goals--non-goals)
4. [Tech Stack](#tech-stack)
5. [System Architecture](#system-architecture)
6. [Core Domain Concepts](#core-domain-concepts)
7. [Database Schema](#database-schema)
8. [API Design](#api-design)
9. [Multi-Tenancy & Security Model](#multi-tenancy--security-model)
10. [Nepal-Specific Business Rules](#nepal-specific-business-rules)
11. [Background Jobs](#background-jobs)
12. [Project Structure](#project-structure)
13. [Local Development Setup](#local-development-setup)
14. [Environment Variables](#environment-variables)
15. [Testing Strategy](#testing-strategy)
16. [Deployment](#deployment)
17. [Observability](#observability)
18. [Roadmap](#roadmap)

---

## Decisions Locked

Agreed product/architecture decisions (source of truth for MVP):

| Topic | Decision |
|---|---|
| Frontend | **React + Vite + TypeScript** SPA |
| Build order | **Database design first**, then API, then UI |
| Offline | **Phase 4 only** — not claimed for MVP |
| MVP schema | **Lean**: Business, User, Category, Product, Stock, StockMovement, Customer, Sale, SaleItem, CreditNote, CreditNoteItem, Payment (Sale only). No Vendor/Purchase/Warehouse in MVP |
| Discounts | **None in MVP** (line or invoice) |
| VAT calculation | Line subtotal → VAT on that amount (if applicable) → **round VAT only** (2 decimal places). No discount step |
| Invoice numbering | **One shared sequence** per `(business, fiscal_year)` for Tax Invoice and Abbreviated Bill; bill type stored on `Sale` |
| Number reset | Counters reset at fiscal year end: **Ashad 31 BS** (Shrawan 1 starts the new year) |
| Credit notes | **Full credit-note documents** with a **separate** number series; also resets on Ashad 31 BS |
| Roles | `owner`, `admin`, `accountant` (see [role matrix](#roles)) |

---

## Problem Statement

Most small and medium Nepali businesses (kirana shops, pharmacies, distributors, small wholesalers) still track inventory and dues on paper (khata), calculate VAT manually, and issue handwritten bills. This leads to:

- Inaccurate stock counts and stockouts/overstock
- Manual, error-prone VAT calculation
- Difficulty producing IRD-compliant tax invoices
- No visibility into customer credit ("udhaaro")
- No data to support loan/credit applications with banks

DokanDaftar solves this with a lightweight, Nepal-first inventory and billing system. Offline-first POS with sync is planned for a later phase (Phase 4), not MVP.

## Goals & Non-Goals

**Goals**

- Accurate, auditable inventory tracking (single location in MVP)
- IRD-compliant Tax Invoice and Abbreviated Bill generation, plus credit notes
- Nepali fiscal year (Shrawan 1 – Ashad 31 BS) and Bikram Sambat date support throughout
- Multi-tenant architecture — one deployment serves many businesses
- Fast daily/monthly reporting for owners and accountants

**Non-Goals (for MVP)**

- Discounts (line or invoice)
- Vendor / purchase / input VAT tracking — Phase 2
- Multi-branch / warehouse — Phase 3
- Offline-tolerant or offline-first POS — Phase 4
- Direct government e-filing integration (IRD CBMS) — Phase 4
- Full accounting/general ledger (double-entry bookkeeping)
- Payroll/HR management
- Native mobile apps (web-responsive first)

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend framework | Django | Business logic, ORM, admin |
| API layer | Django REST Framework (DRF) | REST API for TS frontend |
| Auth | `djangorestframework-simplejwt` | JWT access/refresh tokens |
| Frontend | **React + Vite + TypeScript** | SPA consuming the DRF API |
| Database | PostgreSQL | Decimal-safe money handling, strong indexing |
| Cache / Broker | Redis | Caching + Celery broker |
| Async tasks | Celery | Reminders, alerts (Phase 2+); optional in MVP |
| Containerization | Docker + Docker Compose | Local dev + deployment parity |
| PDF generation | WeasyPrint | HTML → PDF invoices & credit notes |
| API docs | drf-spectacular | OpenAPI schema, also used to generate TS types |
| BS/AD conversion | `nepali-datetime` (or equivalent) | Bikram Sambat ↔ Gregorian conversion |

---

## System Architecture

```
                         ┌─────────────────────┐
                         │  React + Vite + TS   │
                         │       SPA            │
                         └──────────┬───────────┘
                                    │ HTTPS / REST (JWT)
                                    ▼
                         ┌─────────────────────┐
                         │   Nginx (reverse     │
                         │   proxy / static)    │
                         └──────────┬───────────┘
                                    ▼
                         ┌─────────────────────┐
                         │   Django + DRF       │
                         │   (Gunicorn workers) │
                         └──────┬───────┬───────┘
                                │       │
                     ┌──────────┘       └──────────┐
                     ▼                              ▼
           ┌───────────────────┐         ┌────────────────────┐
           │   PostgreSQL       │         │   Redis             │
           │  (primary data)    │         │ (cache + broker)    │
           └───────────────────┘         └──────────┬─────────┘
                                                       ▼
                                            ┌────────────────────┐
                                            │  Celery Workers     │
                                            │ (Phase 2+: reminders│
                                            │  alerts, reports)   │
                                            └────────────────────┘
```

**Request flow example — creating a Sale:**

1. Frontend sends `POST /api/v1/sales/` with cart items
2. DRF validates payload via serializer
3. View calls a `SalesService.create_sale()` function wrapped in `transaction.atomic()`
4. Service: validates stock availability → for each line: subtotal → VAT (if applicable) → round VAT → generates next invoice number (locked) → creates `Sale` + `SaleItem` rows → writes `StockMovement` rows → updates `Stock.quantity` → updates `Customer.current_due_balance` if unpaid
5. Response returns serialized `Sale` with invoice number; frontend triggers PDF download/print

**Build order:** design and migrate the database schema first; then DRF services/API; then the React + Vite UI.

---

## Core Domain Concepts

- **Business** — the tenant. Every other model is scoped to a `Business`.
- **Fiscal Year** — Nepal's fiscal year runs **Shrawan 1 to Ashad 31 BS**. Invoice and credit-note numbering and VAT reports are scoped per fiscal year. Counters reset when the new year starts (after Ashad 31).
- **Dual Calendar** — every date-bearing transaction stores both `date_ad` (Gregorian, for computation/sorting) and `date_bs` (Bikram Sambat, for display and fiscal-year grouping).
- **VAT Snapshot** — VAT rate/applicability is captured on the `SaleItem` / `CreditNoteItem` at document time, not re-derived from the current `Product` state.
- **No discounts (MVP)** — totals are quantity × unit price; VAT applies to that line subtotal only.
- **Stock Ledger Pattern** — `Stock.quantity` is a cached/derived value; `StockMovement` is the append-only source of truth. Every stock change (sale, credit note, damage, adjustment) is logged, never overwritten silently.
- **Bill Types** — IRD distinguishes a **Tax Invoice** (requires buyer PAN, for B2B) from an **Abbreviated Bill** (retail/consumer, no buyer PAN required). Both share one invoice number sequence; `bill_type` is stored on `Sale`.
- **Credit Notes** — full documents with their own number series; reverse stock and adjust customer due; reference the original sale when applicable.

---

## Database Schema

> **MVP first.** Phase 2+ tables (Vendor, Purchase, Warehouse, etc.) are deferred — do not include them in the initial migrations.

### Entity Relationship Overview (MVP)

```
Business ─┬─< User
          ├─< Category ─< Product ─< Stock
          ├─< Customer
          ├─< Sale ─< SaleItem >─ Product
          │      ├─< Payment
          │      └─< CreditNote ─< CreditNoteItem >─ Product
          ├─< DocumentCounter   (invoice + credit_note sequences per FY)
          └─< StockMovement >─ Product
```

### Key Tables (MVP)

| Table | Purpose | Key constraints |
|---|---|---|
| `Business` | Tenant record | unique `pan_vat_number` |
| `User` | Staff accounts | FK `business`, `role` ∈ {owner, admin, accountant} |
| `Category` | Product grouping | self-FK for subcategories |
| `Product` | Catalog item | unique (`business`, `sku`); `vat_applicable`, `vat_rate` |
| `Stock` | Current qty per product (single location) | unique (`business`, `product`) |
| `StockMovement` | Append-only stock audit log | indexed on `product`, `timestamp` |
| `Customer` | Buyer records | PAN format validated when present |
| `Sale` | Invoice header | unique (`business`, `fiscal_year`, `invoice_number`); `bill_type` |
| `SaleItem` | Invoice line items | VAT snapshot fields; **no discount fields** |
| `CreditNote` | Credit note header | unique (`business`, `fiscal_year`, `credit_note_number`); FK `sale` (optional/required as designed) |
| `CreditNoteItem` | Credit note lines | VAT snapshot; qty returned |
| `Payment` | Payment against a Sale | FK `sale` (not polymorphic in MVP) |
| `DocumentCounter` | Locked counters for invoice / credit note | unique (`business`, `fiscal_year`, `document_type`) |

**Money fields**: always `DecimalField(max_digits=12, decimal_places=2)` — never `FloatField`.

**Indexes**: `business_id`, `date_ad`, `date_bs`, `invoice_number`, `credit_note_number`, `customer_id`, `product_id`.

### Deferred to later phases

| Phase | Tables / concepts |
|---|---|
| Phase 2 | `Vendor`, `Purchase`, `PurchaseItem`; payments against purchases; input VAT |
| Phase 3 | `Warehouse`; stock unique on (`product`, `warehouse`); transfers |
| Phase 4 | Offline sync entities / outbox (as needed) |

---

## API Design

- Base path: `/api/v1/`
- Auth: `POST /api/v1/auth/login/`, `POST /api/v1/auth/refresh/`
- Resources follow REST conventions via DRF `ViewSet` + `Router`:
  - `/api/v1/products/`
  - `/api/v1/stock/`
  - `/api/v1/sales/` (+ `POST /sales/{id}/void/` if kept alongside credit notes)
  - `/api/v1/credit-notes/`
  - `/api/v1/customers/`
  - `/api/v1/payments/`
  - `/api/v1/reports/daily-sales/`
  - `/api/v1/reports/vat-summary/`
- Filtering via `django-filter` (date range, payment status, customer, bill type)
- Pagination: cursor or page-number pagination on all list endpoints
- OpenAPI schema via `drf-spectacular` → TypeScript types via `openapi-typescript`

---

## Multi-Tenancy & Security Model

- **Tenant isolation**: every model (except `Business` itself) has a `business` FK. A custom `TenantScopedViewSet` mixin auto-filters all querysets by `request.user.business` — no endpoint may leak cross-tenant data.
- **Auth**: JWT access + refresh tokens; refresh rotation enabled; tokens include `business_id` and `role` claims.
- **Soft deletes**: `Product`, `Customer` use `is_active` rather than hard deletes.
- **Audit trail**: `StockMovement` and `Payment` are append-only; sales are voided or reversed via credit notes, never hard-deleted.

### Roles

| Capability | owner | admin | accountant |
|---|---|---|---|
| Manage users / business settings | ✓ | — | — |
| Products, stock adjust, customers | ✓ | ✓ | — |
| Create sales / credit notes | ✓ | ✓ | — |
| Record payments | ✓ | ✓ | — |
| Void sales | ✓ | ✓ | — |
| Reports / VAT export (read) | ✓ | ✓ | ✓ |
| Read sales / payments | ✓ | ✓ | ✓ |

Enforced via custom DRF permission classes (`IsBusinessOwner`, `HasRole(...)`).

---

## Nepal-Specific Business Rules

- **VAT rate**: 13% standard, stored as configurable (`DEFAULT_VAT_RATE` / per-product). Exempt goods via `vat_applicable = false`.
- **VAT math (MVP)**: for each taxable line: `subtotal = qty × unit_price` → `vat = round(subtotal × rate, 2)`. **No discounts.** Exempt lines: `vat = 0`.
- **Fiscal year**: Shrawan 1 – **Ashad 31 BS**. Document numbers reset per `(business, fiscal_year)`.
- **Invoice numbering**: one shared sequence for Tax Invoice and Abbreviated Bill; concurrency via `select_for_update()` on `DocumentCounter` (or equivalent).
- **Credit note numbering**: separate sequence per `(business, fiscal_year)`; also resets after Ashad 31 BS.
- **PAN validation**: Nepali PAN is 9 digits; required for Tax Invoice (B2B).
- **Bill type logic**: Tax Invoice requires customer PAN; Abbreviated Bill does not.

---

## Background Jobs

Handled via Celery + Redis (**Phase 2+** primary use; may be stubbed in MVP):

- Overdue payment reminders (SMS/notification)
- Low-stock alert notifications
- Scheduled VAT summary report pre-computation (optional, for large datasets)
- Recurring billing (Phase 3)

---

## Project Structure

```
DokanDaftar/
├── backend/
│   ├── config/                # settings, urls, celery.py, wsgi/asgi
│   │   └── settings/
│   │       ├── base.py
│   │       ├── dev.py
│   │       └── prod.py
│   ├── apps/
│   │   ├── accounts/           # Business, User, roles, JWT auth
│   │   ├── inventory/          # Category, Product, Stock, StockMovement
│   │   ├── sales/              # Sale, SaleItem, CreditNote, counters, VAT service
│   │   ├── parties/            # Customer (Vendor in Phase 2)
│   │   ├── payments/           # Payment (FK → Sale)
│   │   ├── reports/            # aggregation views, VAT summary
│   │   └── core/               # BaseModel, BS/AD conversion, fiscal year helpers
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   └── manage.py
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/                # typed API client
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/              # generated from OpenAPI schema
│   │   └── hooks/
│   ├── vite.config.ts
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## Local Development Setup

```bash
# Clone repo
git clone <repo-url> dokandaftar && cd dokandaftar

# Copy env template
cp .env.example .env

# Build and start all services
docker compose up --build

# Run migrations (in a new terminal)
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Frontend available at http://localhost:3000
# Backend API available at http://localhost:8000/api/v1/
# API docs at http://localhost:8000/api/schema/swagger-ui/
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DJANGO_DEBUG` | `True`/`False` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | DB credentials |
| `DATABASE_URL` | Full DB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_TOKEN_LIFETIME` | e.g. `15m` |
| `JWT_REFRESH_TOKEN_LIFETIME` | e.g. `7d` |
| `DEFAULT_VAT_RATE` | e.g. `13.00` (configurable, not hardcoded) |
| `CORS_ALLOWED_ORIGINS` | Frontend origin(s) |

---

## Testing Strategy

- **Unit tests**: VAT calculation (exempt items, mixed carts, rounding), fiscal-year boundary (Ashad 31 → Shrawan 1), BS/AD conversion
- **Concurrency tests**: invoice and credit-note numbering under parallel requests
- **Transactional tests**: stock deduction on sale / restoration on credit note; `StockMovement` + `Stock.quantity` consistency
- **API/permission tests**: tenant isolation; role matrix (owner / admin / accountant)
- **Fixtures**: Nepali fiscal year boundaries and BS leap-month edge cases

Tools: `pytest-django`, `factory_boy`, `pytest-cov`.

---

## Deployment

- `docker-compose.prod.yml` runs: `nginx`, `backend` (Gunicorn), `frontend` (Vite build served via Nginx), `db`, `redis`, `celery-worker`, `celery-beat`
- Migrations and static collection via container entrypoint on deploy
- `/api/v1/health/` for load balancer / uptime checks
- Recommended: managed PostgreSQL in production for backups and durability

---

## Observability

- Structured logging (JSON) for backend
- Sentry (or similar) for backend and frontend
- Basic metrics: request latency, Celery task success/failure, daily active businesses

---

## Roadmap

**MVP (Phase 1)** — database design first, then API, then React + Vite UI

- Auth + multi-tenancy (`owner` / `admin` / `accountant`)
- Inventory (single location) + Sales + VAT (no discounts)
- Credit notes (separate FY-resetting number series)
- Daily sales dashboard
- PDF invoice & credit note generation

**Phase 2**

- Purchases, vendor ledger, input VAT tracking
- Customer due/udhaaro reminders (Celery)
- Monthly/fiscal-year reports, VAT summary report
- Discounts (if required)

**Phase 3**

- Recurring billing, broader Celery automation
- Multi-branch/warehouse support
- Excel export, advanced analytics (dead stock, profit margin)

**Phase 4 (Future)**

- IRD CBMS e-billing integration
- Offline-first POS mode with sync
- Nepali-language UI toggle
