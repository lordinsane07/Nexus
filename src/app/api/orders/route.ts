/**
 * Order API — GET (list) + POST (create)
 *
 * POST is the most critical endpoint: server-side price computation,
 * transactional snapshot creation, NO client-submitted prices trusted.
 */
import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { orders, orderItems, products, users } from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { createOrderSchema } from '@/shared/schemas';
import { toBaseUnit } from '@/shared/units';
import { computeLineTotal, computeOrderTotal } from '@/shared/pricing';
import { writeAuditLog } from '@/lib/audit';
import Decimal from 'decimal.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { Dimension } from '@/shared/units';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  const conditions = [];

  // Buyers and Sellers see ONLY their own orders
  if (session.user.role === 'buyer' || session.user.role === 'seller') {
    conditions.push(eq(orders.buyerId, session.user.id));
  }

  if (status) {
    conditions.push(eq(orders.status, status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerId: orders.buyerId,
        buyerName: users.name,
        buyerEmail: users.email,
        status: orders.status,
        notes: orders.notes,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(users, eq(orders.buyerId, users.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(where),
  ]);

  return Response.json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total: Number(countResult[0].count),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  // Only buyers and sellers can place orders
  if (session.user.role !== 'buyer' && session.user.role !== 'seller') {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Only buyers or sellers can place orders' } },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const { status: orderStatus, notes, items } = parsed.data;

  // Fetch all products needed (NEVER trust client prices)
  const productIds = items.map((i) => i.productId);
  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const productMap = new Map(productRows.map((p) => [p.id, p]));

  // Validate all products exist and are active
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Product ${item.productId} not found`,
          },
        },
        { status: 404 }
      );
    }
    if (!product.isActive) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_INACTIVE',
            message: `Product "${product.name}" is no longer available`,
          },
        },
        { status: 400 }
      );
    }
  }

  // Generate order number
  const seqResult = await db.execute(sql`SELECT nextval('order_number_seq') AS n`);
  const seqNum = (seqResult as unknown as { rows: { n: string }[] }).rows[0].n;
  const year = new Date().getFullYear();
  const orderNumber = `NXS-${year}-${String(seqNum).padStart(4, '0')}`;

  // Compute all line items server-side
  const lineItemsData = [];
  const lineTotals: Decimal[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId)!;
    const dimension = product.dimension as Dimension;

    // Validate unit is legal for this product's dimension
    try {
      const { quantityInBase, conversionFactor } = toBaseUnit(
        new Decimal(item.orderedQuantity),
        item.orderedUnit,
        dimension
      );

      const basePricePerUnit = new Decimal(product.basePricePerUnit!);
      const lineTotal = computeLineTotal(quantityInBase, basePricePerUnit);
      lineTotals.push(lineTotal);

      lineItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        orderedUnit: item.orderedUnit,
        orderedQuantity: item.orderedQuantity,
        baseUnit: product.baseUnit,
        quantityInBase: quantityInBase.toString(),
        conversionFactor: conversionFactor.toString(),
        basePricePerUnit: product.basePricePerUnit!,
        lineTotal: lineTotal.toString(),
      });
    } catch {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_UNIT',
            message: `Unit "${item.orderedUnit}" is not valid for product "${product.name}" (dimension: ${dimension})`,
          },
        },
        { status: 400 }
      );
    }
  }

  const totalAmount = computeOrderTotal(lineTotals);

  // Insert order and items
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      buyerId: session.user.id,
      status: orderStatus,
      notes: notes || null,
      totalAmount: totalAmount.toString(),
    })
    .returning();

  // Bulk insert order items
  await db.insert(orderItems).values(
    lineItemsData.map((item) => ({
      ...item,
      orderId: order.id,
    }))
  );

  // Write audit log
  await writeAuditLog(db as any, {
    actorId: session.user.id,
    entityType: 'order',
    entityId: order.id,
    action: 'create',
    beforeState: null,
    afterState: {
      ...order,
      items: lineItemsData,
    } as unknown as Record<string, unknown>,
  });

  // Fetch created order with items
  const createdItems = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return Response.json(
    {
      success: true,
      data: {
        ...order,
        items: createdItems,
      },
    },
    { status: 201 }
  );
}
