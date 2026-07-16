import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SalesPanel } from "@/components/dashboard/SalesPanel";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";

/**
 * Shop owner home — toggle between tax invoices and personal no-VAT sales.
 */
export default function DashboardPage() {
  return (
    <DashboardShell title="Good evening, Owner" subtitle="आज · १ असार २०८३">
      <StatGrid />
      <SalesPanel />
      <WeeklyChart />
    </DashboardShell>
  );
}
