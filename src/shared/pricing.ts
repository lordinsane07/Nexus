/**
 * Pricing Engine — Pure TypeScript, NO framework imports
 *
 * All monetary arithmetic uses decimal.js with 28-digit precision.
 * Rounding to 2 decimal places happens ONLY inside formatINR() — never during computation.
 *
 * Used identically by client (cart live preview) and server (order total computation).
 */
import Decimal from 'decimal.js';

// Configure decimal.js globally for this module
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

/**
 * Compute the line total for a single order item.
 *
 * line_total = quantity_in_base × base_price_per_unit
 */
export function computeLineTotal(
  quantityInBase: Decimal,
  basePricePerUnit: Decimal,
): Decimal {
  return quantityInBase.mul(basePricePerUnit);
}

/**
 * Compute the order total from all line totals.
 */
export function computeOrderTotal(lineTotals: Decimal[]): Decimal {
  return lineTotals.reduce((sum, t) => sum.add(t), new Decimal(0));
}

/**
 * Format a Decimal amount as INR for display.
 *
 * Rounding to 2 decimal places happens ONLY here, at the display layer.
 * Storage always uses full 8-decimal precision.
 *
 * This is the ONLY legitimate use of .toNumber() on monetary data.
 */
export function formatINR(amount: Decimal | string): string {
  const dec = amount instanceof Decimal ? amount : new Decimal(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dec.toNumber());
}

/**
 * Format a quantity with appropriate decimal places for display.
 */
export function formatQuantity(quantity: Decimal | string, unit: string): string {
  const dec = quantity instanceof Decimal ? quantity : new Decimal(quantity);
  const num = dec.toNumber();

  // If it's a whole number, show no decimals
  if (Number.isInteger(num)) {
    return `${new Intl.NumberFormat('en-IN').format(num)} ${unit}`;
  }

  // Otherwise show up to 4 significant decimal places
  return `${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num)} ${unit}`;
}
