/**
 * Product API — GET (list) + POST (create)
 */
import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { products, users } from '@/db/schema';
import { eq, and, ilike, or, sql, desc, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { createProductSchema } from '@/shared/schemas';
import { BASE_UNIT_FOR_DIMENSION } from '@/shared/units';
import { writeAuditLog } from '@/lib/audit';
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
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const dimension = searchParams.get('dimension') || '';
  const status = searchParams.get('status') || 'active'; // 'active' | 'inactive' | 'all'
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';

  const conditions = [];

  // Role-based visibility
  if (session.user.role === 'buyer' || session.user.role === 'seller') {
    // Buyers and Sellers only see active products
    conditions.push(eq(products.isActive, true));
  } else {
    // Admins see based on filter
    if (status === 'active') {
      conditions.push(eq(products.isActive, true));
    } else if (status === 'inactive') {
      conditions.push(eq(products.isActive, false));
    }
  }

  if (q) {
    conditions.push(
      or(
        ilike(products.name, `%${q}%`),
        ilike(products.sku, `%${q}%`),
        ilike(products.category, `%${q}%`)
      )
    );
  }

  if (category) {
    conditions.push(eq(products.category, category));
  }

  if (dimension) {
    conditions.push(eq(products.dimension, dimension));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderColumn = sortBy === 'name' ? products.name
    : sortBy === 'price' ? products.basePricePerUnit
    : sortBy === 'sku' ? products.sku
    : products.createdAt;

  const orderFn = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        description: products.description,
        category: products.category,
        dimension: products.dimension,
        baseUnit: products.baseUnit,
        stockQuantity: products.stockQuantity,
        basePricePerUnit: products.basePricePerUnit,
        isActive: products.isActive,
        createdBy: products.createdBy,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        sellerName: users.name,
        sellerEmail: users.email,
      })
      .from(products)
      .leftJoin(users, eq(products.createdBy, users.id))
      .where(where)
      .orderBy(orderFn)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
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
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

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

  const { dimension, ...rest } = parsed.data;
  const baseUnit = BASE_UNIT_FOR_DIMENSION[dimension as Dimension];

  // Check for duplicate SKU
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.sku, rest.sku))
    .limit(1);

  if (existing.length > 0) {
    return Response.json(
      {
        success: false,
        error: { code: 'DUPLICATE_SKU', message: `SKU "${rest.sku}" already exists` },
      },
      { status: 409 }
    );
  }

  const [product] = await db
    .insert(products)
    .values({
      ...rest,
      dimension,
      baseUnit,
      createdBy: session.user.id,
      isActive: session.user.role === 'admin',
    })
    .returning();

  // Write audit log
  await writeAuditLog(db as any, {
    actorId: session.user.id,
    entityType: 'product',
    entityId: product.id,
    action: 'create',
    beforeState: null,
    afterState: product as unknown as Record<string, unknown>,
  });

  return Response.json({ success: true, data: product }, { status: 201 });
}
