/**
 * Nepal VAT math (MVP): vat = round(subtotal × rate, 2).
 * No discounts. Exempt lines → vat = 0.
 */
export const DEFAULT_VAT_RATE = 0.13;

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function vatOnSubtotal(
  subtotal: number,
  rate: number = DEFAULT_VAT_RATE,
  applicable = true,
): number {
  if (!applicable || !(subtotal > 0)) return 0;
  return roundMoney(subtotal * rate);
}

/** Inclusive total → extract VAT portion (price includes VAT). */
export function vatFromInclusive(
  inclusive: number,
  rate: number = DEFAULT_VAT_RATE,
): { exclusive: number; vat: number; inclusive: number } {
  if (!(inclusive > 0)) {
    return { exclusive: 0, vat: 0, inclusive: 0 };
  }
  const exclusive = roundMoney(inclusive / (1 + rate));
  const vat = roundMoney(inclusive - exclusive);
  return { exclusive, vat, inclusive: roundMoney(inclusive) };
}

/** Exclusive amount → add VAT. */
export function vatFromExclusive(
  exclusive: number,
  rate: number = DEFAULT_VAT_RATE,
  applicable = true,
): { exclusive: number; vat: number; inclusive: number } {
  const base = roundMoney(Math.max(0, exclusive));
  const vat = vatOnSubtotal(base, rate, applicable);
  return { exclusive: base, vat, inclusive: roundMoney(base + vat) };
}

export function formatNpr(amount: number): string {
  return `रू ${amount.toLocaleString("en-NP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
