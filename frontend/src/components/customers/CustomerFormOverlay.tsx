import type { Customer, CustomerFormValues } from "@/types/customers";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

type CustomerFormOverlayProps = {
  open: boolean;
  mode: "create" | "edit";
  customer?: Customer | null;
  onClose: () => void;
  onSave: (values: CustomerFormValues, editingId?: string) => void | Promise<void>;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

function emptyForm(): CustomerFormValues {
  return { name: "", phone: "", pan: "", address: "" };
}

function fromCustomer(c: Customer): CustomerFormValues {
  return {
    name: c.name,
    phone: c.phone,
    pan: c.pan,
    address: c.address,
  };
}

export function CustomerFormOverlay({
  open,
  mode,
  customer,
  onClose,
  onSave,
}: CustomerFormOverlayProps) {
  const titleId = useId();
  const isCreate = mode === "create";
  const [values, setValues] = useState<CustomerFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(customer ? fromCustomer(customer) : emptyForm());
    setError(null);
    setSaving(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, customer, onClose]);

  if (!open) return null;

  const update = <K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Customer name is required.");
      return;
    }
    const pan = values.pan.trim();
    if (pan && !/^\d{9}$/.test(pan)) {
      setError("PAN must be 9 digits when provided.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          name: values.name.trim(),
          phone: values.phone.trim(),
          pan,
          address: values.address.trim(),
        },
        customer?.id,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save customer.");
    } finally {
      setSaving(false);
    }
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
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            {isCreate ? "New contact" : "Update"}
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-900">
            {isCreate ? "Add customer" : "Edit customer"}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            PAN required later for tax invoices — optional here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <Field label="Name">
            <input
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Himalayan Traders"
            />
          </Field>
          <Field label="Phone">
            <input
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              placeholder="98XXXXXXXX"
            />
          </Field>
          <Field label="PAN (9 digits)">
            <input
              value={values.pan}
              onChange={(e) => update("pan", e.target.value)}
              className={inputClass}
              placeholder="Optional"
              maxLength={9}
            />
          </Field>
          <Field label="Address">
            <input
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </Field>
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
              disabled={saving}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700 disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : isCreate
                  ? "Save customer"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
