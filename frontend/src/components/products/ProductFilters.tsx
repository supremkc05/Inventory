import { cn } from "@/lib/cn";
import type { Category } from "@/api/categories";
import type { StockLevelFilter, VatFilter } from "@/types/products";
import { Link } from "react-router-dom";

type ProductFiltersProps = {
  search: string;
  category: string;
  vat: VatFilter;
  stock: StockLevelFilter;
  categories: Category[];
  canManage: boolean;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onVatChange: (value: VatFilter) => void;
  onStockChange: (value: StockLevelFilter) => void;
  onAdd: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

export function ProductFilters({
  search,
  category,
  vat,
  stock,
  categories,
  canManage,
  resultCount,
  onSearchChange,
  onCategoryChange,
  onVatChange,
  onStockChange,
  onAdd,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or SKU…"
            className={fieldClass}
          />
        </label>
        <label className="sm:w-40">
          <span className="sr-only">Stock level</span>
          <select
            value={stock}
            onChange={(e) =>
              onStockChange(e.target.value as StockLevelFilter)
            }
            className={fieldClass}
          >
            <option value="all">Any stock</option>
            <option value="in_stock">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <label className="sm:w-48">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={fieldClass}
          >
            <option value="all">All categories</option>
            <option value="none">Uncategorized</option>
            {categories
              .filter((c) => c.isActive)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        <label className="sm:w-40">
          <span className="sr-only">VAT</span>
          <select
            value={vat}
            onChange={(e) => onVatChange(e.target.value as VatFilter)}
            className={fieldClass}
          >
            <option value="all">Any VAT</option>
            <option value="applicable">VAT on</option>
            <option value="exempt">Exempt</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {resultCount} product{resultCount === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <Link
              to="/categories"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage categories
            </Link>
          ) : null}
          {canManage ? (
            <button
              type="button"
              onClick={onAdd}
              className={cn(
                "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700",
              )}
            >
              Add product
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
