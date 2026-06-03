/**
 * Unit Conversion Engine — Pure TypeScript, NO framework imports
 *
 * Single source of truth for all dimension/unit relationships.
 * Used identically by client (cart preview) and server (order creation).
 */
import Decimal from 'decimal.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Dimension = 'weight' | 'volume' | 'count';

export type WeightUnit = 'g' | 'kg';
export type VolumeUnit = 'mL' | 'L';
export type CountUnit = 'unit';

export type UnitLabel = WeightUnit | VolumeUnit | CountUnit;

// ─── Conversion Tables ───────────────────────────────────────────────────────

/**
 * How many base units are in 1 of the given unit.
 *
 * weight base = g:    1 kg = 1000 g   → factor 1000
 * volume base = mL:   1 L  = 1000 mL  → factor 1000
 * count  base = unit: trivial         → factor 1
 */
export const UNIT_CONVERSION_FACTORS: Record<Dimension, Record<string, number>> = {
  weight: { g: 1, kg: 1000 },
  volume: { mL: 1, L: 1000 },
  count:  { unit: 1 },
};

export const UNITS_FOR_DIMENSION: Record<Dimension, UnitLabel[]> = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count:  ['unit'],
};

export const BASE_UNIT_FOR_DIMENSION: Record<Dimension, UnitLabel> = {
  weight: 'g',
  volume: 'mL',
  count:  'unit',
};

export const DIMENSION_LABELS: Record<Dimension, string> = {
  weight: 'Weight',
  volume: 'Volume',
  count:  'Count',
};

export const UNIT_LABELS: Record<UnitLabel, string> = {
  g:    'Grams (g)',
  kg:   'Kilograms (kg)',
  mL:   'Millilitres (mL)',
  L:    'Litres (L)',
  unit: 'Units',
};

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Check if a unit string is valid for a given dimension.
 */
export function isValidUnit(unit: string, dimension: Dimension): unit is UnitLabel {
  return unit in UNIT_CONVERSION_FACTORS[dimension];
}

// ─── Conversion Functions ────────────────────────────────────────────────────

/**
 * Convert a quantity expressed in `fromUnit` to the canonical base unit
 * for that dimension.
 *
 * All arithmetic uses decimal.js to avoid IEEE 754 precision loss.
 *
 * @throws if fromUnit is not registered for the given dimension
 */
export function toBaseUnit(
  quantity: Decimal,
  fromUnit: string,
  dimension: Dimension,
): { quantityInBase: Decimal; conversionFactor: Decimal } {
  const factor = UNIT_CONVERSION_FACTORS[dimension][fromUnit];
  if (factor === undefined) {
    throw new Error(
      `Unit "${fromUnit}" is not valid for dimension "${dimension}". ` +
      `Valid units: ${Object.keys(UNIT_CONVERSION_FACTORS[dimension]).join(', ')}`
    );
  }
  const decFactor = new Decimal(factor);
  return {
    quantityInBase:   quantity.mul(decFactor),
    conversionFactor: decFactor,
  };
}

/**
 * Convert a quantity from the canonical base unit to a display unit.
 * Used for rendering — never for storage or calculation.
 */
export function fromBaseUnit(
  quantityInBase: Decimal,
  toUnit: string,
  dimension: Dimension,
): Decimal {
  const factor = UNIT_CONVERSION_FACTORS[dimension][toUnit];
  if (factor === undefined) {
    throw new Error(
      `Unit "${toUnit}" is not valid for dimension "${dimension}". ` +
      `Valid units: ${Object.keys(UNIT_CONVERSION_FACTORS[dimension]).join(', ')}`
    );
  }
  return quantityInBase.div(new Decimal(factor));
}
