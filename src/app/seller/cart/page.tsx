'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/shared/cartStore';
import { formatINR, formatQuantity, computeLineTotal, computeOrderTotal } from '@/shared/pricing';
import { toBaseUnit } from '@/shared/units';
import Decimal from 'decimal.js';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [orderStatus, setOrderStatus] = useState<'quotation' | 'confirmed'>('confirmed');

  // Compute live cart totals
  const lineTotals: { productId: string; total: Decimal }[] = [];
  
  items.forEach(item => {
    try {
      const { quantityInBase } = toBaseUnit(new Decimal(item.orderedQuantity), item.orderedUnit, item.dimension);
      lineTotals.push({
        productId: item.productId,
        total: computeLineTotal(quantityInBase, new Decimal(item.basePricePerUnit))
      });
    } catch {
      // Ignore invalid items for total computation
    }
  });

  const cartTotal = computeOrderTotal(lineTotals.map(l => l.total));

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');

    const payload = {
      status: orderStatus,
      notes: notes || null,
      items: items.map(i => ({
        productId: i.productId,
        orderedUnit: i.orderedUnit,
        orderedQuantity: i.orderedQuantity
      }))
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      clearCart();
      router.push(`/seller/orders/${json.data.id}`);
    } else {
      setError(json.error?.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Browse the catalogue to add products to your order.</p>
        <button onClick={() => router.push('/seller/catalogue')} style={{
          padding: '10px 24px',
          background: 'var(--color-accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>Browse Catalogue</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.02em' }}>Review Order</h1>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Left: Items List */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Line Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const lTotal = lineTotals.find(l => l.productId === item.productId)?.total;
                return (
                  <tr key={item.productId}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.productName}</div>
                      <div className="mono" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{item.productSku}</div>
                    </td>
                    <td className="mono text-right" style={{ fontSize: '13px' }}>
                      {formatQuantity(item.orderedQuantity, item.orderedUnit)}
                    </td>
                    <td className="mono text-right" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {lTotal ? formatINR(lTotal) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Summary & Checkout */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '24px',
          position: 'sticky',
          top: '80px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            <span>Subtotal ({items.length} items)</span>
            <span className="mono">{formatINR(cartTotal)}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Total Amount</span>
            <span className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {formatINR(cartTotal)}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setOrderStatus('confirmed')}
                style={{ flex: 1, padding: '8px', border: orderStatus === 'confirmed' ? '1px solid var(--color-accent)' : '1px solid var(--color-border)', background: orderStatus === 'confirmed' ? 'rgba(0,191,165,0.1)' : 'var(--color-bg)', color: orderStatus === 'confirmed' ? 'var(--color-accent)' : 'var(--color-text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
              >Direct Order</button>
              <button
                type="button"
                onClick={() => setOrderStatus('quotation')}
                style={{ flex: 1, padding: '8px', border: orderStatus === 'quotation' ? '1px solid #F59E0B' : '1px solid var(--color-border)', background: orderStatus === 'quotation' ? 'rgba(245,158,11,0.1)' : 'var(--color-bg)', color: orderStatus === 'quotation' ? '#F59E0B' : 'var(--color-text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
              >Request Quote</button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Notes (Optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ resize: 'none' }} placeholder="PO number, shipping instructions..." />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              background: submitting ? 'var(--color-text-muted)' : 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {submitting ? 'Processing...' : (orderStatus === 'confirmed' ? 'Place Order' : 'Submit Quotation Request')}
          </button>
        </div>
      </div>
    </div>
  );
}
