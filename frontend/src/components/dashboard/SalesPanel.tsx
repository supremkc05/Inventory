import { PersonalSalesPanel } from "./PersonalSalesPanel";
import { TaxInvoicesPanel } from "./TaxInvoicesPanel";
import { PERSONAL_SALES, TAX_INVOICE_SALES } from "@/constants/dashboard";
import { cn } from "@/lib/cn";
import { EASE_OUT_EXPO } from "@/lib/motion";
import type {
  PersonalSale,
  SaleChannel,
  TaxInvoiceSale,
} from "@/types/dashboard";
import type { PaymentStatus } from "@/types/landing";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const CHANNELS: {
  id: SaleChannel;
  label: string;
  badge: string;
  description: string;
  cta: string;
}[] = [
  {
    id: "tax",
    label: "Tax invoices",
    badge: "13% VAT",
    description: "Business sales with deducted unit price and VAT broken out",
    cta: "New invoice",
  },
  {
    id: "personal",
    label: "Personal sales",
    badge: "No VAT",
    description:
      "Local walk-ins for personal use — price only, no tax on any item",
    cta: "New personal sale",
  },
];

type StatusFilter = PaymentStatus | "all";

type SalesPanelProps = {
  variant?: "card" | "page";
  search?: string;
  statusFilter?: StatusFilter;
  taxSales?: TaxInvoiceSale[];
  personalSales?: PersonalSale[];
  onCreate?: (channel: SaleChannel) => void;
  onChannelChange?: (channel: SaleChannel) => void;
};

export function SalesPanel({
  variant = "card",
  search = "",
  statusFilter = "all",
  taxSales: taxSalesProp,
  personalSales: personalSalesProp,
  onCreate,
  onChannelChange,
}: SalesPanelProps) {
  const [channel, setChannel] = useState<SaleChannel>("tax");
  const active = CHANNELS.find((c) => c.id === channel)!;
  const showCreate = variant === "page" && Boolean(onCreate);

  const sourceTax = taxSalesProp ?? TAX_INVOICE_SALES;
  const sourcePersonal = personalSalesProp ?? PERSONAL_SALES;

  const taxSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sourceTax.filter((sale) => {
      if (statusFilter !== "all" && sale.status !== statusFilter) return false;
      if (!q) return true;
      return (
        sale.invoice.toLowerCase().includes(q) ||
        sale.customer.toLowerCase().includes(q) ||
        sale.products.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [search, statusFilter, sourceTax]);

  const personalSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sourcePersonal.filter((sale) => {
      if (statusFilter !== "all" && sale.status !== statusFilter) return false;
      if (!q) return true;
      return (
        sale.id.toLowerCase().includes(q) ||
        sale.buyer.toLowerCase().includes(q) ||
        sale.products.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [search, statusFilter, sourcePersonal]);

  const isPage = variant === "page";

  const setChannelAndNotify = (next: SaleChannel) => {
    setChannel(next);
    onChannelChange?.(next);
  };

  return (
    <motion.section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        isPage
          ? "min-h-[28rem] max-h-[calc(100svh-16rem)] flex-1"
          : "max-h-[28rem] sm:max-h-[32rem]",
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, ease: EASE_OUT_EXPO }}
    >
      <div className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div
              className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
              role="tablist"
              aria-label="Sale type"
            >
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={channel === c.id}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                    channel === c.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                  onClick={() => setChannelAndNotify(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                  channel === "tax"
                    ? "bg-red-600/10 text-red-700"
                    : "bg-sky-600/10 text-sky-800",
                )}
              >
                {active.badge}
              </span>
              <p className="text-sm text-slate-500">{active.description}</p>
            </div>
          </div>

          {showCreate ? (
            <button
              type="button"
              onClick={() => onCreate?.(channel)}
              className={cn(
                "shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition",
                channel === "tax"
                  ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                  : "bg-sky-600 shadow-sky-600/15 hover:bg-sky-700",
              )}
            >
              {active.cta}
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {channel === "tax" ? (
          taxSales.length ? (
            <TaxInvoicesPanel sales={taxSales} />
          ) : (
            <EmptyState message="No tax invoices match your filters." />
          )
        ) : personalSales.length ? (
          <PersonalSalesPanel sales={personalSales} />
        ) : (
          <EmptyState message="No personal sales match your filters." />
        )}
      </div>
    </motion.section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}
