/**
 * Zod Validation Schemas — Used by both API Route Handlers and Forms
 *
 * NO framework imports. Pure Zod + TypeScript.
 * Single source of truth: one schema definition, zero duplication.
 */
import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Product ─────────────────────────────────────────────────────────────────

export const dimensionEnum = z.enum(['weight', 'volume', 'count']);
export const unitEnum = z.enum(['g', 'kg', 'mL', 'L', 'unit']);

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or less')
    .regex(/^[A-Z0-9\-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Name must be 200 characters or less'),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  dimension: dimensionEnum,
  stockQuantity: z
    .string()
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: 'Stock quantity must be zero or greater' }
    ),
  basePricePerUnit: z
    .string()
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Base price must be greater than zero' }
    ),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  sku: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z0-9\-]+$/)
    .optional(),
  stockQuantity: z
    .string()
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: 'Stock quantity must be zero or greater' }
    )
    .optional(),
  basePricePerUnit: z
    .string()
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Base price must be greater than zero' }
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─── Order ───────────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  orderedUnit: z.string().min(1, 'Unit is required'),
  orderedQuantity: z
    .string()
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Quantity must be greater than zero' }
    ),
});

export const createOrderSchema = z.object({
  status: z.enum(['quotation', 'confirmed']),
  notes: z.string().max(2000).optional().nullable(),
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'quotation',
    'confirmed',
    'processing',
    'dispatched',
    'delivered',
    'cancelled',
  ]),
  notes: z.string().max(2000).optional().nullable(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
