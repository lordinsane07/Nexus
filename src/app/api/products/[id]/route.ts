/**
 * Product API — GET (single), PATCH (update), DELETE (soft-delete)
 */
import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { updateProductSchema } from '@/shared/schemas';
import { writeAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (!product) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 }
    );
  }

  // Buyers and Sellers cannot see inactive products
  if ((session.user.role === 'buyer' || session.user.role === 'seller') && !product.isActive) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data: product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);

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

  // Get current state for audit
  const [before] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!before) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 }
    );
  }

  // Check for duplicate SKU if updating SKU
  if (parsed.data.sku && parsed.data.sku !== before.sku) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, parsed.data.sku))
      .limit(1);
    if (existing.length > 0) {
      return Response.json(
        {
          success: false,
          error: { code: 'DUPLICATE_SKU', message: `SKU "${parsed.data.sku}" already exists` },
        },
        { status: 409 }
      );
    }
  }

  const [updated] = await db
    .update(products)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  await writeAuditLog(db as any, {
    actorId: session.user.id,
    entityType: 'product',
    entityId: id,
    action: parsed.data.isActive === false ? 'delete' : 'update',
    beforeState: before as unknown as Record<string, unknown>,
    afterState: updated as unknown as Record<string, unknown>,
  });

  return Response.json({ success: true, data: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }

  const { id } = await params;

  const [before] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!before) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 }
    );
  }

  // Soft-delete: set is_active = false
  const [updated] = await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  await writeAuditLog(db as any, {
    actorId: session.user.id,
    entityType: 'product',
    entityId: id,
    action: 'delete',
    beforeState: before as unknown as Record<string, unknown>,
    afterState: updated as unknown as Record<string, unknown>,
  });

  return Response.json({ success: true, data: { message: 'Product deactivated' } });
}
