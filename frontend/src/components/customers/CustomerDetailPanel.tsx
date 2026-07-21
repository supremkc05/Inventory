import { formatNpr } from "@/lib/vat";
import type { Customer } from "@/types/customers";

type CustomerDetailPanelProps = {
  customer: Customer | null;
};

export function CustomerDetailPanel({ customer }: CustomerDetailPanelProps) {
  if (!customer) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Sale history</p>
        <p className="mt-1 text-sm text-slate-500">
          Select a customer to see invoices and payments.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {customer.name}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Due {formatNpr(customer.dueBalanceNpr)}
          {customer.pan ? ` · PAN ${customer.pan}` : ""}
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent sales
          </p>
          {customer.sales.length ? (
            <ul className="mt-2 space-y-2">
              {customer.sales.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {s.invoice}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.dateLabel} · {s.status}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {formatNpr(s.totalNpr)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No sales yet.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payments
          </p>
          {customer.payments.length ? (
            <ul className="mt-2 space-y-2">
              {customer.payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-emerald-700">
                      −{formatNpr(p.amountNpr)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.notes || "Payment"} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("en-NP")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No payments recorded.</p>
          )}
        </div>
      </div>
    </section>
  );
}
