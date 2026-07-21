import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PERIOD_OPTIONS, REPORT_BY_PERIOD } from "@/constants/reports";
import { formatNpr } from "@/lib/vat";
import { cn } from "@/lib/cn";
import type { ReportPeriod } from "@/types/reports";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const snap = REPORT_BY_PERIOD[period];

  const cards = [
    {
      label: "Sales total",
      value: formatNpr(snap.salesTotalNpr),
      hint: `${snap.invoiceCount} invoices`,
      tone: "neutral" as const,
    },
    {
      label: "VAT collected",
      value: formatNpr(snap.vatCollectedNpr),
      hint: "13% on taxable lines",
      tone: "up" as const,
    },
    {
      label: "Dues outstanding",
      value: formatNpr(snap.duesOutstandingNpr),
      hint: "Customer udhaaro",
      tone: snap.duesOutstandingNpr > 0 ? ("warn" as const) : ("neutral" as const),
    },
    {
      label: "Personal sales",
      value: formatNpr(snap.personalSalesNpr),
      hint: "No VAT channel",
      tone: "neutral" as const,
    },
  ];

  return (
    <DashboardShell
      title="Reports"
      subtitle="Sales pulse for the selected period"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Mock totals — wire to API aggregates later.
        </p>
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
          role="tablist"
          aria-label="Report period"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={period === opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                period === opt.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => (
          <motion.article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06 }}
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {card.value}
            </p>
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                card.tone === "warn" && "text-amber-600",
                card.tone === "up" && "text-emerald-600",
                card.tone === "neutral" && "text-slate-500",
              )}
            >
              {card.hint}
            </p>
          </motion.article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Period notes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fiscal year follows Shrawan–Ashad. VAT is rounded per line at 13%.
          Personal sales stay outside VAT totals.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Invoices
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {snap.invoiceCount}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Avg ticket
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {formatNpr(
                snap.invoiceCount
                  ? Math.round(snap.salesTotalNpr / snap.invoiceCount)
                  : 0,
              )}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              VAT share
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {snap.salesTotalNpr
                ? `${((snap.vatCollectedNpr / snap.salesTotalNpr) * 100).toFixed(1)}%`
                : "0%"}
            </dd>
          </div>
        </dl>
      </section>
    </DashboardShell>
  );
}
