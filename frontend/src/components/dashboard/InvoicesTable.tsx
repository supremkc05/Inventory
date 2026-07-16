import { StatusPill } from "@/components/landing/DashboardPreview/StatusPill";
import { RECENT_SALES } from "@/constants/landing";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";

export function InvoicesTable() {
  return (
    <motion.section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, ease: EASE_OUT_EXPO }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent invoices
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Latest tax & abbreviated bills</p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-red-600 transition hover:text-red-700"
        >
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Invoice</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_SALES.map((row, i) => (
              <motion.tr
                key={row.invoice}
                className="border-b border-slate-50 last:border-0"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
              >
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  {row.invoice}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{row.customer}</td>
                <td className="px-5 py-3.5 text-slate-500">{row.type}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {row.amount}
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={row.status} className="text-xs" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
