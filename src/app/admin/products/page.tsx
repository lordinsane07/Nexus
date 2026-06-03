'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/shared/pricing';
import Decimal from 'decimal.js';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  dimension: string;
  baseUnit: string;
  stockQuantity: string;
  basePricePerUnit: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('status', statusFilter);
    params.set('pageSize', '100');

    const res = await fetch(`/api/products?${params}`);
    const json = await res.json();
    if (json.success) setProducts(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter]);

  const toggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    fetchProducts();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Products</h1>
        <button
          onClick={() => router.push('/admin/products/new')}
          style={{
            padding: '8px 20px',
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >+ New Product</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: '150px' }}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Dimension</th>
              <th style={{ textAlign: 'right' }}>Base Price</th>
              <th style={{ textAlign: 'right' }}>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(null).map((_, i) => (
                <tr key={i}>
                  {Array(8).fill(null).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: '16px', width: '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="mono" style={{ fontWeight: 500, fontSize: '13px' }}>{p.sku}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{p.category || '—'}</td>
                  <td>
                    <span className="badge" style={{
                      background: 'rgba(0,191,165,0.1)',
                      color: 'var(--color-accent)',
                    }}>{p.dimension} ({p.baseUnit})</span>
                  </td>
                  <td className="mono text-right" style={{ fontSize: '13px' }}>
                    {formatINR(new Decimal(p.basePricePerUnit))}/{p.baseUnit}
                  </td>
                  <td className="mono text-right" style={{ fontSize: '13px' }}>
                    {Number(p.stockQuantity).toLocaleString('en-IN')} {p.baseUnit}
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => router.push(`/admin/products/${p.id}/edit`)}
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
                      >Edit</button>
                      <button
                        onClick={() => toggleActive(p.id, p.isActive)}
                        style={{
                          padding: '4px 10px',
                          background: p.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          color: p.isActive ? '#EF4444' : '#10B981',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >{p.isActive ? 'Deactivate' : 'Activate'}</button>
                    </div>
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
