import { StatusPill } from "@/components/landing/DashboardPreview/StatusPill";
import { formatNpr, PERSONAL_SALES } from "@/constants/dashboard";
import type { PersonalSale } from "@/types/dashboard";
import { motion } from "framer-motion";

function saleTotal(sale: PersonalSale) {
  return sale.products.reduce((sum, p) => sum + p.priceNpr * p.qty, 0);
}

type PersonalSalesPanelProps = {
  sales?: PersonalSale[];
};

export function PersonalSalesPanel({
  sales = PERSONAL_SALES,
}: PersonalSalesPanelProps) {
  return (
    <div className="space-y-4">
      {sales.map((sale, i) => (
        <motion.article
          key={sale.id}
          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.05 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{sale.id}</p>
              <p className="text-xs text-slate-500">
                {sale.buyer} · {sale.time}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={sale.status} className="text-xs" />
              <span className="text-sm font-semibold text-slate-900">
                {formatNpr(saleTotal(sale))}
              </span>
            </div>
          </div>

          <ul className="mt-3 space-y-2 border-t border-slate-200/80 pt-3">
            {sale.products.map((product) => (
              <li
                key={`${sale.id}-${product.name}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {product.name}
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      ×{product.qty}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-sky-700">
                    Tax-free · personal use
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatNpr(product.priceNpr * product.qty)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatNpr(product.priceNpr)} each
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.article>
      ))}
    </div>
  );
}
