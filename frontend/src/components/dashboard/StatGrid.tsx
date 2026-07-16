import { AnimatedNumber } from "@/components/landing/DashboardPreview/AnimatedNumber";
import { DASHBOARD_PAGE_STATS } from "@/constants/dashboard";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

export function StatGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {DASHBOARD_PAGE_STATS.map((card, i) => (
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
