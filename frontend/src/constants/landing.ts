import type {
  CityDot,
  DashboardNavItem,
  DashboardStatCard,
  FeatureItem,
  HeroStat,
  HowItWorksStep,
  NavLink,
  NepalHighlight,
  RecentSale,
} from "@/types/landing";

export const SITE = {
  name: "DokanDaftar",
  tagline: "Shop Records for Nepal",
  url: "app.dokandaftar.com",
  demoStore: "Shree Kirana Store",
  fiscalYear: "2082/83",
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Product", href: "#dashboard" },
  { label: "Features", href: "#features" },
  { label: "Nepal-first", href: "#nepal" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export const HERO_STATS: HeroStat[] = [
  { value: "13%", label: "VAT compliant" },
  { value: "BS/AD", label: "Dual calendar" },
  { value: "IRD", label: "Invoice ready" },
];

export const FEATURES: FeatureItem[] = [
  {
    icon: "inventory",
    title: "Inventory tracking",
    description:
      "Real-time stock with an audit ledger. Every sale, return, and adjustment is logged and no silent overwrites.",
  },
  {
    icon: "invoice",
    title: "IRD VAT invoices",
    description:
      "Tax Invoices and Abbreviated Bills with 13% VAT, PAN validation, and fiscal-year numbering that resets on Ashad 31.",
  },
  {
    icon: "calendar",
    title: "Nepali fiscal year",
    description:
      "Shrawan to Ashad built in. Bikram Sambat dates on every transaction, reports scoped to the Nepali FY.",
  },
  {
    icon: "dues",
    title: "Customer dues (udhaaro)",
    description:
      "Track who owes what. Partial payments, due balances, and reminders when you're ready to automate.",
  },
  {
    icon: "credit-note",
    title: "Credit notes",
    description:
      "Full credit-note documents with their own number series and stock restored, customer balance adjusted.",
  },
  {
    icon: "roles",
    title: "Multi-tenant & roles",
    description:
      "One platform, many shops. Owner, admin, and accountant roles with permissions that match how you work.",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Set up your business",
    description:
      "Add your PAN, default VAT rate, and invite your team with the right roles.",
  },
  {
    step: "02",
    title: "Add products & stock",
    description:
      "Import your catalog with SKUs, prices, and VAT flags. Stock updates automatically on every sale.",
  },
  {
    step: "03",
    title: "Bill & track",
    description:
      "Create Tax Invoices or Abbreviated Bills, record payments, and watch your daily sales dashboard grow.",
  },
];

export const NEPAL_HIGHLIGHTS: NepalHighlight[] = [
  {
    title: "Bikram Sambat everywhere",
    body: "Every bill stores both AD and BS dates. Reports and invoice numbers follow Nepal's fiscal year — not a foreign calendar forced onto your business.",
  },
  {
    title: "From Kathmandu to Dhangadhi",
    body: "Whether you run a pharmacy in Pokhara or a distributor in Biratnagar, DokanDaftar speaks your language of PAN, VAT, and udhaaro.",
  },
  {
    title: "Compliance without complexity",
    body: "Tax Invoice when your customer has a PAN. Abbreviated Bill for walk-in retail. Credit notes with their own series. No discounts, no guesswork.",
  },
];

/** District center points from nepal-district-map viewBox (0 0 1200 800). */
export const CITY_DOTS: CityDot[] = [
  { id: "ktm", name: "Kathmandu", cx: 783, cy: 524, delay: 0.3 },
  { id: "pkr", name: "Pokhara", cx: 592, cy: 418, delay: 0.5 },
  { id: "bir", name: "Biratnagar", cx: 1080, cy: 700, delay: 0.7 },
  { id: "bhw", name: "Bhairahawa", cx: 511, cy: 540, delay: 0.9 },
  { id: "dhn", name: "Dhangadhi", cx: 158, cy: 339, delay: 1.1 },
  { id: "npg", name: "Nepalgunj", cx: 287, cy: 449, delay: 1.3 },
  { id: "bhr", name: "Bharatpur", cx: 639, cy: 536, delay: 1.5 },
];

export const NEPAL_MAP_VIEWBOX = "0 0 1200 800";

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Dashboard", active: true },
  { label: "Sales", active: false },
  { label: "Products", active: false },
  { label: "Customers", active: false },
  { label: "Reports", active: false },
];

export const DASHBOARD_STATS: DashboardStatCard[] = [
  {
    label: "Today's sales",
    value: 48250,
    prefix: "रु ",
    trend: "+12%",
    trendUp: true,
  },
  {
    label: "VAT collected",
    value: 5550,
    prefix: "रु ",
    trend: "13% rate",
    trendUp: true,
  },
  {
    label: "Low stock",
    value: 7,
    suffix: " items",
    trend: "Alert",
    trendUp: false,
  },
  {
    label: "Customer dues",
    value: 124800,
    prefix: "रु ",
    trend: "Udhaaro",
    trendUp: false,
  },
];

export const RECENT_SALES: RecentSale[] = [
  {
    invoice: "2082/83-0042",
    customer: "Himalayan Traders",
    type: "Tax Invoice",
    amount: "रु 12,450",
    status: "Paid",
  },
  {
    invoice: "2082/83-0041",
    customer: "Walk-in",
    type: "Abbreviated",
    amount: "रु 850",
    status: "Paid",
  },
  {
    invoice: "2082/83-0040",
    customer: "Pokhara Pharma",
    type: "Tax Invoice",
    amount: "रु 28,700",
    status: "Partial",
  },
  {
    invoice: "2082/83-0039",
    customer: "Lalitpur Kirana",
    type: "Tax Invoice",
    amount: "रु 6,250",
    status: "Unpaid",
  },
];

export const CHART_BARS = [42, 58, 45, 72, 65, 88, 76] as const;
export const CHART_DAYS = ["आ", "सो", "मं", "बु", "बि", "शु", "श"] as const;
