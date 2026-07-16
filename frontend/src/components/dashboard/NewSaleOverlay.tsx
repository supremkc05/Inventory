import { cn } from "@/lib/cn";
import type {
  PersonalSale,
  PersonalSaleProduct,
  SaleChannel,
  TaxInvoiceProduct,
  TaxInvoiceSale,
} from "@/types/dashboard";
import { useEffect, useId, useState, type FormEvent } from "react";

const VAT_RATE = 0.13;

type NewSaleOverlayProps = {
  open: boolean;
  channel: SaleChannel;
  onClose: () => void;
  onSaveTax: (sale: TaxInvoiceSale) => void;
  onSavePersonal: (sale: PersonalSale) => void;
};

type TaxLine = {
  id: string;
  name: string;
  qty: string;
  listPriceNpr: string;
  deductedPriceNpr: string;
};

type PersonalLine = {
  id: string;
  name: string;
  qty: string;
  priceNpr: string;
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyTaxLine(): TaxLine {
  return {
    id: newId(),
    name: "",
    qty: "1",
    listPriceNpr: "",
    deductedPriceNpr: "",
  };
}

function emptyPersonalLine(): PersonalLine {
  return { id: newId(), name: "", qty: "1", priceNpr: "" };
}

export function NewSaleOverlay({
  open,
  channel,
  onClose,
  onSaveTax,
  onSavePersonal,
}: NewSaleOverlayProps) {
  const titleId = useId();
  const isTax = channel === "tax";

  const [customer, setCustomer] = useState("");
  const [invoiceType, setInvoiceType] = useState<"Tax Invoice" | "Abbreviated">(
    "Tax Invoice",
  );
  const [buyer, setBuyer] = useState("");
  const [taxLines, setTaxLines] = useState<TaxLine[]>([emptyTaxLine()]);
  const [personalLines, setPersonalLines] = useState<PersonalLine[]>([
    emptyPersonalLine(),
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCustomer("");
    setBuyer("");
    setInvoiceType("Tax Invoice");
    setTaxLines([emptyTaxLine()]);
    setPersonalLines([emptyPersonalLine()]);
    setError(null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isTax) {
      if (!customer.trim()) {
        setError("Customer name is required.");
        return;
      }
      const products: TaxInvoiceProduct[] = [];
      for (const line of taxLines) {
        const qty = Number(line.qty);
        const list = Number(line.listPriceNpr);
        const deducted = Number(line.deductedPriceNpr);
        if (!line.name.trim() || !(qty > 0) || !(list >= 0) || !(deducted >= 0)) {
          setError("Fill every product with a valid name, qty, and prices.");
          return;
        }
        if (deducted > list) {
          setError("Deducted price cannot be higher than list price.");
          return;
        }
        products.push({
          name: line.name.trim(),
          qty,
          listPriceNpr: list,
          deductedPriceNpr: deducted,
          vatNpr: Math.round(deducted * VAT_RATE * 100) / 100,
        });
      }
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      onSaveTax({
        invoice: `2082/83-${seq}`,
        customer: customer.trim(),
        type: invoiceType,
        status: "Paid",
        products,
      });
    } else {
      if (!buyer.trim()) {
        setError("Buyer name is required.");
        return;
      }
      const products: PersonalSaleProduct[] = [];
      for (const line of personalLines) {
        const qty = Number(line.qty);
        const price = Number(line.priceNpr);
        if (!line.name.trim() || !(qty > 0) || !(price >= 0)) {
          setError("Fill every product with a valid name, qty, and price.");
          return;
        }
        products.push({
          name: line.name.trim(),
          qty,
          priceNpr: price,
        });
      }
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      onSavePersonal({
        id: `PS-${Math.floor(Math.random() * 900) + 100}`,
        buyer: buyer.trim(),
        time,
        status: "Paid",
        products,
      });
    }
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
        className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                isTax ? "text-red-600" : "text-sky-700",
              )}
            >
              {isTax ? "13% VAT" : "No VAT"}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-semibold text-slate-900"
            >
              {isTax ? "New tax invoice" : "New personal sale"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isTax
                ? "Add products with list price, deducted price, and auto VAT."
                : "Walk-in convenience sale — price only, tax-free."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {isTax ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Customer">
                    <input
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      placeholder="Business or buyer name"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Invoice type">
                    <select
                      value={invoiceType}
                      onChange={(e) =>
                        setInvoiceType(
                          e.target.value as "Tax Invoice" | "Abbreviated",
                        )
                      }
                      className={inputClass}
                    >
                      <option value="Tax Invoice">Tax Invoice</option>
                      <option value="Abbreviated">Abbreviated</option>
                    </select>
                  </Field>
                </div>

                <ProductSection
                  title="Products"
                  onAdd={() => setTaxLines((rows) => [...rows, emptyTaxLine()])}
                >
                  {taxLines.map((line, index) => (
                    <div
                      key={line.id}
                      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500">
                          Line {index + 1}
                        </p>
                        {taxLines.length > 1 ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                            onClick={() =>
                              setTaxLines((rows) =>
                                rows.filter((r) => r.id !== line.id),
                              )
                            }
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <Field label="Product name">
                        <input
                          value={line.name}
                          onChange={(e) =>
                            setTaxLines((rows) =>
                              rows.map((r) =>
                                r.id === line.id
                                  ? { ...r, name: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          placeholder="e.g. Basmati rice 25kg"
                          className={inputClass}
                        />
                      </Field>
                      <div className="grid grid-cols-3 gap-2">
                        <Field label="Qty">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={line.qty}
                            onChange={(e) =>
                              setTaxLines((rows) =>
                                rows.map((r) =>
                                  r.id === line.id
                                    ? { ...r, qty: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label="List (रू)">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.listPriceNpr}
                            onChange={(e) =>
                              setTaxLines((rows) =>
                                rows.map((r) =>
                                  r.id === line.id
                                    ? { ...r, listPriceNpr: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Deducted (रू)">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.deductedPriceNpr}
                            onChange={(e) =>
                              setTaxLines((rows) =>
                                rows.map((r) =>
                                  r.id === line.id
                                    ? {
                                        ...r,
                                        deductedPriceNpr: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>
                      </div>
                      {Number(line.deductedPriceNpr) > 0 ? (
                        <p className="text-xs text-slate-500">
                          VAT / unit:{" "}
                          <span className="font-semibold text-red-600">
                            रू{" "}
                            {(
                              Math.round(
                                Number(line.deductedPriceNpr) * VAT_RATE * 100,
                              ) / 100
                            ).toLocaleString("en-NP")}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </ProductSection>
              </>
            ) : (
              <>
                <Field label="Buyer">
                  <input
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    placeholder="Walk-in or customer name"
                    className={inputClass}
                  />
                </Field>

                <ProductSection
                  title="Products"
                  onAdd={() =>
                    setPersonalLines((rows) => [...rows, emptyPersonalLine()])
                  }
                >
                  {personalLines.map((line, index) => (
                    <div
                      key={line.id}
                      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500">
                          Line {index + 1}
                        </p>
                        {personalLines.length > 1 ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                            onClick={() =>
                              setPersonalLines((rows) =>
                                rows.filter((r) => r.id !== line.id),
                              )
                            }
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <Field label="Product name">
                        <input
                          value={line.name}
                          onChange={(e) =>
                            setPersonalLines((rows) =>
                              rows.map((r) =>
                                r.id === line.id
                                  ? { ...r, name: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          placeholder="e.g. Instant noodles"
                          className={inputClass}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Qty">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={line.qty}
                            onChange={(e) =>
                              setPersonalLines((rows) =>
                                rows.map((r) =>
                                  r.id === line.id
                                    ? { ...r, qty: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Price (रू)">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.priceNpr}
                            onChange={(e) =>
                              setPersonalLines((rows) =>
                                rows.map((r) =>
                                  r.id === line.id
                                    ? { ...r, priceNpr: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>
                      </div>
                      <p className="text-xs font-medium text-sky-700">
                        Tax-free · personal use
                      </p>
                    </div>
                  ))}
                </ProductSection>
              </>
            )}

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                isTax
                  ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                  : "bg-sky-600 shadow-sky-600/15 hover:bg-sky-700",
              )}
            >
              {isTax ? "Save invoice" : "Save personal sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ProductSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          + Add product
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
