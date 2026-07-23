import { formatNpr } from "@/lib/vat";
import { cn } from "@/lib/cn";
import type { Customer, DueFilter } from "@/types/customers";
import { motion } from "framer-motion";

type CustomerInsightsProps = {
  customers: Customer[];
  filteredCount: number;
};

export function CustomerInsights({
  customers,
  filteredCount,
}: CustomerInsightsProps) {
  const active = customers.filter((c) => c.isActive);
  const withDue = active.filter((c) => c.dueBalanceNpr > 0);
  const totalDue = withDue.reduce((s, c) => s + c.dueBalanceNpr, 0);
  const withPan = active.filter((c) => c.pan.length === 9).length;

  const items = [
    {
      label: "Customers",
      value: String(active.length),
      hint: `${filteredCount} showing`,
      tone: "neutral" as const,
    },
    {
      label: "With dues",
      value: String(withDue.length),
      hint: "Udhaaro open",
      tone: withDue.length > 0 ? ("warn" as const) : ("neutral" as const),
    },
    {
      label: "Total due",
      value: formatNpr(totalDue),
      hint: "Outstanding NPR",
      tone: totalDue > 0 ? ("danger" as const) : ("neutral" as const),
    },
    {
      label: "With PAN",
      value: String(withPan),
      hint: "Tax invoice ready",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.article
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.06 }}
        >
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {item.value}
          </p>
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              item.tone === "warn" && "text-amber-600",
              item.tone === "danger" && "text-red-600",
              item.tone === "neutral" && "text-slate-500",
            )}
          >
            {item.hint}
          </p>
        </motion.article>
      ))}
    </div>
  );
}

type CustomerFiltersProps = {
  search: string;
  due: DueFilter;
  canManage: boolean;
  resultCount: number;
  onSearchChange: (v: string) => void;
  onDueChange: (v: DueFilter) => void;
  onAdd: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

export function CustomerFilters({
  search,
  due,
  canManage,
  resultCount,
  onSearchChange,
  onDueChange,
  onAdd,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Search customers</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, phone, or PAN…"
          className={fieldClass}
        />
      </label>
      <label className="sm:w-44">
        <span className="sr-only">Due filter</span>
        <select
          value={due}
          onChange={(e) => onDueChange(e.target.value as DueFilter)}
          className={fieldClass}
        >
          <option value="all">All dues</option>
          <option value="with_due">With dues</option>
          <option value="clear">Cleared</option>
        </select>
      </label>
      {canManage ? (
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-xl bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-700"
        >
          Add customer
        </button>
      ) : null}
      <p className="text-sm text-slate-500 sm:ml-auto">
        <span className="font-semibold text-slate-800">{resultCount}</span>{" "}
        results
      </p>
    </div>
  );
}
