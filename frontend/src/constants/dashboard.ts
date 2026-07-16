import type {
  PersonalSale,
  TaxInvoiceSale,
} from "@/types/dashboard";
import type { DashboardStatCard } from "@/types/landing";

export function formatNpr(amount: number): string {
  return `रु ${amount.toLocaleString("en-NP")}`;
}

export const DASHBOARD_PAGE_STATS: DashboardStatCard[] = [
  {
    label: "Today's tax sales",
    value: 36150,
    prefix: "रु ",
    trend: "With 13% VAT",
    trendUp: true,
  },
  {
    label: "VAT collected",
    value: 4158,
    prefix: "रु ",
    trend: "From invoices",
    trendUp: true,
  },
  {
    label: "Personal sales",
    value: 12850,
    prefix: "रु ",
    trend: "No VAT",
    trendUp: true,
  },
  {
    label: "Low stock",
    value: 7,
    suffix: " items",
    trend: "Alert",
    trendUp: false,
  },
];

export const TAX_INVOICE_SALES: TaxInvoiceSale[] = [
  {
    invoice: "2082/83-0042",
    customer: "Himalayan Traders",
    type: "Tax Invoice",
    status: "Paid",
    products: [
      {
        name: "Basmati rice 25kg",
        qty: 4,
        listPriceNpr: 4200,
        deductedPriceNpr: 3850,
        vatNpr: 500.5,
      },
      {
        name: "Mustard oil 5L",
        qty: 6,
        listPriceNpr: 1450,
        deductedPriceNpr: 1320,
        vatNpr: 171.6,
      },
    ],
  },
  {
    invoice: "2082/83-0040",
    customer: "Pokhara Pharma",
    type: "Tax Invoice",
    status: "Partial",
    products: [
      {
        name: "Paracetamol 500mg (box)",
        qty: 20,
        listPriceNpr: 380,
        deductedPriceNpr: 340,
        vatNpr: 44.2,
      },
      {
        name: "Surgical mask (pack)",
        qty: 15,
        listPriceNpr: 250,
        deductedPriceNpr: 220,
        vatNpr: 28.6,
      },
    ],
  },
  {
    invoice: "2082/83-0039",
    customer: "Lalitpur Kirana",
    type: "Tax Invoice",
    status: "Unpaid",
    products: [
      {
        name: "Sugar 50kg",
        qty: 2,
        listPriceNpr: 5100,
        deductedPriceNpr: 4800,
        vatNpr: 624,
      },
    ],
  },
];

export const PERSONAL_SALES: PersonalSale[] = [
  {
    id: "PS-118",
    buyer: "Walk-in · Thamel",
    time: "5:42 PM",
    status: "Paid",
    products: [
      { name: "Instant noodles", qty: 3, priceNpr: 40 },
      { name: "Biscuit pack", qty: 2, priceNpr: 55 },
    ],
  },
  {
    id: "PS-117",
    buyer: "Anita Sharma",
    time: "4:18 PM",
    status: "Paid",
    products: [
      { name: "Cooking gas lighter", qty: 1, priceNpr: 120 },
      { name: "Tea (250g)", qty: 1, priceNpr: 280 },
    ],
  },
  {
    id: "PS-116",
    buyer: "Walk-in · local",
    time: "2:05 PM",
    status: "Paid",
    products: [
      { name: "Soap bar", qty: 4, priceNpr: 45 },
      { name: "Toothpaste", qty: 1, priceNpr: 165 },
      { name: "Candle pack", qty: 2, priceNpr: 80 },
    ],
  },
  {
    id: "PS-115",
    buyer: "Ramesh Tamang",
    time: "11:30 AM",
    status: "Paid",
    products: [{ name: "Bread loaf", qty: 2, priceNpr: 70 }],
  },
];
