import type { PaymentStatus } from "@/types/landing";

export type SaleChannel = "tax" | "personal";

/** Product line on a tax invoice — list vs deducted (sold) price + VAT */
export type TaxInvoiceProduct = {
  name: string;
  qty: number;
  listPriceNpr: number;
  deductedPriceNpr: number;
  vatNpr: number;
};

export type TaxInvoiceSale = {
  invoice: string;
  customer: string;
  type: "Tax Invoice" | "Abbreviated";
  status: PaymentStatus;
  products: TaxInvoiceProduct[];
  saleId?: string;
};

/** Walk-in / personal convenience — no VAT on any line */
export type PersonalSaleProduct = {
  name: string;
  qty: number;
  priceNpr: number;
};

export type PersonalSale = {
  id: string;
  buyer: string;
  time: string;
  status: PaymentStatus;
  products: PersonalSaleProduct[];
};
