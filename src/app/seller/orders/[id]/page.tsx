'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR, formatQuantity } from '@/shared/pricing';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/shared/types';
import Decimal from 'decimal.js';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  notes: string | null;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    productSku: string;
    orderedQuantity: string;
    orderedUnit: string;
    quantityInBase: string;
    conversionFactor: string;
    basePricePerUnit: string;
    baseUnit: string;
    lineTotal: string;
  }>;
}

export default function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    const json = await res.json();
    if (json.success) setOrder(json.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    
    setCancelling(true);
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    const json = await res.json();
    if (json.success) {
      await fetchOrder();
    } else {
      alert(json.error?.message || 'Failed to cancel order');
    }
    setCancelling(false);
  };

  if (loading) return <div style={{ padding: '48px', color: 'var(--color-text-muted)' }}>Loading...</div>;
  if (!order) return <div style={{ padding: '48px', color: '#EF4444' }}>Order not found</div>;

  const canCancel = order.status === 'quotation' || order.status === 'confirmed';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px'
          }}>← Back to Orders</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Order {order.orderNumber}
            </h1>
            <span className={`badge badge-${order.status}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #EF4444',
              color: '#EF4444',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: cancelling ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {order.notes && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order Notes</h3>
          <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{order.notes}</div>
        </div>
      )}

      {/* Items */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Order Items</h2>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: 'right' }}>Ordered Qty</th>
              <th style={{ textAlign: 'right' }}>Factor</th>
              <th style={{ textAlign: 'right' }}>Qty in Base</th>
              <th style={{ textAlign: 'right' }}>Base Unit Price</th>
              <th style={{ textAlign: 'right' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.productName}</div>
                  <div className="mono" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{item.productSku}</div>
                </td>
                <td className="mono text-right" style={{ fontSize: '13px' }}>
                  {formatQuantity(item.orderedQuantity, item.orderedUnit)}
                </td>
                <td className="mono text-right" style={{ fontSize: '13px' }}>
                  {new Decimal(item.conversionFactor).toNumber()}
                </td>
                <td className="mono text-right" style={{ fontSize: '13px' }}>
                  {formatQuantity(item.quantityInBase, item.baseUnit)}
                </td>
                <td className="mono text-right" style={{ fontSize: '13px' }}>
                  {formatINR(item.basePricePerUnit)}/{item.baseUnit}
                </td>
                <td className="mono text-right" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {formatINR(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ textAlign: 'right', padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total Amount</td>
              <td className="mono text-right" style={{ padding: '16px', fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>
                {formatINR(order.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
