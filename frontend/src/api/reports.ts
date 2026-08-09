import { apiFetch } from "@/lib/api";
import type { ReportPeriod, ReportSnapshot } from "@/types/reports";

type DailySales = {
  date: string;
  sale_count: number;
  subtotal: string;
  vat_total: string;
  grand_total: string;
  amount_paid: string;
  amount_due: string;
};

type VatSummary = {
  date_from: string;
  date_to: string;
  taxable_subtotal: string;
  exempt_subtotal: string;
  vat_total: string;
};

function startOfMonth(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Rough FY window in AD (Shrawan ~ mid-July). Good enough for UI period cards. */
function fiscalYearRange(d: Date): { from: string; to: string } {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based
  // If before mid-July, FY started previous calendar year July 16
  if (month < 6 || (month === 6 && d.getDate() < 16)) {
    return {
      from: `${year - 1}-07-16`,
      to: todayIso(),
    };
  }
  return { from: `${year}-07-16`, to: todayIso() };
}

export async function fetchReportSnapshot(
  period: ReportPeriod,
): Promise<ReportSnapshot> {
  const today = todayIso();
  let date_from = today;
  let date_to = today;

  if (period === "month") {
    date_from = startOfMonth(new Date());
  } else if (period === "fy") {
    const range = fiscalYearRange(new Date());
    date_from = range.from;
    date_to = range.to;
  }

  if (period === "today") {
    const daily = await apiFetch<DailySales>(
      `/api/v1/reports/daily-sales/?date=${today}`,
    );
    return {
      // Sales cards are ex-VAT; VAT is shown separately.
      salesTotalNpr: Number(daily.subtotal),
      invoiceCount: daily.sale_count,
      vatCollectedNpr: Number(daily.vat_total),
      duesOutstandingNpr: Number(daily.amount_due),
      personalSalesNpr: 0,
    };
  }

  const [vat, dailyToday] = await Promise.all([
    apiFetch<VatSummary>(
      `/api/v1/reports/vat-summary/?date_from=${date_from}&date_to=${date_to}`,
    ),
    apiFetch<DailySales>(`/api/v1/reports/daily-sales/?date=${today}`),
  ]);

  const taxable = Number(vat.taxable_subtotal);
  const exempt = Number(vat.exempt_subtotal);
  const vatTotal = Number(vat.vat_total);

  return {
    salesTotalNpr: taxable + exempt + vatTotal,
    invoiceCount: dailyToday.sale_count, // approximate for non-today; OK for MVP card
    vatCollectedNpr: vatTotal,
    duesOutstandingNpr: Number(dailyToday.amount_due),
    personalSalesNpr: exempt,
  };
}
