/**
 * Pricing Engine Tests
 */
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { computeLineTotal, computeOrderTotal, formatINR } from '../pricing';

describe('computeLineTotal', () => {
  it('computes 2000g × ₹450/g = ₹900,000', () => {
    const result = computeLineTotal(new Decimal('2000'), new Decimal('450'));
    expect(result.toString()).toBe('900000');
  });

  it('computes 5000mL × ₹2.50/mL = ₹12,500', () => {
    const result = computeLineTotal(new Decimal('5000'), new Decimal('2.5'));
    expect(result.toString()).toBe('12500');
  });

  it('handles high-precision prices', () => {
    const result = computeLineTotal(
      new Decimal('1000000'),
      new Decimal('0.00125000')
    );
    expect(result.toString()).toBe('1250');
  });

  it('handles very small quantities with large prices', () => {
    const result = computeLineTotal(
      new Decimal('0.001'),
      new Decimal('1250.00000000')
    );
    expect(result.toString()).toBe('1.25');
  });

  it('preserves precision — no floating point error', () => {
    // Classic IEEE 754 failure case: 0.1 + 0.2 !== 0.3
    // Our system must handle this correctly
    const result = computeLineTotal(
      new Decimal('3'),
      new Decimal('0.1')
    );
    expect(result.toString()).toBe('0.3');
  });

  it('handles zero quantity', () => {
    const result = computeLineTotal(new Decimal('0'), new Decimal('450'));
    expect(result.toString()).toBe('0');
  });
});

describe('computeOrderTotal', () => {
  it('sums multiple line totals correctly', () => {
    const lineTotals = [
      new Decimal('900000'),    // Ibuprofen 2kg
      new Decimal('12500'),     // Ethanol 5L
    ];
    const result = computeOrderTotal(lineTotals);
    expect(result.toString()).toBe('912500');
  });

  it('handles empty array', () => {
    const result = computeOrderTotal([]);
    expect(result.toString()).toBe('0');
  });

  it('handles single item', () => {
    const result = computeOrderTotal([new Decimal('42.50')]);
    expect(result.toString()).toBe('42.5');
  });

  it('preserves precision across many items', () => {
    const lineTotals = Array(100).fill(null).map(() => new Decimal('0.01'));
    const result = computeOrderTotal(lineTotals);
    expect(result.toString()).toBe('1');
  });
});

describe('formatINR', () => {
  it('formats 900000 as ₹9,00,000.00 (Indian grouping)', () => {
    const result = formatINR(new Decimal('900000'));
    expect(result).toContain('9,00,000.00');
  });

  it('formats 12500 as ₹12,500.00', () => {
    const result = formatINR(new Decimal('12500'));
    expect(result).toContain('12,500.00');
  });

  it('formats 912500 as ₹9,12,500.00', () => {
    const result = formatINR(new Decimal('912500'));
    expect(result).toContain('9,12,500.00');
  });

  it('accepts string input', () => {
    const result = formatINR('450.00000000');
    expect(result).toContain('450.00');
  });

  it('formats small amounts correctly', () => {
    const result = formatINR(new Decimal('0.50'));
    expect(result).toContain('0.50');
  });

  it('rounds display to 2 decimal places', () => {
    const result = formatINR(new Decimal('123.456'));
    expect(result).toContain('123.46');
  });
});

describe('end-to-end price calculation', () => {
  it('matches the demo verification: 2kg Ibuprofen + 5L Ethanol = ₹9,12,500', () => {
    // Ibuprofen: 2 kg = 2000 g, price ₹450/g
    const ibuLineTotal = computeLineTotal(new Decimal('2000'), new Decimal('450'));
    expect(ibuLineTotal.toString()).toBe('900000');

    // Ethanol: 5 L = 5000 mL, price ₹2.50/mL
    const ethLineTotal = computeLineTotal(new Decimal('5000'), new Decimal('2.5'));
    expect(ethLineTotal.toString()).toBe('12500');

    // Total
    const total = computeOrderTotal([ibuLineTotal, ethLineTotal]);
    expect(total.toString()).toBe('912500');

    // Format
    const formatted = formatINR(total);
    expect(formatted).toContain('9,12,500.00');
  });
});
