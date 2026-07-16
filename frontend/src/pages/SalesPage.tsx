import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NewSaleOverlay } from "@/components/dashboard/NewSaleOverlay";
import { SalesPanel } from "@/components/dashboard/SalesPanel";
import { PERSONAL_SALES, TAX_INVOICE_SALES } from "@/constants/dashboard";
import type {
  PersonalSale,
  SaleChannel,
  TaxInvoiceSale,
} from "@/types/dashboard";
import type { PaymentStatus } from "@/types/landing";
import { useState } from "react";

const STATUS_OPTIONS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "Paid", label: "Paid" },
  { value: "Partial", label: "Partial" },
  { value: "Unpaid", label: "Unpaid" },
];

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [channel, setChannel] = useState<SaleChannel>("tax");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [taxSales, setTaxSales] = useState<TaxInvoiceSale[]>(TAX_INVOICE_SALES);
  const [personalSales, setPersonalSales] =
    useState<PersonalSale[]>(PERSONAL_SALES);

  return (
    <DashboardShell
      title="Sales"
      subtitle="Tax invoices and personal convenience sales"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search sales</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, customer, or product…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4"
          />
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PaymentStatus | "all")
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 focus:border-red-300 focus:ring-4"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SalesPanel
        variant="page"
        search={search}
        statusFilter={statusFilter}
        taxSales={taxSales}
        personalSales={personalSales}
        onChannelChange={setChannel}
        onCreate={(next) => {
          setChannel(next);
          setOverlayOpen(true);
        }}
      />

      <NewSaleOverlay
        open={overlayOpen}
        channel={channel}
        onClose={() => setOverlayOpen(false)}
        onSaveTax={(sale) => setTaxSales((prev) => [sale, ...prev])}
        onSavePersonal={(sale) => setPersonalSales((prev) => [sale, ...prev])}
      />
    </DashboardShell>
  );
}
