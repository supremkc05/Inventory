import type { Customer } from "@/types/customers";

export const MOCK_APP_ROLE = "owner" as const;

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "cus-001",
    name: "Himalayan Traders",
    phone: "9841234567",
    pan: "301234567",
    address: "Thamel, Kathmandu",
    dueBalanceNpr: 18500,
    isActive: true,
    hasTransactions: true,
    payments: [
      {
        id: "pay-001",
        amountNpr: 5000,
        notes: "Partial cash",
        createdAt: "2026-07-10T10:00:00.000Z",
      },
    ],
    sales: [
      {
        id: "sale-t1",
        invoice: "INV-2083-0142",
        dateLabel: "१ असार",
        totalNpr: 24500,
        status: "Partial",
      },
      {
        id: "sale-t2",
        invoice: "INV-2083-0118",
        dateLabel: "२५ जेठ",
        totalNpr: 12000,
        status: "Paid",
      },
    ],
  },
  {
    id: "cus-002",
    name: "Pokhara Pharma",
    phone: "9856023344",
    pan: "601987654",
    address: "Lakeside, Pokhara",
    dueBalanceNpr: 0,
    isActive: true,
    hasTransactions: true,
    payments: [],
    sales: [
      {
        id: "sale-p1",
        invoice: "INV-2083-0139",
        dateLabel: "३० जेठ",
        totalNpr: 8900,
        status: "Paid",
      },
    ],
  },
  {
    id: "cus-003",
    name: "Lalitpur Kirana",
    phone: "9811122233",
    pan: "",
    address: "Patan Durbar Square",
    dueBalanceNpr: 4200,
    isActive: true,
    hasTransactions: true,
    payments: [],
    sales: [
      {
        id: "sale-l1",
        invoice: "ABB-2083-0088",
        dateLabel: "२८ जेठ",
        totalNpr: 4200,
        status: "Unpaid",
      },
    ],
  },
  {
    id: "cus-004",
    name: "Walk-in (cash)",
    phone: "",
    pan: "",
    address: "",
    dueBalanceNpr: 0,
    isActive: true,
    hasTransactions: false,
    payments: [],
    sales: [],
  },
  {
    id: "cus-005",
    name: "Old Supplier Contact",
    phone: "9800001111",
    pan: "123456789",
    address: "Biratnagar",
    dueBalanceNpr: 0,
    isActive: false,
    hasTransactions: true,
    payments: [],
    sales: [],
  },
];
