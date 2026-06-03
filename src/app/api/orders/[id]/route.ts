/**
 * Order Detail API — GET single order
 */
import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { orders, orderItems, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

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

  const [order] = await db
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
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
      { status: 404 }
    );
  }

  // Buyers and Sellers can only see their own orders
  if ((session.user.role === 'buyer' || session.user.role === 'seller') && order.buyerId !== session.user.id) {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 }
    );
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return Response.json({
    success: true,
    data: {
      ...order,
      items,
    },
  });
}
