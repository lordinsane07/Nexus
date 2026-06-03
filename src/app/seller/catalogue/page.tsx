'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR, formatQuantity, computeLineTotal } from '@/shared/pricing';
import { toBaseUnit, UNITS_FOR_DIMENSION } from '@/shared/units';
import { useCartStore } from '@/shared/cartStore';
import Decimal from 'decimal.js';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  dimension: 'weight' | 'volume' | 'count';
  baseUnit: string;
  stockQuantity: string;
  basePricePerUnit: string;
}

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  // Simple modal state for adding to cart
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQty, setOrderQty] = useState('');
  const [orderUnit, setOrderUnit] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (categoryFilter) params.set('category', categoryFilter);
    params.set('status', 'active');
    params.set('pageSize', '100');

    const res = await fetch(`/api/products?${params}`);
    const json = await res.json();
    if (json.success) setProducts(json.data);
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (p: Product) => {
    setSelectedProduct(p);
    setOrderUnit(p.baseUnit); // default to base unit
    setOrderQty('');
    setModalError('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (!orderQty || Number(orderQty) <= 0) {
      setModalError('Please enter a valid quantity');
      return;
    }

    try {
      // Validate unit and calculate stock
      const { quantityInBase } = toBaseUnit(
        new Decimal(orderQty),
        orderUnit,
        selectedProduct.dimension
      );

      if (quantityInBase.greaterThan(new Decimal(selectedProduct.stockQuantity))) {
        setModalError(`Not enough stock. Available: ${formatQuantity(selectedProduct.stockQuantity, selectedProduct.baseUnit)}`);
        return;
      }

      addItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSku: selectedProduct.sku,
        category: selectedProduct.category,
        dimension: selectedProduct.dimension,
        baseUnit: selectedProduct.baseUnit as 'g' | 'mL' | 'unit',
        basePricePerUnit: selectedProduct.basePricePerUnit,
        orderedUnit: orderUnit,
        orderedQuantity: orderQty,
      });

      setSelectedProduct(null);
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  // Extract unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Product Catalogue</h1>

        {cartItems.length > 0 && (
          <button
            onClick={() => router.push('/seller/cart')}
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Review Cart ({cartItems.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {loading ? (
          Array(8).fill(null).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '8px' }} />
          ))
        ) : products.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
            No products found matching your search.
          </div>
        ) : (
          products.map(p => {
            const inCart = cartItems.find(i => i.productId === p.id);
            const stockNum = parseFloat(p.stockQuantity);
            const isOutOfStock = stockNum <= 0;

            return (
              <div key={p.id} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 150ms ease-out',
                opacity: isOutOfStock ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-raised)', padding: '2px 6px', borderRadius: '4px' }}>
                    {p.sku}
                  </span>
                  {p.category && (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      {p.category}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3 }}>{p.name}</h3>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
                  Available: {formatQuantity(p.stockQuantity, p.baseUnit)}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatINR(p.basePricePerUnit)}<span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/{p.baseUnit}</span>
                  </div>

                  <button
                    disabled={isOutOfStock || !!inCart}
                    onClick={() => handleOpenModal(p)}
                    style={{
                      padding: '6px 12px',
                      background: inCart ? 'transparent' : 'var(--color-surface-raised)',
                      border: inCart ? '1px solid var(--color-border)' : '1px solid var(--color-border)',
                      color: inCart ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: isOutOfStock || !!inCart ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 150ms ease-out'
                    }}
                  >
                    {inCart ? 'In Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Order'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add to Cart Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{selectedProduct.name}</h3>
                <div className="mono" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{selectedProduct.sku}</div>
              </div>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', color: '#EF4444', fontSize: '12px' }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ width: '100px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</label>
                <select value={orderUnit} onChange={(e) => setOrderUnit(e.target.value)}>
                  {UNITS_FOR_DIMENSION[selectedProduct.dimension].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Pricing Preview */}
            <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '6px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Estimated Total</span>
              <span className="mono" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {(() => {
                  try {
                    if (!orderQty || Number(orderQty) <= 0) return '₹0.00';
                    const { quantityInBase } = toBaseUnit(new Decimal(orderQty), orderUnit, selectedProduct.dimension);
                    const total = computeLineTotal(quantityInBase, new Decimal(selectedProduct.basePricePerUnit));
                    return formatINR(total);
                  } catch {
                    return '—';
                  }
                })()}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Add to Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
