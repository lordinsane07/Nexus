/**
 * Unit Conversion Tests
 */
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  toBaseUnit,
  fromBaseUnit,
  isValidUnit,
  UNIT_CONVERSION_FACTORS,
  BASE_UNIT_FOR_DIMENSION,
  UNITS_FOR_DIMENSION,
} from '../units';

describe('toBaseUnit', () => {
  it('converts 2 kg to 2000 g exactly', () => {
    const { quantityInBase, conversionFactor } = toBaseUnit(new Decimal('2'), 'kg', 'weight');
    expect(quantityInBase.toString()).toBe('2000');
    expect(conversionFactor.toString()).toBe('1000');
  });

  it('converts 1 g to 1 g (identity)', () => {
    const { quantityInBase, conversionFactor } = toBaseUnit(new Decimal('1'), 'g', 'weight');
    expect(quantityInBase.toString()).toBe('1');
    expect(conversionFactor.toString()).toBe('1');
  });

  it('converts 1.5 L to 1500 mL exactly', () => {
    const { quantityInBase } = toBaseUnit(new Decimal('1.5'), 'L', 'volume');
    expect(quantityInBase.toString()).toBe('1500');
  });

  it('converts 500 mL to 500 mL (identity)', () => {
    const { quantityInBase } = toBaseUnit(new Decimal('500'), 'mL', 'volume');
    expect(quantityInBase.toString()).toBe('500');
  });

  it('converts 10 units to 10 units (identity)', () => {
    const { quantityInBase } = toBaseUnit(new Decimal('10'), 'unit', 'count');
    expect(quantityInBase.toString()).toBe('10');
  });

  it('handles high-precision input without loss', () => {
    const { quantityInBase } = toBaseUnit(new Decimal('0.00012345'), 'kg', 'weight');
    expect(quantityInBase.toString()).toBe('0.12345');
  });

  it('handles very large quantities', () => {
    const { quantityInBase } = toBaseUnit(new Decimal('999999999'), 'kg', 'weight');
    expect(quantityInBase.toString()).toBe('999999999000');
  });

  it('handles very small quantities', () => {
    const { quantityInBase } = toBaseUnit(new Decimal('0.00000001'), 'kg', 'weight');
    expect(quantityInBase.toString()).toBe('0.00001');
  });

  it('throws for invalid unit in wrong dimension (kg in volume)', () => {
    expect(() => toBaseUnit(new Decimal('1'), 'kg', 'volume')).toThrow(
      'Unit "kg" is not valid for dimension "volume"'
    );
  });

  it('throws for invalid unit in wrong dimension (L in weight)', () => {
    expect(() => toBaseUnit(new Decimal('1'), 'L', 'weight')).toThrow(
      'Unit "L" is not valid for dimension "weight"'
    );
  });

  it('throws for completely unknown unit', () => {
    expect(() => toBaseUnit(new Decimal('1'), 'oz', 'weight')).toThrow(
      'Unit "oz" is not valid for dimension "weight"'
    );
  });
});

describe('fromBaseUnit', () => {
  it('converts 2000 g to 2 kg', () => {
    const result = fromBaseUnit(new Decimal('2000'), 'kg', 'weight');
    expect(result.toString()).toBe('2');
  });

  it('converts 1500 mL to 1.5 L', () => {
    const result = fromBaseUnit(new Decimal('1500'), 'L', 'volume');
    expect(result.toString()).toBe('1.5');
  });

  it('converts 500 g to 500 g (identity)', () => {
    const result = fromBaseUnit(new Decimal('500'), 'g', 'weight');
    expect(result.toString()).toBe('500');
  });

  it('throws for invalid unit', () => {
    expect(() => fromBaseUnit(new Decimal('1'), 'kg', 'volume')).toThrow();
  });
});

describe('isValidUnit', () => {
  it('returns true for g in weight', () => {
    expect(isValidUnit('g', 'weight')).toBe(true);
  });

  it('returns true for kg in weight', () => {
    expect(isValidUnit('kg', 'weight')).toBe(true);
  });

  it('returns false for kg in volume', () => {
    expect(isValidUnit('kg', 'volume')).toBe(false);
  });

  it('returns true for unit in count', () => {
    expect(isValidUnit('unit', 'count')).toBe(true);
  });

  it('returns false for unknown unit', () => {
    expect(isValidUnit('oz', 'weight')).toBe(false);
  });
});

describe('constants', () => {
  it('has correct base units', () => {
    expect(BASE_UNIT_FOR_DIMENSION.weight).toBe('g');
    expect(BASE_UNIT_FOR_DIMENSION.volume).toBe('mL');
    expect(BASE_UNIT_FOR_DIMENSION.count).toBe('unit');
  });

  it('has correct units for each dimension', () => {
    expect(UNITS_FOR_DIMENSION.weight).toEqual(['g', 'kg']);
    expect(UNITS_FOR_DIMENSION.volume).toEqual(['mL', 'L']);
    expect(UNITS_FOR_DIMENSION.count).toEqual(['unit']);
  });

  it('all conversion factors are >= 1', () => {
    for (const dimension of Object.keys(UNIT_CONVERSION_FACTORS)) {
      const factors = UNIT_CONVERSION_FACTORS[dimension as keyof typeof UNIT_CONVERSION_FACTORS];
      for (const [, factor] of Object.entries(factors)) {
        expect(factor).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('roundtrip conversions', () => {
  it('toBase then fromBase returns original value (kg)', () => {
    const original = new Decimal('2.5');
    const { quantityInBase } = toBaseUnit(original, 'kg', 'weight');
    const back = fromBaseUnit(quantityInBase, 'kg', 'weight');
    expect(back.toString()).toBe(original.toString());
  });

  it('toBase then fromBase returns original value (L)', () => {
    const original = new Decimal('3.14159');
    const { quantityInBase } = toBaseUnit(original, 'L', 'volume');
    const back = fromBaseUnit(quantityInBase, 'L', 'volume');
    expect(back.toString()).toBe(original.toString());
  });
});
