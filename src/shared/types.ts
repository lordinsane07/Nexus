/**
 * Shared TypeScript Interfaces
 *
 * These types mirror the database schema and are used across
 * both client and server code. NO framework imports.
 */
import type { Dimension, UnitLabel } from './units';

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'seller';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  dimension: Dimension;
  baseUnit: UnitLabel;
  stockQuantity: string;       // NUMERIC(20,8) as string
  basePricePerUnit: string;    // NUMERIC(20,8) as string
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(stockQuantity: string): StockStatus {
  const qty = parseFloat(stockQuantity);
  if (qty <= 0) return 'out_of_stock';
  if (qty < 100) return 'low_stock';
  return 'in_stock';
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'quotation'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'quotation',
  'confirmed',
  'processing',
  'dispatched',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  quotation:  'Quotation',
  confirmed:  'Confirmed',
  processing: 'Processing',
  dispatched: 'Dispatched',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

/**
 * Legal state transitions for the order status machine.
 */
export const LEGAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  quotation:  ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered:  [],
  cancelled:  [],
};

export function isLegalTransition(from: OrderStatus, to: OrderStatus): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

export interface Order {
  id: string;
  orderNumber: string;
  sellerId: string;
  sellerName?: string;
  sellerEmail?: string;
  status: OrderStatus;
  notes: string | null;
  totalAmount: string;         // NUMERIC(20,8) as string
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  orderedUnit: string;
  orderedQuantity: string;     // NUMERIC(20,8) as string
  baseUnit: string;
  quantityInBase: string;      // NUMERIC(20,8) as string
  conversionFactor: string;    // NUMERIC(20,8) as string
  basePricePerUnit: string;    // NUMERIC(20,8) as string
  lineTotal: string;           // NUMERIC(20,8) as string
  createdAt: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  productName: string;
  productSku: string;
  category: string | null;
  dimension: Dimension;
  baseUnit: UnitLabel;
  basePricePerUnit: string;    // NUMERIC as string, from the product
  orderedUnit: string;
  orderedQuantity: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export type AuditAction = 'create' | 'update' | 'status_change' | 'delete';
export type AuditEntityType = 'product' | 'order' | 'user';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  createdAt: string;
}

// ─── API Envelope ────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
