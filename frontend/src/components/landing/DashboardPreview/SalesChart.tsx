import { CHART_BARS, CHART_DAYS } from "@/constants/landing";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";

export function SalesChart() {
  return (
    <motion.div
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-900">This week</p>
        <p className="text-[9px] text-slate-400">Sales (रू)</p>
      </div>
      <div className="flex h-28 items-end justify-between gap-1.5" role="img" aria-label="Weekly sales chart">
        {CHART_BARS.map((height, i) => (
          <div
            key={CHART_DAYS[i]}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <motion.div
              className="w-full rounded-t-md bg-gradient-to-t from-red-600 to-red-400"
              initial={{ height: 0 }}
              whileInView={{ height: `${height}%` }}
              viewport={{ once: true }}
              transition={{
                delay: 0.6 + i * 0.08,
                duration: 0.7,
                ease: EASE_OUT_EXPO,
              }}
              style={{ minHeight: 4 }}
            />
            <span className="text-[9px] text-slate-400">{CHART_DAYS[i]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
