import { cn } from "@/lib/cn";
import { DEFAULT_VAT_RATE, roundMoney } from "@/lib/vat";
import type { SaleChannel } from "@/types/dashboard";
import type { Product } from "@/types/products";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

export type NewSaleSubmitPayload = {
  billType: "tax_invoice" | "abbreviated";
  /** Free-text buyer / business name for tax invoices. */
  customerName: string;
  notes: string;
  paidInFull: boolean;
  lines: { product_id: number; quantity: string; unit_price: string }[];
};

type NewSaleOverlayProps = {
  open: boolean;
  channel: SaleChannel;
  products: Product[];
  onClose: () => void;
  onSubmit: (payload: NewSaleSubmitPayload) => Promise<void>;
};

type Line = {
  id: string;
  productId: string;
  qty: string;
  unitPrice: string;
  query: string;
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyLine(): Line {
  return { id: newId(), productId: "", qty: "1", unitPrice: "", query: "" };
}

export function NewSaleOverlay({
  open,
  channel,
  products,
  onClose,
  onSubmit,
}: NewSaleOverlayProps) {
  const titleId = useId();
  const isTax = channel === "tax";

  const [customerName, setCustomerName] = useState("");
  const [invoiceType, setInvoiceType] = useState<"Tax Invoice" | "Abbreviated">(
    "Tax Invoice",
  );
  const [buyer, setBuyer] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [paidInFull, setPaidInFull] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerName("");
    setBuyer("");
    setInvoiceType("Tax Invoice");
    setLines([emptyLine()]);
    setPaidInFull(true);
    setError(null);
    setSaving(false);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const catalog = useMemo(() => {
    // Show all active products for both channels. Save still enforces stock.
    return products.filter((p) => p.isActive);
  }, [products]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isTax && !customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    const prepared: NewSaleSubmitPayload["lines"] = [];
    for (const line of lines) {
      const product = catalog.find((p) => p.id === line.productId);
      const qty = Number(line.qty);
      const price = Number(line.unitPrice);
      if (!product || !(qty > 0) || !(price >= 0) || line.unitPrice.trim() === "") {
        setError("Pick a product and enter valid qty and price on every line.");
        return;
      }
      if (product.stockQty <= 0) {
        setError(
          `${product.name} has no stock. Adjust stock on the Products page first.`,
        );
        return;
      }
      if (qty > product.stockQty) {
        setError(
          `Insufficient stock for ${product.name} (have ${product.stockQty}).`,
        );
        return;
      }
      prepared.push({
        product_id: Number(product.id),
        quantity: String(qty),
        unit_price: String(price),
      });
    }

    const payload: NewSaleSubmitPayload = {
      billType: isTax
        ? invoiceType === "Tax Invoice"
          ? "tax_invoice"
          : "abbreviated"
        : "abbreviated",
      customerName: isTax ? customerName.trim() : "",
      notes: isTax ? "" : buyer.trim() || "Walk-in",
      paidInFull,
      lines: prepared,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save sale.");
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
              {isTax ? "13% VAT" : "No VAT channel"}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-semibold text-slate-900"
            >
              {isTax ? "New tax invoice" : "New personal sale"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Type to search products by name or SKU.
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
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {catalog.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                No products in your catalog yet. Add one on the Products page,
                then open this form again.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {catalog.length} product{catalog.length === 1 ? "" : "s"} in
                catalog — type or click the product field to choose.
              </p>
            )}

            {isTax ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer name">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Business or buyer name"
                    className={inputClass}
                    autoComplete="organization"
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
            ) : (
              <Field label="Buyer">
                <input
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  placeholder="Walk-in or customer name"
                  className={inputClass}
                />
              </Field>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Products
                </h3>
                <button
                  type="button"
                  onClick={() => setLines((rows) => [...rows, emptyLine()])}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  + Add product
                </button>
              </div>
              <div className="space-y-3">
                {lines.map((line, index) => {
                  const selected = catalog.find((p) => p.id === line.productId);
                  const qty = Number(line.qty) || 0;
                  const price = Number(line.unitPrice) || 0;
                  const lineSub = roundMoney(qty * price);
                  const lineVat =
                    isTax && selected?.vatApplicable
                      ? roundMoney(lineSub * DEFAULT_VAT_RATE)
                      : 0;

                  return (
                    <div
                      key={line.id}
                      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500">
                          Line {index + 1}
                        </p>
                        {lines.length > 1 ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                            onClick={() =>
                              setLines((rows) =>
                                rows.filter((r) => r.id !== line.id),
                              )
                            }
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-600">
                          Product
                        </span>
                        <ProductSearchField
                          products={catalog}
                          query={line.query}
                          productId={line.productId}
                          onQueryChange={(query) =>
                            setLines((rows) =>
                              rows.map((r) =>
                                r.id === line.id
                                  ? { ...r, query, productId: "" }
                                  : r,
                              ),
                            )
                          }
                          onSelect={(product) =>
                            setLines((rows) =>
                              rows.map((r) =>
                                r.id === line.id
                                  ? {
                                      ...r,
                                      productId: product.id,
                                      query: product.name,
                                      unitPrice: String(product.sellingPriceNpr),
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Qty">
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={line.qty}
                            onChange={(e) =>
                              setLines((rows) =>
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
                        <Field label="Unit price (रू)">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) =>
                              setLines((rows) =>
                                rows.map((r) =>
                                  r.id === line.id
                                    ? { ...r, unitPrice: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>
                      </div>
                      {selected ? (
                        <p className="text-xs text-slate-500">
                          Stock: {selected.stockQty} {selected.unit}
                          {selected.stockQty <= 0 ? (
                            <span className="font-semibold text-amber-700">
                              {" "}
                              · out of stock — adjust stock before saving
                            </span>
                          ) : null}
                          {lineSub > 0 ? (
                            <>
                              {" "}
                              · Line {isTax ? "excl. VAT" : "total"}: रू{" "}
                              {lineSub.toLocaleString("en-NP")}
                              {isTax ? (
                                <>
                                  {" "}
                                  · VAT:{" "}
                                  <span className="font-semibold text-red-600">
                                    रू {lineVat.toLocaleString("en-NP")}
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium text-sky-700">
                                  {" "}
                                  · tax-free
                                </span>
                              )}
                            </>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={paidInFull}
                onChange={(e) => setPaidInFull(e.target.checked)}
                className="rounded border-slate-300"
              />
              Mark as paid in full
            </label>

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
              disabled={saving || catalog.length === 0}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60",
                isTax
                  ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                  : "bg-sky-600 shadow-sky-600/15 hover:bg-sky-700",
              )}
            >
              {saving
                ? "Saving…"
                : isTax
                  ? "Save invoice"
                  : "Save personal sale"}
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

function ProductSearchField({
  products,
  query,
  productId,
  onQueryChange,
  onSelect,
}: {
  products: Product[];
  query: string;
  productId: string;
  onQueryChange: (query: string) => void;
  onSelect: (product: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? products
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q),
        );
    return list.slice(0, 20);
  }, [products, query]);

  return (
    <div ref={rootRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        placeholder="Click or type name / SKU…"
        className={inputClass}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">
              {products.length === 0
                ? "No products in catalog"
                : "No match — try another name or SKU"}
            </li>
          ) : (
            matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50",
                    productId === p.id && "bg-red-50",
                  )}
                  onMouseDown={(e) => {
                    // Prevent input blur before click registers.
                    e.preventDefault();
                  }}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                >
                  <span className="font-medium text-slate-900">{p.name}</span>
                  <span className="text-xs text-slate-500">
                    {p.sku} · stock {p.stockQty} {p.unit} · रू{" "}
                    {p.sellingPriceNpr}
                    {p.stockQty <= 0 ? " · out of stock" : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
