import type { Product } from "@/types/products";
import { useEffect, useId } from "react";

type DeleteProductDialogProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product) => void;
};

export function DeleteProductDialog({
  open,
  product,
  onClose,
  onConfirm,
}: DeleteProductDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !product) return null;

  const willArchive = product.hasTransactions;
  const alreadyArchived = !product.isActive;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            {willArchive ? "Preserve history" : "Remove from catalog"}
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-900">
            {alreadyArchived
              ? "Already archived"
              : willArchive
                ? "Archive product?"
                : "Delete product?"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {alreadyArchived ? (
              <>
                <span className="font-semibold text-slate-800">
                  {product.name}
                </span>{" "}
                is archived for old invoices and cannot be hard-deleted.
              </>
            ) : willArchive ? (
              <>
                <span className="font-semibold text-slate-800">
                  {product.name}
                </span>{" "}
                has transaction history, so it will be archived — hidden from
                selling, kept for reports.
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-800">
                  {product.name}
                </span>{" "}
                has no history and will be permanently deleted.
              </>
            )}
          </p>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {alreadyArchived ? "Close" : "Cancel"}
          </button>
          {!alreadyArchived ? (
            <button
              type="button"
              onClick={() => {
                onConfirm(product);
                onClose();
              }}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700"
            >
              {willArchive ? "Archive" : "Delete permanently"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
