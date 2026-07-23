export type AppRole = "owner" | "admin" | "accountant";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  pan: string;
  address: string;
  dueBalanceNpr: number;
  isActive: boolean;
  hasTransactions: boolean;
  payments: CustomerPayment[];
  sales: CustomerSaleSummary[];
};

export type CustomerPayment = {
  id: string;
  amountNpr: number;
  notes: string;
  createdAt: string;
};

export type CustomerSaleSummary = {
  id: string;
  invoice: string;
  dateLabel: string;
  totalNpr: number;
  status: "Paid" | "Partial" | "Unpaid";
};

export type CustomerFormValues = {
  name: string;
  phone: string;
  pan: string;
  address: string;
};

export type DueFilter = "all" | "with_due" | "clear";

export function canManageCustomers(role: AppRole): boolean {
  return role === "owner" || role === "admin";
}
