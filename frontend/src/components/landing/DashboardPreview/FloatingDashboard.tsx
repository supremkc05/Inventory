import { EASE_OUT_EXPO } from "@/lib/motion";
import { useFloatingTilt } from "@/hooks/useFloatingTilt";
import { motion } from "framer-motion";
import { BrowserChrome } from "./BrowserChrome";
import { DashboardSidebar } from "./DashboardSidebar";
import { RecentInvoices } from "./RecentInvoices";
import { SalesChart } from "./SalesChart";
import { StatCards } from "./StatCards";

export function FloatingDashboard() {
  const { cardRef, style, glowBackground, onMouseMove, onMouseLeave } =
    useFloatingTilt();

  return (
    <div className="mx-auto w-full max-w-4xl px-2 sm:px-4" style={{ perspective: "1200px" }}>
      <motion.div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)]"
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 30px 80px -20px rgba(15,23,42,0.35)",
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: glowBackground }}
        />

        <BrowserChrome />

        <div className="relative z-0 flex min-h-[360px] origin-top scale-[0.97]">
          <DashboardSidebar />

          <div className="flex-1 overflow-hidden p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] text-slate-500">आज · १ असार २०८३</p>
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  Good evening, Owner
                </h3>
              </div>
              <motion.span
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </motion.span>
            </div>

            <StatCards />

            <div className="mt-3 grid gap-3 lg:grid-cols-5">
              <SalesChart />
              <RecentInvoices />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
