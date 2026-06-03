/**
 * Drizzle ORM Schema — Source of Truth
 *
 * All tables use NUMERIC(20,8) for monetary and quantity columns.
 * Drizzle maps NUMERIC to string at the TypeScript layer — DO NOT change to number.
 */
import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(), // bcrypt, cost=12
  role: text('role').notNull(), // 'admin' | 'seller' | 'buyer'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category'),
    dimension: text('dimension').notNull(), // 'weight' | 'volume' | 'count'
    baseUnit: text('base_unit').notNull(), // 'g' | 'mL' | 'unit'
    stockQuantity: numeric('stock_quantity', { precision: 20, scale: 8 })
      .notNull()
      .default('0'),
    basePricePerUnit: numeric('base_price_per_unit', { precision: 20, scale: 8 })
      .notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_products_active_category').on(table.category).where(sql`${table.isActive} = TRUE`),
  ]
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull().unique(), // NXS-YYYY-NNNN
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id),
    status: text('status').notNull(), // OrderStatus
    notes: text('notes'),
    totalAmount: numeric('total_amount', { precision: 20, scale: 8 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_orders_buyer').on(table.buyerId, table.createdAt),
    index('idx_orders_status').on(table.status, table.createdAt),
  ]
);

// ─── Order Items (IMMUTABLE after INSERT) ────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  // Snapshot fields — immune to future product edits
  productName: text('product_name').notNull(),
  productSku: text('product_sku').notNull(),
  orderedUnit: text('ordered_unit').notNull(),
  orderedQuantity: numeric('ordered_quantity', { precision: 20, scale: 8 }).notNull(),
  baseUnit: text('base_unit').notNull(),
  quantityInBase: numeric('quantity_in_base', { precision: 20, scale: 8 }).notNull(),
  conversionFactor: numeric('conversion_factor', { precision: 20, scale: 8 }).notNull(),
  basePricePerUnit: numeric('base_price_per_unit', { precision: 20, scale: 8 }).notNull(),
  lineTotal: numeric('line_total', { precision: 20, scale: 8 }).notNull(),
  // NO updated_at — this row is IMMUTABLE
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Audit Log (APPEND ONLY — never updated or deleted) ─────────────────────

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id),
    entityType: text('entity_type').notNull(), // 'product' | 'order' | 'user'
    entityId: uuid('entity_id').notNull(),
    action: text('action').notNull(), // 'create' | 'update' | 'status_change' | 'delete'
    beforeState: text('before_state'), // JSON as text
    afterState: text('after_state'),   // JSON as text
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_entity').on(table.entityType, table.entityId, table.createdAt),
    index('idx_audit_actor').on(table.actorId, table.createdAt),
  ]
);
