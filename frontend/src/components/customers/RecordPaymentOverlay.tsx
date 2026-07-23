import { formatNpr } from "@/lib/vat";
import type { Customer } from "@/types/customers";
import { useEffect, useId, useState, type FormEvent } from "react";

type RecordPaymentOverlayProps = {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (input: {
    customerId: string;
    amountNpr: number;
    notes: string;
  }) => void;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

export function RecordPaymentOverlay({
  open,
  customer,
  onClose,
  onSave,
}: RecordPaymentOverlayProps) {
  const titleId = useId();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setNotes("");
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !customer) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountNpr = Number(amount);
    if (!(amountNpr > 0)) {
      setError("Enter a payment amount greater than zero.");
      return;
    }
    if (amountNpr > customer.dueBalanceNpr) {
      setError("Payment cannot exceed outstanding due.");
      return;
    }
    onSave({
      customerId: customer.id,
      amountNpr,
      notes: notes.trim() || "Payment received",
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
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            Udhaaro
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-900">
            Record payment
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {customer.name} · due{" "}
            <span className="font-semibold text-slate-800">
              {formatNpr(customer.dueBalanceNpr)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Amount (रू)
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder="e.g. 5000"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Notes (optional)
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              placeholder="Cash / bank / eSewa"
            />
          </label>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
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
              Save payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
