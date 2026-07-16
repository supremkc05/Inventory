import { CHART_BARS, CHART_DAYS } from "@/constants/landing";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";

export function WeeklyChart() {
  return (
    <motion.section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, ease: EASE_OUT_EXPO }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">This week</h2>
          <p className="mt-0.5 text-sm text-slate-500">Daily sales in NPR</p>
        </div>
        <p className="text-xs font-medium text-slate-400">रू</p>
      </div>

      <div
        className="flex h-48 items-end justify-between gap-2 sm:gap-3"
        role="img"
        aria-label="Weekly sales chart"
      >
        {CHART_BARS.map((height, i) => (
          <div
            key={CHART_DAYS[i]}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <motion.div
              className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-red-600 to-red-400"
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{
                delay: 0.3 + i * 0.07,
                duration: 0.7,
                ease: EASE_OUT_EXPO,
              }}
              style={{ minHeight: 6 }}
            />
            <span className="text-xs text-slate-500">{CHART_DAYS[i]}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
