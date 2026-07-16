import { StatusPill } from "@/components/landing/DashboardPreview/StatusPill";
import { formatNpr, TAX_INVOICE_SALES } from "@/constants/dashboard";
import type { TaxInvoiceSale } from "@/types/dashboard";
import { motion } from "framer-motion";

function invoiceTotal(sale: TaxInvoiceSale) {
  return sale.products.reduce(
    (sum, p) => sum + p.deductedPriceNpr * p.qty + p.vatNpr * p.qty,
    0,
  );
}

type TaxInvoicesPanelProps = {
  sales?: TaxInvoiceSale[];
};

export function TaxInvoicesPanel({
  sales = TAX_INVOICE_SALES,
}: TaxInvoicesPanelProps) {
  return (
    <div className="space-y-4">
      {sales.map((sale, i) => (
        <motion.article
          key={sale.invoice}
          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.05 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {sale.invoice}
              </p>
              <p className="text-xs text-slate-500">
                {sale.customer} · {sale.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={sale.status} className="text-xs" />
              <span className="text-sm font-semibold text-slate-900">
                {formatNpr(invoiceTotal(sale))}
              </span>
            </div>
          </div>

          <ul className="mt-3 space-y-2.5 border-t border-slate-200/80 pt-3">
            {sale.products.map((product) => {
              const saved =
                (product.listPriceNpr - product.deductedPriceNpr) * product.qty;
              return (
                <li
                  key={`${sale.invoice}-${product.name}`}
                  className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <p className="text-sm font-medium text-slate-800">
                      {product.name}
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        ×{product.qty}
                      </span>
                    </p>
                    {saved > 0 ? (
                      <span className="text-[11px] font-semibold text-emerald-600">
                        −{formatNpr(saved)} deducted
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      List{" "}
                      <span className="text-slate-400 line-through">
                        {formatNpr(product.listPriceNpr)}
                      </span>
                    </span>
                    <span>
                      Sold{" "}
                      <span className="font-semibold text-slate-800">
                        {formatNpr(product.deductedPriceNpr)}
                      </span>
                    </span>
                    <span>
                      VAT{" "}
                      <span className="font-semibold text-red-600">
                        {formatNpr(product.vatNpr)}
                      </span>
                      <span className="text-slate-400"> /unit</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.article>
      ))}
    </div>
  );
}
