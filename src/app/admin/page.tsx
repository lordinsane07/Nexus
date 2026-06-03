import { db } from '@/db/index';
import { products, orders } from '@/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export default async function AdminDashboard() {
  const [activeProducts] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true));
  const [pendingQuotations] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'quotation'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [confirmedToday] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(and(eq(orders.status, 'confirmed'), gte(orders.createdAt, today)));
  const [gmvResult] = await db.select({ total: sql<string>`COALESCE(SUM(total_amount), 0)` }).from(orders).where(eq(orders.status, 'delivered'));

  const stats = [
    { label: 'Active Products', value: Number(activeProducts.count), color: '#00BFA5' },
    { label: 'Pending Quotations', value: Number(pendingQuotations.count), color: '#F59E0B' },
    { label: 'Confirmed Today', value: Number(confirmedToday.count), color: '#3B82F6' },
    { label: 'GMV (Delivered)', value: `₹${Number(gmvResult.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#10B981' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.02em' }}>Dashboard</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '20px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: stat.color }}>
              {typeof stat.value === 'number' ? stat.value : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/admin/products" style={{
            padding: '10px 20px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'border-color 150ms ease-out',
          }}>Manage Products →</a>
          <a href="/admin/orders" style={{
            padding: '10px 20px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
          }}>Review Orders →</a>
          <a href="/admin/audit" style={{
            padding: '10px 20px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
          }}>Audit Log →</a>
        </div>
      </div>
    </div>
  );
}
