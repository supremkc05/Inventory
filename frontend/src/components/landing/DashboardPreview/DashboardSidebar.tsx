import { DASHBOARD_NAV, SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import { motion } from "framer-motion";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-40 shrink-0 border-r border-slate-200 bg-slate-50/80 p-3 md:block">
      <div className="mb-4 flex items-center gap-2">
        <img
          src={logo}
          alt={SITE.name}
          className="h-7 w-7 rounded-md object-contain"
        />
        <div>
          <p className="text-xs font-semibold text-slate-900">{SITE.name}</p>
          <p className="text-[9px] text-slate-500">{SITE.demoStore}</p>
        </div>
      </div>

      <nav className="space-y-0.5" aria-label="Dashboard navigation">
        {DASHBOARD_NAV.map((item, i) => (
          <motion.div
            key={item.label}
            className={
              item.active
                ? "rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm"
                : "rounded-md px-2.5 py-1.5 text-xs text-slate-600"
            }
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            {item.label}
          </motion.div>
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Fiscal year
        </p>
        <p className="mt-0.5 text-xs font-bold text-slate-900">{SITE.fiscalYear}</p>
        <p className="text-[9px] text-slate-500">Shrawan – Ashad</p>
      </div>
    </aside>
  );
}
