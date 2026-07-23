export type ReportPeriod = "today" | "month" | "fy";

export type ReportSnapshot = {
  salesTotalNpr: number;
  invoiceCount: number;
  vatCollectedNpr: number;
  duesOutstandingNpr: number;
  personalSalesNpr: number;
};
