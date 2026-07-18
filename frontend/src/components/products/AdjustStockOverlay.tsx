import type { Product, StockAdjustReason } from "@/types/products";
import { useEffect, useId, useState, type FormEvent } from "react";

type AdjustStockOverlayProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (input: {
    productId: string;
    quantityDelta: number;
    reason: StockAdjustReason;
    notes: string;
  }) => void;
};

const REASONS: { value: StockAdjustReason; label: string }[] = [
  { value: "adjustment", label: "Adjustment / correction" },
  { value: "damage", label: "Damage / spoilage" },
  { value: "correction", label: "Count correction" },
  { value: "transfer", label: "Transfer (manual)" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

export function AdjustStockOverlay({
  open,
  product,
  onClose,
  onSave,
}: AdjustStockOverlayProps) {
  const titleId = useId();
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState<StockAdjustReason>("adjustment");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDelta("");
    setReason("adjustment");
    setNotes("");
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !product) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const quantityDelta = Number(delta);
    if (!Number.isFinite(quantityDelta) || quantityDelta === 0) {
      setError("Enter a non-zero quantity change (+ or −).");
      return;
    }
    const nextQty = product.stockQty + quantityDelta;
    if (nextQty < 0) {
      setError("Stock cannot go below zero.");
      return;
    }
    onSave({
      productId: product.id,
      quantityDelta,
      reason,
      notes: notes.trim() || REASONS.find((r) => r.value === reason)?.label || "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close overlay"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            Adjust stock
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {product.name} · current{" "}
            <span className="font-semibold text-slate-800">
              {product.stockQty.toLocaleString("en-NP")} {product.unit}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Quantity change
            </span>
            <input
              type="number"
              step="1"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. -3 or 10"
              className={inputClass}
            />
            <span className="text-[11px] text-slate-400">
              Use negative for decrease (damage, correction down)
            </span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Reason</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockAdjustReason)}
              className={inputClass}
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Notes (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="What happened?"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-600/15 hover:bg-sky-700"
            >
              Save movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
