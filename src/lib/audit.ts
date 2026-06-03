/**
 * Audit Log Helper
 *
 * Writes audit entries inside the SAME database transaction as the mutation.
 * This ensures no orphaned audit records for failed operations.
 */
import { auditLog } from '@/db/schema';
import { drizzle } from 'drizzle-orm/neon-http';

interface AuditParams {
  actorId: string;
  entityType: 'product' | 'order' | 'user';
  entityId: string;
  action: 'create' | 'update' | 'status_change' | 'delete';
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}

/**
 * Write an audit log entry. This should be called inside a transaction.
 * Pass the transaction's drizzle instance to ensure atomicity.
 */
export async function writeAuditLog(
  txDb: ReturnType<typeof drizzle>,
  params: AuditParams
): Promise<void> {
  await txDb.insert(auditLog).values({
    actorId: params.actorId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    beforeState: params.beforeState ? JSON.stringify(params.beforeState) : null,
    afterState: params.afterState ? JSON.stringify(params.afterState) : null,
  });
}
