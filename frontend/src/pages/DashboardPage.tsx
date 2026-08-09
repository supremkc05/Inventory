import { listCustomers } from "@/api/customers";
import { listProducts } from "@/api/products";
import {
  listSales,
  mapPersonalSale,
  mapTaxSale,
} from "@/api/sales";
import { fetchReportSnapshot } from "@/api/reports";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SalesPanel } from "@/components/dashboard/SalesPanel";
import {
  StatGrid,
  type DashboardLiveStats,
} from "@/components/dashboard/StatGrid";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { getStoredUser } from "@/lib/authStorage";
import { isLowStock } from "@/types/products";
import type {
  PersonalSale,
  TaxInvoiceSale,
} from "@/types/dashboard";
import { useEffect, useState } from "react";

const EMPTY_STATS: DashboardLiveStats = {
  todaySalesNpr: 0,
  vatCollectedNpr: 0,
  personalSalesNpr: 0,
  lowStockCount: 0,
};

/**
 * Shop owner home — live sales + period stats.
 */
export default function DashboardPage() {
  const user = getStoredUser();
  const greeting = user?.full_name
    ? `Hello, ${user.full_name.split(" ")[0]}`
    : "Dashboard";

  const [taxSales, setTaxSales] = useState<TaxInvoiceSale[]>([]);
  const [personalSales, setPersonalSales] = useState<PersonalSale[]>([]);
  const [stats, setStats] = useState<DashboardLiveStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [sales, customers, products, snap] = await Promise.all([
          listSales(),
          listCustomers(),
          listProducts({ is_active: true }),
          fetchReportSnapshot("today"),
        ]);
        if (cancelled) return;

        const nameById = new Map(
          customers.map((c) => [Number(c.id), c.name] as const),
        );
        const tax: TaxInvoiceSale[] = [];
        const personal: PersonalSale[] = [];
        let personalToday = 0;

        for (const sale of sales) {
          const isPersonal =
            sale.bill_type === "abbreviated" && !sale.customer;
          if (isPersonal) {
            personal.push(mapPersonalSale(sale));
            if (sale.date_ad === today) {
              // Ex-VAT (subtotal), not grand_total.
              personalToday += Number(sale.subtotal);
            }
          } else {
            tax.push(
              mapTaxSale(
                sale,
                sale.customer ? nameById.get(sale.customer) : undefined,
              ),
            );
          }
        }

        setTaxSales(tax.slice(0, 20));
        setPersonalSales(personal.slice(0, 20));
        setStats({
          todaySalesNpr: snap.salesTotalNpr,
          vatCollectedNpr: snap.vatCollectedNpr,
          personalSalesNpr: personalToday,
          lowStockCount: products.filter(isLowStock).length,
        });
      } catch {
        if (!cancelled) setStats(EMPTY_STATS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell title={greeting} subtitle="Live shop overview">
      <StatGrid stats={stats} loading={loading} />
      <SalesPanel taxSales={taxSales} personalSales={personalSales} />
      <WeeklyChart />
    </DashboardShell>
  );
}
