# Nexus — Inventory & Order Management Platform
### Technical Design Document · AasaMedChem Hackathon Assignment

Nexus is a unified operating system designed specifically for chemical and pharmaceutical distributors in India. It enables live product catalogue management, self-service search and filtering for buyers, and precise unit-flexible pricing built with high-decimal precision.

---

## 1. Problem Statement & Domain Analysis

AasaMedChem sits between API manufacturers and institutional pharmaceutical buyers. The coordination has historically happened manually — email threads, spreadsheets, and phone calls to check stock, confirm prices, and track order status.

This creates three compounding problems:
* **For Operations (Admin):** No single place to see stock levels, prices, and active orders. Every inquiry requires cross-referencing multiple sources.
* **For Buyers (Sellers):** They cannot self-serve. To get a price for 2 kg of Ibuprofen API, they call or email.
* **For the Business:** Manual processes do not scale. Coordination cost grows with catalogue size.

Nexus solves this by giving the operations team a fast, information-dense administration tool and buyers a self-service ordering interface with unit-flexible pricing.

### 1.1 Core Problems Solved

| Problem | System Response |
|---|---|
| Multi-unit ordering across a single catalogue | Unit conversion engine with canonical base-unit storage |
| Price precision without floating-point error | `NUMERIC(20,8)` in PostgreSQL + `decimal.js` in application layer |
| Historical order integrity | Immutable snapshot of price, unit, and conversion factor at order creation |
| Role-separated access (operations team vs buyers) | JWT-based RBAC with Edge Middleware enforcement |
| Auditability of all mutations | Append-only `audit_log` written inside the same transaction as the mutation |

---

## 2. System Design & Architecture

### 2.1 Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Database:** Neon PostgreSQL (ap-south-1 Mumbai region)
* **ORM:** Drizzle ORM
* **Auth:** NextAuth.js v5 (JWT sessions, Edge compatible)
* **Validation:** Zod
* **Precision Math:** `decimal.js`
* **Styling:** Tailwind CSS v4 + Custom HSL design tokens

### 2.2 System Design Overview

```
                         ┌───────────────────────────────────────┐
                         │           Vercel Edge Network          │
                         │                                        │
    Browser ──HTTPS──►    │  ┌─────────────────────────────────┐  │
                         │  │     Next.js 16  (App Router)    │  │
                         │  │                                 │  │
                         │  │  ┌────────────┐  ┌──────────┐  │  │
                         │  │  │  React     │  │  Route   │  │  │
                         │  │  │  Server    │  │ Handlers │  │  │
                         │  │  │ Components │  │ (API)    │  │  │
                         │  │  └────────────┘  └────┬─────┘  │  │
                         │  │                       │        │  │
                         │  │  middleware.ts ────────┤        │  │
                         │  │  (Edge Runtime)        │        │  │
                         │  └───────────────────────┼─────────┘  │
                         │                          │            │
                         └──────────────────────────┼────────────┘
                                                    │
                                           Neon Serverless Driver
                                           (@neondatabase/serverless)
                                           WebSocket over HTTP/2
                                                     │
                         ┌──────────────────────────▼────────────┐
                         │        Neon PostgreSQL                 │
                         │        Region: ap-south-1 (Mumbai)     │
                         │                                        │
                         │  ┌──────────┐  ┌──────────────────┐   │
                         │  │  Pooled  │  │  Direct          │   │
                         │  │ (Runtime)│  │ (Migrations only)│   │
                         │  └──────────┘  └──────────────────┘   │
                         └────────────────────────────────────────┘
```

### 2.3 The Shared Module Boundary

The pricing formula and unit conversion logic exist once in `/src/shared/`.
* `units.ts`: Unit conversions and dimensions mappings (`toBaseUnit()`, `fromBaseUnit()`)
* `pricing.ts`: Precision monetary arithmetic (`computeLineTotal()`, `computeOrderTotal()`)
* `schemas.ts`: Shared Zod schemas (forms validation + API validation)

---

## 3. Database Schema

All database models are defined in [src/db/schema.ts](file:///d:/debmr2/PROJECTS/asamedchem/src/db/schema.ts) using Drizzle ORM.

```sql
-- USERS
CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  password    TEXT        NOT NULL,          -- bcrypt, cost=12
  role        TEXT        NOT NULL CHECK (role IN ('admin', 'seller')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                  TEXT          NOT NULL UNIQUE,
  name                 TEXT          NOT NULL,
  description          TEXT,
  category             TEXT,
  dimension            TEXT          NOT NULL CHECK (dimension IN ('weight', 'volume', 'count')),
  base_unit            TEXT          NOT NULL,      -- 'g', 'mL', or 'unit'
  stock_quantity       NUMERIC(20,8) NOT NULL DEFAULT 0,
  base_price_per_unit  NUMERIC(20,8) NOT NULL CHECK (base_price_per_unit > 0),
  is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
  created_by           UUID          NOT NULL REFERENCES users(id),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  TEXT          NOT NULL UNIQUE,  -- NXS-YYYY-NNNN
  buyer_id      UUID          NOT NULL REFERENCES users(id),
  status        TEXT          NOT NULL CHECK (status IN (
                                'quotation', 'confirmed', 'processing',
                                'dispatched', 'delivered', 'cancelled'
                              )),
  notes         TEXT,
  total_amount  NUMERIC(20,8) NOT NULL,          -- INR, immutable after creation
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id           UUID          NOT NULL REFERENCES products(id),
  product_name         TEXT          NOT NULL,
  product_sku          TEXT          NOT NULL,
  ordered_unit         TEXT          NOT NULL,
  ordered_quantity     NUMERIC(20,8) NOT NULL,
  base_unit            TEXT          NOT NULL,
  quantity_in_base     NUMERIC(20,8) NOT NULL,
  conversion_factor    NUMERIC(20,8) NOT NULL,    -- ordered_unit → base_unit
  base_price_per_unit  NUMERIC(20,8) NOT NULL,    -- INR/base_unit at order time
  line_total           NUMERIC(20,8) NOT NULL,    -- INR
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID        REFERENCES users(id),
  entity_type  TEXT        NOT NULL,   -- 'product' | 'order' | 'user'
  entity_id    UUID        NOT NULL,
  action       TEXT        NOT NULL,   -- 'create' | 'update' | 'status_change' | 'delete'
  before_state JSONB,                  -- full row before mutation
  after_state  JSONB,                  -- full row after mutation
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Unit Storage & Conversion Strategy

Every product has exactly one physical dimension and one canonical storage unit:

* **Weight:** Base unit is **grams (g)**. Display/order units are **grams (g)** and **kilograms (kg)**.
* **Volume:** Base unit is **millilitres (mL)**. Display/order units are **millilitres (mL)** and **litres (L)**.
* **Count:** Base unit is **units**. Display/order units are **units**.

### 4.1 Storage & Price Strategy
1. **Quantity:** Always stored as a raw quantity in the base unit (`quantity_in_base`).
2. **Price:** Always configured as base price per base unit (`base_price_per_unit`).
3. **Conversions:** When a buyer places an order in an alternative unit (e.g. `kg`), the system applies the conversion factor:
   $$\text{quantity\_in\_base} = \text{ordered\_quantity} \times \text{conversion\_factor}$$
   $$\text{line\_total} = \text{quantity\_in\_base} \times \text{base\_price\_per\_unit}$$
4. **Order Item Snapshots:** All pricing calculation variables (conversion factor, base price, line total) are snapshotted inside `order_items` at order time to protect order history from subsequent price changes or product deactivations.

---

## 5. Pricing Engine & Numeric Precision

To eliminate floating-point calculation errors:
* Database fields use `NUMERIC(20,8)` for quantities, prices, factors, and totals.
* Next.js backend uses `decimal.js` with **28-digit precision** (`Decimal.ROUND_HALF_UP`) for calculations.
* Client-side preview uses the same `decimal.js` formulas to ensure that the estimated total matches the stored total.
* Rounding to **2 decimal places** happens strictly at the display layer (`Intl.NumberFormat`).

---

## 6. Local Development Setup

### 6.1 Prerequisites
* Node.js v18 or v20
* A Neon PostgreSQL database account

### 6.2 Installation Steps
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-username/nexus.git
   cd nexus
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Neon database credentials:
   ```
   DATABASE_URL="postgresql://user:password@host.neon.tech/nexus?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://user:password@host-direct.neon.tech/nexus?sslmode=require"
   AUTH_SECRET="your-secret-key-here"
   AUTH_URL="http://localhost:3000"
   ```

3. Run migrations to initialize the PostgreSQL schema:
   ```bash
   npm run db:migrate
   ```

4. Seed the database with test accounts and sample products:
   ```bash
   npm run db:seed
   ```

5. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## 7. Production Deployment & Re-deployment

### 7.1 Vercel Deployment
To deploy or re-deploy this app on Vercel:
1. Push your code to your linked GitHub repository.
2. Configure the production environment variables in the Vercel dashboard:
   * `DATABASE_URL`
   * `DATABASE_URL_UNPOOLED`
   * `AUTH_SECRET`
   * `AUTH_URL` (points to your production domain)
3. Connect your project to Vercel and deploy.
4. Run migrations on the production database using the direct connection string:
   ```bash
   NODE_ENV=production DATABASE_URL=$PROD_UNPOOLED npm run db:migrate:prod
   ```

---

## 8. Test Credentials & Demo Walkthrough

### 8.1 Test Credentials

| Role | Email | Password | Panel URL |
|---|---|---|---|
| **Admin** | `admin@nexus.dev` | `Admin@1234` | `/admin` |
| **Seller** | `seller@nexus.dev` | `Seller@1234` | `/seller/catalogue` |

### 8.2 Demo Walkthrough
1. **Browse Products (Seller):** Log in as `seller@nexus.dev`. Use search and filters to view products, dimensions, and stock availability tags (*In Stock*, *Low Stock*).
2. **Flexible Quantity & Unit Pricing (Seller):** Open the order modal for *Ibuprofen API*. Enter quantity `1.5` and toggle unit to `kg`. The live preview immediately displays the calculated price:
   $$1.5 \text{ kg} \times 1000 \text{ factor} \times \text{₹450.00/g} = \text{₹6,75,000.00}$$
   Add it to the cart and view the cart review page.
3. **Submit Order/Quotation (Seller):** Toggle order type between *Direct Order* and *Request Quote*. Submit the order and get your monospaced order number (e.g. `NXS-2026-0001`).
4. **Process Order & Verify Conversions (Admin):** Log in as `admin@nexus.dev`. Select the submitted order. Review the item conversion details: ordered quantity, conversion factor, quantity in base, base unit price, and line total. Update order status along its valid state transitions (e.g., Quotation → Confirmed → Processing → Dispatched → Delivered).
5. **Traceable Audit Trail (Admin):** Navigate to `/admin/audit` to view the append-only logs of every product CRUD action, order creation, and status transition with before/after state diffs.
