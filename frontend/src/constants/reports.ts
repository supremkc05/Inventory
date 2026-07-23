export type ReportPeriod = "today" | "month" | "fy";

export type ReportSnapshot = {
  salesTotalNpr: number;
  invoiceCount: number;
  vatCollectedNpr: number;
  duesOutstandingNpr: number;
  personalSalesNpr: number;
};

export const REPORT_BY_PERIOD: Record<ReportPeriod, ReportSnapshot> = {
  today: {
    salesTotalNpr: 48200,
    invoiceCount: 7,
    vatCollectedNpr: 4210,
    duesOutstandingNpr: 22700,
    personalSalesNpr: 3400,
  },
  month: {
    salesTotalNpr: 612400,
    invoiceCount: 94,
    vatCollectedNpr: 54880,
    duesOutstandingNpr: 22700,
    personalSalesNpr: 41200,
  },
  fy: {
    salesTotalNpr: 4_850_000,
    invoiceCount: 812,
    vatCollectedNpr: 428600,
    duesOutstandingNpr: 22700,
    personalSalesNpr: 186500,
  },
};

export const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "month", label: "This month" },
  { value: "fy", label: "This fiscal year" },
];
