import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  AdjustStockOverlay,
  DeleteProductDialog,
  ProductFilters,
  ProductFormOverlay,
  ProductInsights,
  ProductTable,
} from "@/components/products";
import { DEMO_PRODUCTS, MOCK_APP_ROLE } from "@/constants/products";
import {
  canManageProducts,
  isLowStock,
  type Product,
  type ProductFormValues,
  type StockAdjustReason,
  type StockLevelFilter,
  type StockMovement,
  type VatFilter,
} from "@/types/products";
import { useMemo, useState } from "react";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ProductsPage() {
  const canManage = canManageProducts(MOCK_APP_ROLE);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [vat, setVat] = useState<VatFilter>("all");
  const [stock, setStock] = useState<StockLevelFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Product | null>(null);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (category !== "all" && p.category !== category) return false;
      if (vat === "applicable" && !p.vatApplicable) return false;
      if (vat === "exempt" && p.vatApplicable) return false;
      if (stock === "out" && p.stockQty > 0) return false;
      if (stock === "low" && !isLowStock(p)) return false;
      if (stock === "in_stock" && p.stockQty <= 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, search, category, vat, stock]);

  const handleSaveForm = (values: ProductFormValues, editingId?: string) => {
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: values.name.trim(),
                category: values.category,
                sku: values.sku.trim(),
                unit: values.unit,
                costPriceNpr: Number(values.costPriceNpr),
                sellingPriceNpr: Number(values.sellingPriceNpr),
                vatApplicable: values.vatApplicable,
                reorderLevel: Number(values.reorderLevel),
              }
            : p,
        ),
      );
      return;
    }

    const initialStock = Number(values.initialStock);
    const movements: StockMovement[] =
      initialStock > 0
        ? [
            {
              id: newId("mov"),
              quantityDelta: initialStock,
              reason: "opening",
              notes: "Opening stock",
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    const created: Product = {
      id: newId("prd"),
      name: values.name.trim(),
      category: values.category,
      sku: values.sku.trim(),
      unit: values.unit,
      costPriceNpr: Number(values.costPriceNpr),
      sellingPriceNpr: Number(values.sellingPriceNpr),
      vatApplicable: values.vatApplicable,
      reorderLevel: Number(values.reorderLevel),
      stockQty: initialStock,
      isActive: true,
      hasTransactions: false,
      movements,
    };
    setProducts((prev) => [created, ...prev]);
  };

  const handleAdjustStock = (input: {
    productId: string;
    quantityDelta: number;
    reason: StockAdjustReason;
    notes: string;
  }) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== input.productId) return p;
        const movement: StockMovement = {
          id: newId("mov"),
          quantityDelta: input.quantityDelta,
          reason: input.reason,
          notes: input.notes,
          createdAt: new Date().toISOString(),
        };
        return {
          ...p,
          stockQty: p.stockQty + input.quantityDelta,
          movements: [movement, ...p.movements],
        };
      }),
    );
  };

  const handleDelete = (product: Product) => {
    if (product.hasTransactions) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: false } : p,
        ),
      );
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  return (
    <DashboardShell
      title="Products"
      subtitle="Catalog, VAT, and stock ledger"
    >
      <ProductInsights products={products} filteredCount={filtered.length} />

      <ProductFilters
        search={search}
        category={category}
        vat={vat}
        stock={stock}
        canManage={canManage}
        resultCount={filtered.length}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onVatChange={setVat}
        onStockChange={setStock}
        onAdd={() => {
          setFormMode("create");
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <ProductTable
        products={filtered}
        canManage={canManage}
        onEdit={(product) => {
          setFormMode("edit");
          setEditing(product);
          setFormOpen(true);
        }}
        onAdjustStock={(product) => {
          setAdjustTarget(product);
          setAdjustOpen(true);
        }}
        onDelete={(product) => {
          setDeleteTarget(product);
          setDeleteOpen(true);
        }}
      />

      {canManage ? (
        <>
          <ProductFormOverlay
            open={formOpen}
            mode={formMode}
            product={editing}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSave={handleSaveForm}
          />
          <AdjustStockOverlay
            open={adjustOpen}
            product={adjustTarget}
            onClose={() => {
              setAdjustOpen(false);
              setAdjustTarget(null);
            }}
            onSave={handleAdjustStock}
          />
          <DeleteProductDialog
            open={deleteOpen}
            product={deleteTarget}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteTarget(null);
            }}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </DashboardShell>
  );
}
