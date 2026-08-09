import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  AdjustStockOverlay,
  DeleteProductDialog,
  ProductFilters,
  ProductFormOverlay,
  ProductInsights,
  ProductTable,
} from "@/components/products";
import {
  createCategory,
  listCategories,
  type Category,
} from "@/api/categories";
import {
  adjustStock,
  archiveProduct,
  createProduct,
  listProducts,
  updateProduct,
} from "@/api/products";
import { ApiError } from "@/lib/api";
import { getStoredRole } from "@/lib/authStorage";
import {
  canManageProducts,
  isLowStock,
  type Product,
  type ProductFormValues,
  type StockAdjustReason,
  type StockLevelFilter,
  type VatFilter,
} from "@/types/products";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ProductsPage() {
  const canManage = canManageProducts(getStoredRole());
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const [rows, cats] = await Promise.all([
        listProducts({ is_active: true }),
        listCategories(),
      ]);
      setProducts(rows);
      setCategories(cats);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Could not load products. Is the API running?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (category === "none" && p.categoryId) return false;
      if (
        category !== "all" &&
        category !== "none" &&
        p.categoryId !== category
      ) {
        return false;
      }
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

  const handleSaveForm = async (
    values: ProductFormValues,
    editingId?: string,
  ) => {
    try {
      if (editingId) {
        const updated = await updateProduct(editingId, values);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...updated, stockQty: p.stockQty, movements: p.movements }
              : p,
          ),
        );
        await refresh();
        return;
      }
      await createProduct(values);
      await refresh();
    } catch (err) {
      throw err instanceof ApiError
        ? err
        : new Error("Could not save product.");
    }
  };

  const handleAdjustStock = async (input: {
    productId: string;
    quantityDelta: number;
    reason: StockAdjustReason;
    notes: string;
  }) => {
    try {
      const { quantity } = await adjustStock(input);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== input.productId) return p;
          return {
            ...p,
            stockQty: quantity,
            movements: [
              {
                id: `mov-${Date.now()}`,
                quantityDelta: input.quantityDelta,
                reason: input.reason,
                notes: input.notes,
                createdAt: new Date().toISOString(),
              },
              ...p.movements,
            ],
          };
        }),
      );
    } catch (err) {
      throw err instanceof ApiError
        ? err
        : new Error("Could not adjust stock.");
    }
  };

  const handleDelete = async (product: Product) => {
    await archiveProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleCreateCategory = async (name: string) => {
    const created = await createCategory(name);
    setCategories((prev) => {
      if (prev.some((c) => c.id === created.id)) return prev;
      return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
    });
    return created;
  };

  return (
    <DashboardShell
      title="Products"
      subtitle="Catalog, VAT, and stock ledger"
    >
      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setLoading(true);
              void refresh();
            }}
          >
            Retry
          </button>
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading products…</p>
      ) : (
        <>
          <ProductInsights
            products={products}
            filteredCount={filtered.length}
          />

          <ProductFilters
            search={search}
            category={category}
            vat={vat}
            stock={stock}
            categories={categories}
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
        </>
      )}

      {canManage ? (
        <>
          <ProductFormOverlay
            open={formOpen}
            mode={formMode}
            product={editing}
            categories={categories}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSave={handleSaveForm}
            onCreateCategory={handleCreateCategory}
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
            onConfirm={(product) => {
              void handleDelete(product).then(() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              });
            }}
          />
        </>
      ) : null}
    </DashboardShell>
  );
}
