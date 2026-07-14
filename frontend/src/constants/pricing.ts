export const ANNUAL_DISCOUNT = 0.3;

export type BillingPeriod = "monthly" | "annual";

export type PlanId = "free" | "starter" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  /** Monthly price in NPR (integer). Free = 0. */
  monthlyPriceNpr: number;
  featured?: boolean;
  cta: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try DokanDaftar with one small shop.",
    monthlyPriceNpr: 0,
    cta: "Start free",
    features: [
      "1 shop, 1 user",
      "Up to 50 products",
      "Basic sales & stock",
      "VAT-ready invoices",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    description: "For kirana and retail shops ready to grow.",
    monthlyPriceNpr: 1499,
    featured: true,
    cta: "Choose Starter",
    features: [
      "1 shop, up to 3 users",
      "Unlimited products",
      "Udhaaro (credit) tracking",
      "VAT bills & Abbreviated Bills",
      "Daily sales dashboard",
      "BS/AD dual calendar",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "Multi-shop ops with full control.",
    monthlyPriceNpr: 3999,
    cta: "Choose Business",
    features: [
      "Up to 5 shops, 10 users",
      "Everything in Starter",
      "Role-based access",
      "Stock transfers between shops",
      "Priority support",
      "Export for accountant / IRD",
    ],
  },
];

/** Yearly total after 30% discount, rounded to nearest rupee. */
export function annualTotalNpr(monthlyPriceNpr: number): number {
  return Math.round(monthlyPriceNpr * 12 * (1 - ANNUAL_DISCOUNT));
}

/** Effective monthly when paying annually. */
export function annualMonthlyNpr(monthlyPriceNpr: number): number {
  return Math.round(annualTotalNpr(monthlyPriceNpr) / 12);
}

export function formatNpr(amount: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("NPR", "Rs")
    .trim();
}
