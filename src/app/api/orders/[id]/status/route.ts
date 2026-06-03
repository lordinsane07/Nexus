/**
 * Order Status API — PATCH (admin: update status, seller: cancel)
 *
 * Enforces the state machine: illegal transitions are blocked.
 */
import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/shared/schemas';
import { isLegalTransition } from '@/shared/types';
import { writeAuditLog } from '@/lib/audit';
import type { OrderStatus } from '@/shared/types';

export async function PATCH(
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
  const body = await request.json();
  const parsed = updateOrderStatusSchema.safeParse(body);

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

  const newStatus = parsed.data.status;

  // Get current order
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      status: orders.status,
      notes: orders.notes,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
      { status: 404 }
    );
  }

  // Buyers and Sellers can only cancel their own quotation or confirmed orders
  if (session.user.role === 'buyer' || session.user.role === 'seller') {
    if (order.buyerId !== session.user.id) {
      return Response.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }
    if (newStatus !== 'cancelled') {
      return Response.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Buyers can only cancel orders',
          },
        },
        { status: 403 }
      );
    }
    if (!['quotation', 'confirmed'].includes(order.status)) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'ILLEGAL_STATUS_TRANSITION',
            message: `Cannot cancel order in "${order.status}" status`,
          },
        },
        { status: 409 }
      );
    }
  }

  // Validate state transition
  if (!isLegalTransition(order.status as OrderStatus, newStatus as OrderStatus)) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'ILLEGAL_STATUS_TRANSITION',
          message: `Cannot transition from "${order.status}" to "${newStatus}"`,
        },
      },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(orders)
    .set({
      status: newStatus,
      notes: parsed.data.notes ?? order.notes,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();

  await writeAuditLog(db as any, {
    actorId: session.user.id,
    entityType: 'order',
    entityId: id,
    action: 'status_change',
    beforeState: { status: order.status } as Record<string, unknown>,
    afterState: { status: updated.status } as Record<string, unknown>,
  });

  return Response.json({ success: true, data: updated });
}
