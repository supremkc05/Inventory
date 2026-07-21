import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/cn";
import {
  DEFAULT_VAT_RATE,
  formatNpr,
  roundMoney,
  vatFromExclusive,
  vatFromInclusive,
} from "@/lib/vat";
import { useMemo, useState } from "react";

type Mode = "exclusive" | "inclusive";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

export default function VatCalculatorPage() {
  const [mode, setMode] = useState<Mode>("exclusive");
  const [unitPrice, setUnitPrice] = useState("1000");
  const [qty, setQty] = useState("1");
  const [applicable, setApplicable] = useState(true);

  const result = useMemo(() => {
    const unit = Number(unitPrice);
    const quantity = Number(qty);
    if (!Number.isFinite(unit) || unit < 0) {
      return {
        qty: 0,
        unit,
        lineExclusive: 0,
        lineVat: 0,
        lineInclusive: 0,
        perUnitExclusive: 0,
        perUnitVat: 0,
        perUnitInclusive: 0,
      };
    }
    const safeQty =
      Number.isFinite(quantity) && quantity > 0 ? quantity : 0;

    if (mode === "exclusive") {
      const lineExclusive = roundMoney(unit * safeQty);
      const line = vatFromExclusive(
        lineExclusive,
        DEFAULT_VAT_RATE,
        applicable,
      );
      const perUnit = vatFromExclusive(unit, DEFAULT_VAT_RATE, applicable);
      return {
        qty: safeQty,
        unit,
        lineExclusive: line.exclusive,
        lineVat: line.vat,
        lineInclusive: line.inclusive,
        perUnitExclusive: perUnit.exclusive,
        perUnitVat: perUnit.vat,
        perUnitInclusive: perUnit.inclusive,
      };
    }

    // Inclusive unit price × qty → extract VAT from line total
    const lineInclusive = roundMoney(unit * safeQty);
    if (!applicable) {
      return {
        qty: safeQty,
        unit,
        lineExclusive: lineInclusive,
        lineVat: 0,
        lineInclusive,
        perUnitExclusive: roundMoney(unit),
        perUnitVat: 0,
        perUnitInclusive: roundMoney(unit),
      };
    }
    const line = vatFromInclusive(lineInclusive, DEFAULT_VAT_RATE);
    const perUnit = vatFromInclusive(unit, DEFAULT_VAT_RATE);
    return {
      qty: safeQty,
      unit,
      lineExclusive: line.exclusive,
      lineVat: line.vat,
      lineInclusive: line.inclusive,
      perUnitExclusive: perUnit.exclusive,
      perUnitVat: perUnit.vat,
      perUnitInclusive: perUnit.inclusive,
    };
  }, [unitPrice, qty, mode, applicable]);

  return (
    <DashboardShell
      title="VAT calculator"
      subtitle="Line totals for tax bills — qty × unit, then 13% VAT"
    >
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
            role="tablist"
            aria-label="Calculation mode"
          >
            {(
              [
                { id: "exclusive" as const, label: "Add VAT" },
                { id: "inclusive" as const, label: "Extract VAT" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => setMode(tab.id)}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                  mode === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">
                {mode === "exclusive"
                  ? "Unit price before VAT (रू)"
                  : "Unit price including VAT (रू)"}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={fieldClass}
                placeholder="e.g. 1000"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Quantity
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={fieldClass}
                placeholder="e.g. 3"
              />
            </label>
          </div>

          <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Line subtotal{" "}
            <span className="font-semibold text-slate-900">
              {formatNpr(roundMoney(Number(unitPrice || 0) * (Number(qty) || 0)))}
            </span>
            <span className="text-slate-400">
              {" "}
              ({qty || 0} × {formatNpr(Number(unitPrice) || 0)})
            </span>
          </p>

          <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                VAT applicable
              </span>
              <span className="text-xs text-slate-500">
                Off for exempt goods (e.g. basic grains)
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={applicable}
              onClick={() => setApplicable((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full transition",
                applicable ? "bg-red-600" : "bg-slate-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                  applicable ? "left-5" : "left-0.5",
                )}
              />
            </button>
          </label>

          <p className="mt-3 text-xs text-slate-400">
            Rate {DEFAULT_VAT_RATE * 100}% · subtotal = qty × unit · vat =
            round(subtotal × 0.13, 2)
          </p>
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Line total (for the bill)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Exclusive", value: result.lineExclusive },
              { label: "VAT (13%)", value: result.lineVat },
              { label: "Inclusive total", value: result.lineInclusive },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{row.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {formatNpr(row.value)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Per unit
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">Exclusive</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                {formatNpr(result.perUnitExclusive)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">VAT / unit</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                {formatNpr(result.perUnitVat)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Inclusive / unit</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                {formatNpr(result.perUnitInclusive)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </DashboardShell>
  );
}
