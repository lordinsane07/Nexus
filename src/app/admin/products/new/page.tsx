'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BASE_UNIT_FOR_DIMENSION, DIMENSION_LABELS } from '@/shared/units';
import type { Dimension } from '@/shared/units';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    dimension: 'weight' as Dimension,
    stockQuantity: '',
    basePricePerUnit: '',
  });

  const baseUnit = BASE_UNIT_FOR_DIMENSION[form.dimension];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (json.success) {
      router.push('/admin/products');
    } else {
      setError(json.error?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.02em' }}>New Product</h1>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU *</label>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} placeholder="IBU-API-001" required className="mono" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ibuprofen API" required />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={3} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="NSAID" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dimension *</label>
            <select value={form.dimension} onChange={(e) => setForm({ ...form, dimension: e.target.value as Dimension })}>
              {Object.entries(DIMENSION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-bg)', borderRadius: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Base Unit (auto): </span>
          <span className="mono" style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{baseUnit}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Quantity ({baseUnit}) *</label>
            <input type="number" step="any" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} placeholder="50000" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base Price (₹/{baseUnit}) *</label>
            <input type="number" step="any" min="0.00000001" value={form.basePricePerUnit} onChange={(e) => setForm({ ...form, basePricePerUnit: e.target.value })} placeholder="450.00" required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={loading} style={{
            padding: '10px 24px',
            background: loading ? 'var(--color-text-muted)' : 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>{loading ? 'Creating...' : 'Create Product'}</button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '10px 24px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
