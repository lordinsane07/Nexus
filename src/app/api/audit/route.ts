/**
 * Audit Log API
 */
import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { auditLog, users } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        action: auditLog.action,
        createdAt: auditLog.createdAt,
        actorName: users.name,
        actorEmail: users.email,
        beforeState: auditLog.beforeState,
        afterState: auditLog.afterState,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorId, users.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditLog),
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
