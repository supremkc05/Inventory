import { AnimatedNumber } from "@/components/landing/DashboardPreview/AnimatedNumber";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

export type DashboardLiveStats = {
  todaySalesNpr: number;
  vatCollectedNpr: number;
  personalSalesNpr: number;
  lowStockCount: number;
};

type StatGridProps = {
  stats: DashboardLiveStats;
  loading?: boolean;
};

export function StatGrid({ stats, loading = false }: StatGridProps) {
  const cards = [
    {
      label: "Today's sales",
      value: stats.todaySalesNpr,
      prefix: "रु ",
      trend: loading ? "Loading…" : "Excl. VAT · today",
      trendUp: true,
    },
    {
      label: "VAT collected",
      value: stats.vatCollectedNpr,
      prefix: "रु ",
      trend: loading ? "Loading…" : "Today (live)",
      trendUp: true,
    },
    {
      label: "Personal sales",
      value: stats.personalSalesNpr,
      prefix: "रु ",
      trend: loading ? "Loading…" : "Excl. VAT · today",
      trendUp: true,
    },
    {
      label: "Low stock",
      value: stats.lowStockCount,
      suffix: " items",
      trend: loading
        ? "Loading…"
        : stats.lowStockCount > 0
          ? "Needs reorder"
          : "All healthy",
      trendUp: stats.lowStockCount === 0,
    },
  ];

  return (
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
            <AnimatedNumber
              value={card.value}
              prefix={card.prefix}
              suffix={card.suffix}
            />
          </p>
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              card.trendUp ? "text-emerald-600" : "text-amber-600",
            )}
          >
            {card.trend}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
