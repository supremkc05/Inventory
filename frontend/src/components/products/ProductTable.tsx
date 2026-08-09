import { formatNpr } from "@/constants/products";
import { cn } from "@/lib/cn";
import { isLowStock, type Product } from "@/types/products";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ProductTableProps = {
  products: Product[];
  canManage: boolean;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductTable({
  products,
  canManage,
  onEdit,
  onAdjustStock,
  onDelete,
}: ProductTableProps) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-900">No products found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try another search or filter, or add a product to the catalog.
        </p>
      </div>
    );
  }

  return (
    <motion.section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Catalog</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Prices, VAT, and stock for your dokan
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Sale / Cost</th>
              <th className="px-5 py-3 font-medium">VAT</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              {canManage ? (
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const low = isLowStock(product);
              const out = product.stockQty <= 0;

              return (
                <tr
                  key={product.id}
                  className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                            —
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.category || "Uncategorized"} · {product.unit}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                    {product.sku}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold tabular-nums text-slate-900">
                      {formatNpr(product.sellingPriceNpr)}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-slate-400">
                      Cost {formatNpr(product.costPriceNpr)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        product.vatApplicable
                          ? "bg-red-600/10 text-red-700"
                          : "bg-sky-600/10 text-sky-800",
                      )}
                    >
                      {product.vatApplicable ? "13% VAT" : "Exempt"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p
                      className={cn(
                        "font-semibold tabular-nums",
                        out
                          ? "text-red-600"
                          : low
                            ? "text-amber-600"
                            : "text-slate-900",
                      )}
                    >
                      {product.stockQty.toLocaleString("en-NP")}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Reorder {product.reorderLevel}
                      {out ? " · Out" : low ? " · Low" : ""}
                    </p>
                  </td>
                  {canManage ? (
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          label="Edit"
                          onClick={() => onEdit(product)}
                        >
                          <EditIcon />
                        </ActionButton>
                        {product.isActive ? (
                          <ActionButton
                            label="Adjust stock"
                            onClick={() => onAdjustStock(product)}
                          >
                            <StackIcon />
                          </ActionButton>
                        ) : null}
                        <ActionButton
                          label="Delete"
                          danger
                          onClick={() => onDelete(product)}
                        >
                          <TrashIcon />
                        </ActionButton>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

function ActionButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm",
        danger && "hover:border-red-100 hover:bg-red-50 hover:text-red-600",
      )}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 6l4 4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 8l8-4 8 4-8 4-8-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4 12l8 4 8-4M4 16l8 4 8-4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V5h6v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
