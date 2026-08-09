import { createCustomer, listCustomers } from "@/api/customers";
import { listProducts } from "@/api/products";
import {
  createPayment,
  createSale,
  listSales,
  mapPersonalSale,
  mapTaxSale,
} from "@/api/sales";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NewSaleOverlay,
  type NewSaleSubmitPayload,
} from "@/components/dashboard/NewSaleOverlay";
import { SalesPanel } from "@/components/dashboard/SalesPanel";
import { ApiError } from "@/lib/api";
import type {
  PersonalSale,
  SaleChannel,
  TaxInvoiceSale,
} from "@/types/dashboard";
import type { PaymentStatus } from "@/types/landing";
import type { Product } from "@/types/products";
import { useCallback, useEffect, useState } from "react";

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
  const [taxSales, setTaxSales] = useState<TaxInvoiceSale[]>([]);
  const [personalSales, setPersonalSales] = useState<PersonalSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const [sales, productRows, customerRows] = await Promise.all([
        listSales(),
        listProducts({ is_active: true }),
        listCustomers(),
      ]);
      setProducts(productRows);
      const nameById = new Map(
        customerRows.map((c) => [Number(c.id), c.name] as const),
      );

      const tax: TaxInvoiceSale[] = [];
      const personal: PersonalSale[] = [];
      for (const sale of sales) {
        if (sale.bill_type === "tax_invoice") {
          tax.push(
            mapTaxSale(
              sale,
              sale.customer ? nameById.get(sale.customer) : undefined,
            ),
          );
        } else {
          // Abbreviated: show under personal if no customer, else tax panel as Abbreviated
          if (sale.customer) {
            tax.push(
              mapTaxSale(sale, nameById.get(sale.customer) ?? undefined),
            );
          } else {
            personal.push(mapPersonalSale(sale));
          }
        }
      }
      setTaxSales(tax);
      setPersonalSales(personal);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Could not load sales. Is the API running?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreateSale = async (payload: NewSaleSubmitPayload) => {
    const key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      let customerId: number | null = null;
      if (payload.customerName) {
        const existing = (await listCustomers({ search: payload.customerName })).find(
          (c) =>
            c.name.trim().toLowerCase() === payload.customerName.toLowerCase(),
        );
        if (existing) {
          customerId = Number(existing.id);
        } else {
          const created = await createCustomer({
            name: payload.customerName,
            phone: "",
            pan: "",
            address: "",
          });
          customerId = Number(created.id);
        }
      }

      const sale = await createSale(
        {
          bill_type: payload.billType,
          customer_id: customerId,
          lines: payload.lines,
          notes: payload.notes,
          amount_paid: "0",
        },
        key,
      );
      if (payload.paidInFull && Number(sale.grand_total) > 0) {
        await createPayment({
          saleId: String(sale.id),
          amount: sale.grand_total,
        });
      }
      await refresh();
    } catch (err) {
      throw err instanceof ApiError ? err : new Error("Could not create sale.");
    }
  };

  return (
    <DashboardShell
      title="Sales"
      subtitle="Tax invoices and personal convenience sales"
    >
      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setLoading(true);
              void refresh();
            }}
          >
            Retry
          </button>
        </p>
      ) : null}

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

      {loading ? (
        <p className="text-sm text-slate-500">Loading sales…</p>
      ) : (
        <SalesPanel
          variant="page"
          search={search}
          statusFilter={statusFilter}
          taxSales={taxSales}
          personalSales={personalSales}
          onChannelChange={setChannel}
          onCreate={(next) => {
            setChannel(next);
            void (async () => {
              try {
                const rows = await listProducts({ is_active: true });
                setProducts(rows);
              } catch {
                // keep existing list if refresh fails
              } finally {
                setOverlayOpen(true);
              }
            })();
          }}
        />
      )}

      <NewSaleOverlay
        open={overlayOpen}
        channel={channel}
        products={products}
        onClose={() => setOverlayOpen(false)}
        onSubmit={handleCreateSale}
      />
    </DashboardShell>
  );
}
