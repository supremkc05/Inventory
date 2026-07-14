import { DASHBOARD_STATS } from "@/constants/landing";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

export function StatCards() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {DASHBOARD_STATS.map((card, i) => (
        <motion.div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 + i * 0.1 }}
        >
          <p className="text-[10px] text-slate-500">{card.label}</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900 sm:text-base">
            <AnimatedNumber
              value={card.value}
              prefix={card.prefix}
              suffix={card.suffix}
            />
          </p>
          <p
            className={cn(
              "mt-0.5 text-[10px] font-medium",
              card.trendUp ? "text-emerald-600" : "text-amber-600",
            )}
          >
            {card.trend}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
