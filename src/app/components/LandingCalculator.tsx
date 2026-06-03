'use client';

import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  baseUnit: 'g' | 'mL' | 'unit';
  basePrice: number;
  units: { name: string; factor: number }[];
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'ibuprofen',
    name: 'Ibuprofen API (Purity 99.8%)',
    category: 'Active Ingredients',
    baseUnit: 'g',
    basePrice: 4.50,
    units: [
      { name: 'g', factor: 1 },
      { name: 'kg', factor: 1000 }
    ]
  },
  {
    id: 'paracetamol',
    name: 'Paracetamol API (Fine Powder)',
    category: 'Active Ingredients',
    baseUnit: 'g',
    basePrice: 1.80,
    units: [
      { name: 'g', factor: 1 },
      { name: 'kg', factor: 1000 }
    ]
  },
  {
    id: 'purified-water',
    name: 'Purified Water USP (Sterile)',
    category: 'Solvents & Excipients',
    baseUnit: 'mL',
    basePrice: 0.12,
    units: [
      { name: 'mL', factor: 1 },
      { name: 'L', factor: 1000 }
    ]
  }
];

export default function LandingCalculator() {
  const [selectedId, setSelectedId] = useState('ibuprofen');
  const [quantityInput, setQuantityInput] = useState('1.5');
  const [selectedUnit, setSelectedUnit] = useState('kg');

  const selectedProduct = useMemo(() => {
    return MOCK_PRODUCTS.find(p => p.id === selectedId) || MOCK_PRODUCTS[0];
  }, [selectedId]);

  // Adjust unit if product changes and current unit is invalid
  const handleProductChange = (id: string) => {
    setSelectedId(id);
    const prod = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
    // Default to the second unit (usually the larger one like kg or L)
    setSelectedUnit(prod.units[1]?.name || prod.units[0].name);
  };

  const qty = parseFloat(quantityInput) || 0;
  
  const unitObj = useMemo(() => {
    return selectedProduct.units.find(u => u.name === selectedUnit) || selectedProduct.units[0];
  }, [selectedProduct, selectedUnit]);

  const baseQuantity = qty * unitObj.factor;
  const lineTotal = baseQuantity * selectedProduct.basePrice;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden w-full max-w-[580px] mx-auto text-[#0F172A]" style={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)' }}>
      {/* Header */}
      <div className="bg-[#F7F8FA] border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F7F8FA', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wider" style={{ color: '#0F6E56', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interactive Engine Demo</span>
          <span className="font-display font-medium text-sm text-[#0F172A]" style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Precision Pricing Calculator</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#ECFDF5] border border-[#059669]/10 px-2 py-0.5 rounded text-[10px] font-mono text-[#059669] uppercase font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', border: '1px solid rgba(5, 150, 105, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', color: '#059669', fontWeight: 600 }}>
          8-Decimal Mode
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Product Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>
            Select Chemical Compound
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]/15 outline-none transition-all"
            style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
          >
            {MOCK_PRODUCTS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
            ))}
          </select>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Quantity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>
              Order Quantity
            </label>
            <input
              type="number"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]/15 outline-none transition-all font-mono"
              style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }}
            />
          </div>

          {/* Unit Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>
              Target Unit
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]/15 outline-none transition-all"
              style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
            >
              {selectedProduct.units.map(u => (
                <option key={u.name} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculation Details Banner */}
        <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-xl p-4 space-y-3 text-xs" style={{ backgroundColor: '#F7F8FA', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
          {/* Base Unit Equivalence */}
          <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-[#64748B]">Unit Conversion Formula</span>
            <span className="font-mono text-[#0F172A]" style={{ fontFamily: 'monospace', fontWeight: 500 }}>
              {qty || 0} {selectedUnit} × {unitObj.factor} = <strong className="text-[#0F6E56]">{baseQuantity.toLocaleString('en-IN', { maximumFractionDigits: 4 })} {selectedProduct.baseUnit}</strong>
            </span>
          </div>

          {/* Unit Price */}
          <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
            <span className="text-[#64748B]">Base Unit Cost</span>
            <span className="font-mono text-[#0F172A]" style={{ fontFamily: 'monospace', fontWeight: 500 }}>
              ₹{selectedProduct.basePrice.toFixed(2)} per {selectedProduct.baseUnit}
            </span>
          </div>

          {/* Formula */}
          <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
            <span className="text-[#64748B]">Equation Breakdown</span>
            <span className="font-mono text-[#0F172A] opacity-75" style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748B' }}>
              ({baseQuantity} {selectedProduct.baseUnit} × ₹{selectedProduct.basePrice})
            </span>
          </div>
        </div>

        {/* Final Result Card */}
        <div className="bg-[#0F6E56]/5 border border-[#0F6E56]/15 rounded-xl p-5 flex items-center justify-between" style={{ backgroundColor: 'rgba(15, 110, 86, 0.04)', border: '1px solid rgba(15, 110, 86, 0.12)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wider" style={{ color: '#0F6E56', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Computed Line Total</span>
            <span className="text-2xl font-mono font-bold text-[#0F6E56]" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: '#0F6E56' }}>
              ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
            </span>
          </div>
          <span className="text-[10px] font-medium bg-[#0F6E56]/10 text-[#0F6E56] px-2.5 py-1 rounded-full" style={{ fontSize: '10px', fontWeight: 500, backgroundColor: 'rgba(15, 110, 86, 0.1)', color: '#0F6E56', padding: '4px 10px', borderRadius: '9999px' }}>
            INR Base
          </span>
        </div>
      </div>
    </div>
  );
}
