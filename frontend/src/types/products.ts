export type AppRole = "owner" | "admin" | "accountant";

export type StockLevelFilter = "all" | "in_stock" | "low" | "out";

export type VatFilter = "all" | "applicable" | "exempt";

export type ActiveFilter = "active" | "archived" | "all";

export type StockAdjustReason =
  | "adjustment"
  | "damage"
  | "correction"
  | "transfer"
  | "opening";

export type StockMovement = {
  id: string;
  quantityDelta: number;
  reason: StockAdjustReason;
  notes: string;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  costPriceNpr: number;
  sellingPriceNpr: number;
  vatApplicable: boolean;
  reorderLevel: number;
  stockQty: number;
  isActive: boolean;
  /** True if used in any sale/purchase — blocks hard delete */
  hasTransactions: boolean;
  movements: StockMovement[];
};

export type ProductFormValues = {
  name: string;
  category: string;
  sku: string;
  unit: string;
  costPriceNpr: string;
  sellingPriceNpr: string;
  vatApplicable: boolean;
  reorderLevel: string;
  /** Only used on create */
  initialStock: string;
};

export function canManageProducts(role: AppRole): boolean {
  return role === "owner" || role === "admin";
}

export function isLowStock(product: Product): boolean {
  return product.stockQty > 0 && product.stockQty <= product.reorderLevel;
}
