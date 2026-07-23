import type { Customer } from "@/types/customers";
import { useEffect, useId } from "react";

type DeleteCustomerDialogProps = {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onConfirm: (customer: Customer) => void;
};

export function DeleteCustomerDialog({
  open,
  customer,
  onClose,
  onConfirm,
}: DeleteCustomerDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !customer) return null;

  const willArchive = customer.hasTransactions;

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
            {willArchive ? "Preserve history" : "Remove contact"}
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-900">
            {willArchive ? "Archive customer?" : "Delete customer?"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{customer.name}</span>{" "}
            {willArchive
              ? "has sales history and will be archived."
              : "has no history and will be permanently deleted."}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(customer);
              onClose();
            }}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700"
          >
            {willArchive ? "Archive" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
