export type NavLink = {
  label: string;
  href: string;
};

export type FeatureItem = {
  icon: "inventory" | "invoice" | "calendar" | "dues" | "credit-note" | "roles";
  title: string;
  description: string;
};

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export type NepalHighlight = {
  title: string;
  body: string;
};

export type HeroStat = {
  value: string;
  label: string;
};

export type DashboardNavItem = {
  label: string;
  active: boolean;
};

export type PaymentStatus = "Paid" | "Partial" | "Unpaid";

export type RecentSale = {
  invoice: string;
  customer: string;
  type: "Tax Invoice" | "Abbreviated";
  amount: string;
  status: PaymentStatus;
};

export type DashboardStatCard = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: string;
  trendUp: boolean;
};

export type CityDot = {
  id: string;
  name: string;
  cx: number;
  cy: number;
  delay: number;
};

export type NepalMapVariant = "default" | "background";
