# Nexus — Enterprise Chemical Inventory & Order Management Platform
### Comprehensive System Design Document, PRD Specifications & Developer Guide

[![Framework](https://img.shields.io/badge/Next.js-16.2.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Neon_PostgreSQL-ap--south--1-blueviolet?style=flat-square&logo=postgresql)](https://neon.tech/)
[![ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-green?style=flat-square)](https://orm.drizzle.team/)
[![CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-42%20passed-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Language](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Nexus is an enterprise-grade Operating System designed specifically for chemical and pharmaceutical distributors (modeled on the operational workflows of AasaMedChem). It integrates inventory tracking, multi-unit catalog management, real-time pricing calculations with 28-digit precision, and transaction-level audit trails into a single, unified interface.

---

## 1. Domain Analysis & Operational Challenges

AasaMedChem coordinates high-value chemical and active pharmaceutical ingredient (API) procurement between chemical manufacturers and institutional buyers. Historically, this coordination has relied on manual tools (emails, spreadsheets, phone quotes). Nexus replaces these manual systems with a modern operating system.

### 1.1 The Operational Bottlenecks Solved
* **Operation Teams (Admin Panel):** Eliminated the need to cross-reference multiple spreadsheets. Admin gets a unified cockpit for inventory tracking, order routing, and immutable audit trailing.
* **Institutional Buyers (Seller Panel):** Provides a self-service catalog. Buyers can query stock levels (In Stock, Low Stock, Out of Stock tags) and request quotes or place direct orders in their working unit (grams, kilograms, milliliters, liters) with instant pricing feedback.
* **Pricing & Unit Flexibility:** Seamlessly handles transactions where products are configured in base units (e.g., price per gram) but purchased in bulk metric units (e.g., kilograms).

### 1.2 Core Programmatic Solutions
| Challenge | System Response |
| :--- | :--- |
| **Multi-unit ordering** | Dynamic conversion engine converting alternative units (kg, L) to canonical database base units (g, mL). |
| **Floating-point rounding errors** | PostgreSQL `NUMERIC(20,8)` columns matched with `decimal.js` calculations in Next.js backend. |
| **Order/Price drift over time** | Storing immutable snapshots of prices, units, and conversion factors inside the `order_items` table at order creation. |
| **Role-based routing security** | Edge-level Next.js Middleware extracting JWT session roles, protecting paths with ~1ms latency. |
| **Audit transparency & compliance** | Transaction-level audit logger writing before/after state diff snapshots during mutations. |

---

## 2. Product Requirements Document (PRD) Scope

### 2.1 User Roles
1. **Admin (Operations Cockpit):** Managing the product catalog, updating stock levels, processing orders (approving quotations, dispatching, confirming delivery), and reviewing system audit logs.
2. **Seller (Procurement Cockpit):** Self-service portal to browse products, search by name/SKU, configure order quantities in variable units, manage a persistent checkout cart, submit quotes/orders, and track delivery status.

### 2.2 System Boundaries & Non-Goals
To maintain code focus and compliance, the following are explicitly out of scope for the current phase:
* **Non-Goals:** Real-time online payment gateway processing, PDF invoice mailing, Multi-currency catalogs, and multi-supplier catalogs.

---

## 3. High-Level System Design & Request Flow

Nexus is structured as a Next.js App Router application deployed on Vercel, connecting to a Neon PostgreSQL instance.

```mermaid
graph TD
    Client[Browser Client: Admin / Seller] -->|HTTP Request| EdgeMW[Vercel Edge Middleware: JWT Validation & Route Guard]
    EdgeMW -->|Unauthorized| LoginRedirect[Redirect to /login]
    EdgeMW -->|Authorized Route| AppRouter[Next.js App Router: Page/Route Handler]
    
    subgraph NextJSBackend["Next.js Server (Vercel Serverless)"]
        AppRouter -->|GET /admin| DashboardComp[Admin Server Components]
        AppRouter -->|POST /api/orders| OrderAPI[Order Route Handler]
        OrderAPI -->|Security Context| AuthSession[auth Session Validation]
    end
    
    subgraph DatabaseLayer["Neon Database (ap-south-1 Mumbai)"]
        DashboardComp -->|Drizzle ORM HTTP Query| NeonPooled[Neon HTTP Connection Pooler]
        OrderAPI -->|Atomic SQL Transaction| NeonPooled
        NeonPooled -->|Write/Read| PostgresDB[(PostgreSQL Database)]
    end
    
    PostgresDB -->|Audit Entry| AuditTable[(audit_log Table)]
```

### 3.1 Directory Structure
```text
/
├── drizzle.config.ts        # Drizzle migration parameters & schema locations
├── middleware.ts            # Edge Runtime authentication route guards
├── vitest.config.ts         # Testing framework configuration
├── src/
│   ├── components/
│   │   └── ui/              # Reusable UI widgets (ConfirmDialog, EmptyState, StatusBadge)
│   ├── db/
│   │   ├── index.ts         # Neon serverless client connection initialization
│   │   ├── schema.ts        # Database table declarations (Drizzle ORM)
│   │   └── seed.ts          # Database catalog seed data
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration and role callbacks
│   │   └── audit.ts         # Atomic database audit log writer
│   └── shared/
│       ├── units.ts         # Unit Conversion Engine (toBaseUnit, fromBaseUnit)
│       ├── pricing.ts       # Precision pricing computations (computeLineTotal)
│       └── schemas.ts       # Shared Zod schemas (API & Form validation constraints)
```

### 3.2 Shared Module Boundary
Calculations are centralized in `src/shared/` and shared between the client and server.
* `units.ts`: Single source of truth for conversions. Contains unit multipliers (e.g. 1 kg = 1000 g) and base unit descriptors.
* `pricing.ts`: Contains monetary functions built using `decimal.js`. Rounds to 2 decimal places strictly at the display layer using `Intl.NumberFormat`.
* `schemas.ts`: Shared validation schemas preventing invalid data from entering client forms or route handlers.

---

## 4. User Stories & Acceptance Criteria

### 4.1 Access Control & Auth
* **US-01:** Log in with email/password. Role `admin` redirects to `/admin` dashboard; role `seller` redirects to `/seller/catalogue`. Invalid credentials show unified error. Session guards deny non-admins from hitting `/admin/*` and non-sellers from `/seller/*`.

### 4.2 Admin Catalog Management
* **US-02:** Create products with name, SKU, description, category, dimension (weight, volume, count), stock, and price. The base unit (`g`, `mL`, `unit`) is read-only and derived from the selected dimension. SKU must be unique. Stock must be $\ge 0$. Creates audit trail.
* **US-03:** Edit product metadata. Base unit and dimension are immutable once created (to preserve existing orders). Price changes do not affect historic order records.
* **US-04:** Deactivate products. Deactivated products disappear from the seller's view but remain visible in admin tables (historical transactions are preserved).

### 4.3 Procurement & Cart checkout (Seller)
* **US-05:** Browse/search active products. Stock levels are abstract (In Stock / Low Stock / Out of Stock) rather than exact integers to protect commercial data.
* **US-06:** Build persistent cart. Sellers configure quantities in any dimension-valid unit (e.g. grams vs kilograms).
* **US-07:** Live price estimation. Modifying quantity or unit updates line totals in real-time in the modal using `decimal.js`.
* **US-08:** Checkout submission. Sellers submit carts as a "Request Quotation" (order status: `quotation`) or "Direct Order" (order status: `confirmed`). Submitting generates a unique order number (`NXS-YYYY-NNNN`), clears the cart, and disables double-clicking.

### 4.4 Order Processing (Admin)
* **US-09:** View order queues. Admin expands orders to verify:
  $$\text{quantity\_in\_base} = \text{ordered\_quantity} \times \text{conversion\_factor}$$
  $$\text{line\_total} = \text{quantity\_in\_base} \times \text{base\_price\_per\_unit}$$
* **US-10:** Order state flow. Admin steps orders through: `quotation` $\to$ `confirmed` $\to$ `processing` $\to$ `dispatched` $\to$ `delivered`. Cancelation is blocked after delivery.

---

## 5. Detailed Database Schema & SQL DDL

Tables are managed via Drizzle ORM (defined in `src/db/schema.ts`):

```sql
-- Users account table
CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  password    TEXT        NOT NULL,          -- bcrypt hashed
  role        TEXT        NOT NULL CHECK (role IN ('admin', 'seller', 'buyer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog product table
CREATE TABLE products (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                  TEXT          NOT NULL UNIQUE,
  name                 TEXT          NOT NULL,
  description          TEXT,
  category             TEXT,
  dimension            TEXT          NOT NULL CHECK (dimension IN ('weight', 'volume', 'count')),
  base_unit            TEXT          NOT NULL,      -- 'g' for weight, 'mL' for volume, 'unit' for count
  stock_quantity       NUMERIC(20,8) NOT NULL DEFAULT 0,
  base_price_per_unit  NUMERIC(20,8) NOT NULL CHECK (base_price_per_unit > 0),
  is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
  created_by           UUID          NOT NULL REFERENCES users(id),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Procurement Orders
CREATE TABLE orders (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  TEXT          NOT NULL UNIQUE,  -- format NXS-YYYY-NNNN
  buyer_id      UUID          NOT NULL REFERENCES users(id),
  status        TEXT          NOT NULL CHECK (status IN (
                                  'quotation', 'confirmed', 'processing',
                                  'dispatched', 'delivered', 'cancelled'
                                )),
  notes         TEXT,
  total_amount  NUMERIC(20,8) NOT NULL,          -- Immutable pricing snapshot
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable snapshots of order items at checkout time
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
  conversion_factor    NUMERIC(20,8) NOT NULL,    -- ordered_unit -> base_unit conversion factor
  base_price_per_unit  NUMERIC(20,8) NOT NULL,    -- base unit price at checkout
  line_total           NUMERIC(20,8) NOT NULL,    -- calculated line total
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Append-only system audit trail
CREATE TABLE audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID        REFERENCES users(id),
  entity_type  TEXT        NOT NULL,   -- 'product' | 'order' | 'user'
  entity_id    UUID        NOT NULL,
  action       TEXT        NOT NULL,   -- 'create' | 'update' | 'status_change' | 'delete'
  before_state JSONB,                  -- row snapshot before mutation
  after_state  JSONB,                  -- row snapshot after mutation
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.1 Order Status Transitions Flowchart

Admin manages order states according to this lifecycle matrix:

```mermaid
stateDiagram-v2
    [*] --> quotation : Quote request submitted
    [*] --> confirmed : Direct order submitted
    
    quotation --> confirmed : Admin approves pricing
    quotation --> cancelled : Seller/Admin cancels quote
    
    confirmed --> processing : Admin begins processing
    confirmed --> cancelled : Seller/Admin cancels order
    
    processing --> dispatched : Order leaves warehouse
    dispatched --> delivered : Customer receives cargo
```

---

## 6. Unit Conversion Engine & Pricing Precision

### 6.1 Conversions Table Configuration
The base units and conversion factors are defined in `src/shared/units.ts`:

| Dimension | Base Unit | Supported Display Units | Conversion Factor (Value in Base Units) |
| :--- | :--- | :--- | :--- |
| **Weight** | Grams (`g`) | `g` (Grams)<br>`kg` (Kilograms) | `g` = 1.0<br>`kg` = 1000.0 |
| **Volume** | Millilitres (`mL`) | `mL` (Millilitres)<br>`L` (Litres) | `mL` = 1.0<br>`L` = 1000.0 |
| **Count** | Units (`unit`) | `unit` (Units) | `unit` = 1.0 |

### 6.2 The Precision Multiplication Pipeline

```mermaid
flowchart TD
    A[User configures input values: quantity, selected unit] --> B[Get conversion factor for unit]
    B --> C[Convert quantity to base unit using decimal.js: <br> quantityInBase = quantity × factor]
    C --> D[Retrieve base price per unit from database product entry]
    D --> E[Compute precise total: <br> totalAmount = quantityInBase × basePricePerUnit]
    E --> F[Store computed value as NUMERIC 20,8 in Database]
    F --> G[Format display currency in UI using Intl.NumberFormat: ₹XX,XX,XX.XX]
```

### 6.3 Code Core Snippets (`src/shared/units.ts`)
```typescript
import Decimal from 'decimal.js';

export const UNIT_CONVERSION_FACTORS: Record<Dimension, Record<string, number>> = {
  weight: { g: 1, kg: 1000 },
  volume: { mL: 1, L: 1000 },
  count:  { unit: 1 },
};

export function toBaseUnit(
  quantity: Decimal,
  fromUnit: string,
  dimension: Dimension,
): { quantityInBase: Decimal; conversionFactor: Decimal } {
  const factor = UNIT_CONVERSION_FACTORS[dimension][fromUnit];
  if (factor === undefined) {
    throw new Error(`Unit "${fromUnit}" is not valid for dimension "${dimension}"`);
  }
  const decFactor = new Decimal(factor);
  return {
    quantityInBase: quantity.mul(decFactor),
    conversionFactor: decFactor,
  };
}
```

---

## 7. Premium UI/UX Design System

We redesigned the entire interface using Tailwind CSS v4 design tokens and native HSL variables:

* **Typography Architecture:**
  * **Headings/Display:** `"Sora"` — a geometric typeface with light letter-spacing adjustments (`tracking-tight`).
  * **Body/UI Copy:** `"DM Sans"` — a clean, legible geometric sans-serif font.
  * **Data & Totals:** `"JetBrains Mono"` — a monospace typeface ensuring numerical values, SKUs, and prices align perfectly in tables.
* **Color System:**
  * **Accent Color:** `#0F6E56` (Emerald Green) & `#0A5240` (Dark Emerald) reflecting chemical purity.
  * **Surfaces:** Pure White `#FFFFFF` on Light grey background base `#F8FAFC`.
* **Micro-interactions & UX Components:**
  * `SkeletonTable`: Modern skeleton loaders prevent layout shifting (CLS) during API fetches.
  * `StatusBadge`: Dynamic color pills based on order state (e.g. `PENDING` $\to$ Amber, `DELIVERED` $\to$ Emerald).
  * `ConfirmDialog`: Custom modal dialogues guarding destructive actions (e.g., order cancelations).

---

## 8. Verification and Test Suite

Nexus includes unit test coverage for conversions, prices, and rounding operations under `/src/shared/__tests__/`.

To run tests:
```bash
npm run test
```

### 8.1 Active Test Output
```text
 RUN  v4.1.8 D:/debmr2/PROJECTS/asamedchem

 ✓ src/shared/__tests__/units.test.ts (25 tests) 11ms
 ✓ src/shared/__tests__/pricing.test.ts (17 tests) 26ms

 Test Files  2 passed (2)
      Tests  42 passed (42)
   Start at  13:15:05
   Duration  371ms
```

---

## 9. Local Installation & Development Launch

### 9.1 Installation
1. Clone the codebase:
   ```bash
   git clone https://github.com/lordinsane07/Nexus.git
   cd Nexus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 9.2 Configuration
1. Initialize your environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Configure your local configuration inside `.env.local`:
   ```env
   # Neon PostgreSQL Connection URIs
   DATABASE_URL="postgresql://neondb_owner:***@ep-fragrant-hill-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://neondb_owner:***@ep-fragrant-hill.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
   
   # Auth parameters
   AUTH_SECRET="fH7mR2uXzV6yQ9oP1kL3jG8cV5wN4bA_REPLACE_IN_PRODUCTION"
   AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

### 9.3 Database Setup
1. Push tables to your database instance:
   ```bash
   npx drizzle-kit push
   ```
2. Run the seed script to populate test accounts and products:
   ```bash
   npx tsx src/db/seed.ts
   ```

### 9.4 Launch
1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Access the application at [http://localhost:3000](http://localhost:3000).

---

## 10. Vercel Production Deployment Guide

Deploying to Vercel requires configuring pooled database connections and setting production URLs:

1. Link your repository to Vercel.
2. In the Vercel Dashboard, add the production environment variables:
   * `DATABASE_URL` (pooled connection string)
   * `DATABASE_URL_UNPOOLED` (unpooled connection string)
   * `AUTH_SECRET` (generate a unique hash: `openssl rand -base64 33`)
   * `AUTH_URL` (production domain URL: `https://<app>.vercel.app`)
   * `NEXT_PUBLIC_APP_URL` (production domain URL)
3. Deploy the project.
4. Run migrations on the production database using the direct connection string:
   ```bash
   NODE_ENV=production DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit push
   ```

---

## 11. Walkthrough & Credentials

### 11.1 Test Credentials

| Role | Panel URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin (Operations)** | `/admin` | `admin@nexus.dev` | `Admin@1234` |
| **Seller (Procurement)** | `/seller/catalogue` | `seller@nexus.dev` | `Seller@1234` |
| **Buyer (Generic)** | `/login` | `buyer@nexus.dev` | `Buyer@1234` |

### 11.2 End-to-End Walkthrough Script
1. **Catalog Exploration:** Log in as `seller@nexus.dev`. Use search and filters to view products, dimensions, and stock availability tags (*In Stock*, *Low Stock*).
2. **Flexible Quantity & Unit Pricing:** Open the order modal for *Ibuprofen API*. Enter quantity `1.5` and toggle unit to `kg`. The live preview immediately displays the calculated price:
   $$1.5 \text{ kg} \times 1000 \text{ factor} \times \text{₹450.00/g} = \text{₹6,75,000.00}$$
   Add the item to the cart.
3. **Cart Checkout:** Navigate to `/seller/cart`. Choose between *Direct Order* and *Request Quote*. Submit the order.
4. **Order Fullfilment:** Log out and log back in as `admin@nexus.dev`. Expand the new order inside the dashboard queue to verify the conversion calculations, base quantities, and prices. Move the order status badge through the dispatch lifecycle: `Confirmed` $\to$ `Processing` $\to$ `Dispatched` $\to$ `Delivered`.
5. **Auditing Verification:** Open `/admin/audit` to view the before/after state diffs tracking the order and product mutations.
