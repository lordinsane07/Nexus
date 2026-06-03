'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/shared/pricing';
import { ORDER_STATUS_LABELS } from '@/shared/types';
import Decimal from 'decimal.js';

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  totalAmount: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('pageSize', '100');

    const res = await fetch(`/api/orders?${params}`);
    const json = await res.json();
    if (json.success) setOrders(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.02em' }}>Orders</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date</th>
              <th>Buyer</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(null).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(null).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: '16px', width: '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="mono" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{o.orderNumber}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.buyerName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{o.buyerEmail}</div>
                  </td>
                  <td className="mono text-right" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {formatINR(new Decimal(o.totalAmount))}
                  </td>
                  <td>
                    <span className={`badge badge-${o.status}`}>
                      {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--color-surface-raised)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
