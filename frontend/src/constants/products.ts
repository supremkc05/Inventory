import type { Product } from "@/types/products";

export const PRODUCT_CATEGORIES = [
  "Grains & staples",
  "Oils & ghee",
  "Beverages",
  "Personal care",
  "Pharmacy",
  "Snacks",
] as const;

export const PRODUCT_UNITS = ["pcs", "kg", "L", "pack", "box", "bag"] as const;

/** Demo role — accountant is view-only; owner/admin can mutate */
export const MOCK_APP_ROLE = "owner" as const;

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "prd-001",
    name: "Basmati rice 25kg",
    category: "Grains & staples",
    sku: "GRN-RICE-25",
    unit: "bag",
    costPriceNpr: 3200,
    sellingPriceNpr: 3850,
    vatApplicable: false,
    reorderLevel: 10,
    stockQty: 24,
    isActive: true,
    hasTransactions: true,
    movements: [
      {
        id: "mov-001",
        quantityDelta: 30,
        reason: "opening",
        notes: "Opening stock",
        createdAt: "2026-07-01T09:00:00",
      },
      {
        id: "mov-002",
        quantityDelta: -6,
        reason: "adjustment",
        notes: "Sold via tax invoice",
        createdAt: "2026-07-10T14:20:00",
      },
    ],
  },
  {
    id: "prd-002",
    name: "Mustard oil 5L",
    category: "Oils & ghee",
    sku: "OIL-MUST-5",
    unit: "L",
    costPriceNpr: 1100,
    sellingPriceNpr: 1320,
    vatApplicable: true,
    reorderLevel: 12,
    stockQty: 8,
    isActive: true,
    hasTransactions: true,
    movements: [
      {
        id: "mov-003",
        quantityDelta: 20,
        reason: "opening",
        notes: "Opening stock",
        createdAt: "2026-07-01T09:00:00",
      },
      {
        id: "mov-004",
        quantityDelta: -12,
        reason: "adjustment",
        notes: "Wholesale sale",
        createdAt: "2026-07-12T11:05:00",
      },
    ],
  },
  {
    id: "prd-003",
    name: "Paracetamol 500mg (box)",
    category: "Pharmacy",
    sku: "PH-PARA-500",
    unit: "box",
    costPriceNpr: 280,
    sellingPriceNpr: 340,
    vatApplicable: false,
    reorderLevel: 15,
    stockQty: 42,
    isActive: true,
    hasTransactions: true,
    movements: [
      {
        id: "mov-005",
        quantityDelta: 50,
        reason: "opening",
        notes: "Opening stock",
        createdAt: "2026-07-02T10:00:00",
      },
    ],
  },
  {
    id: "prd-004",
    name: "Instant noodles",
    category: "Snacks",
    sku: "SNK-NOOD-01",
    unit: "pcs",
    costPriceNpr: 28,
    sellingPriceNpr: 40,
    vatApplicable: true,
    reorderLevel: 50,
    stockQty: 120,
    isActive: true,
    hasTransactions: false,
    movements: [
      {
        id: "mov-006",
        quantityDelta: 120,
        reason: "opening",
        notes: "Opening stock",
        createdAt: "2026-07-05T08:30:00",
      },
    ],
  },
  {
    id: "prd-005",
    name: "Tea (250g)",
    category: "Beverages",
    sku: "BEV-TEA-250",
    unit: "pack",
    costPriceNpr: 210,
    sellingPriceNpr: 280,
    vatApplicable: true,
    reorderLevel: 20,
    stockQty: 0,
    isActive: true,
    hasTransactions: true,
    movements: [
      {
        id: "mov-007",
        quantityDelta: 25,
        reason: "opening",
        notes: "Opening stock",
        createdAt: "2026-07-03T09:15:00",
      },
      {
        id: "mov-008",
        quantityDelta: -25,
        reason: "adjustment",
        notes: "Sold out",
        createdAt: "2026-07-14T17:40:00",
      },
    ],
  },
  {
    id: "prd-006",
    name: "Soap bar (legacy)",
    category: "Personal care",
    sku: "PC-SOAP-OLD",
    unit: "pcs",
    costPriceNpr: 30,
    sellingPriceNpr: 45,
    vatApplicable: true,
    reorderLevel: 30,
    stockQty: 5,
    isActive: false,
    hasTransactions: true,
    movements: [],
  },
];

export function formatNpr(amount: number): string {
  return `रु ${amount.toLocaleString("en-NP")}`;
}
