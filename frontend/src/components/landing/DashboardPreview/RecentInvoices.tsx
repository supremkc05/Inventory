import { RECENT_SALES } from "@/constants/landing";
import { motion } from "framer-motion";
import { StatusPill } from "./StatusPill";

export function RecentInvoices() {
  return (
    <motion.div
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.55 }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
        <p className="text-xs font-semibold text-slate-900">Recent invoices</p>
        <span className="text-[9px] font-medium text-red-600">View all</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[380px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] uppercase tracking-wide text-slate-400">
              <th className="px-3 py-1.5 font-medium">Invoice</th>
              <th className="px-3 py-1.5 font-medium">Customer</th>
              <th className="px-3 py-1.5 font-medium">Type</th>
              <th className="px-3 py-1.5 font-medium">Amount</th>
              <th className="px-3 py-1.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_SALES.map((row, i) => (
              <motion.tr
                key={row.invoice}
                className="border-b border-slate-50 last:border-0"
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <td className="px-3 py-2 font-medium text-slate-800">{row.invoice}</td>
                <td className="px-3 py-2 text-slate-600">{row.customer}</td>
                <td className="px-3 py-2 text-slate-500">{row.type}</td>
                <td className="px-3 py-2 font-semibold text-slate-900">{row.amount}</td>
                <td className="px-3 py-2">
                  <StatusPill status={row.status} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
