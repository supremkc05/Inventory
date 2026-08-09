import { apiFetch, type Paginated } from "@/lib/api";
import type { PaymentStatus } from "@/types/landing";
import type {
  PersonalSale,
  PersonalSaleProduct,
  TaxInvoiceProduct,
  TaxInvoiceSale,
} from "@/types/dashboard";

export type ApiSaleItem = {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: string;
  unit_price: string;
  vat_applicable: boolean;
  vat_rate: string;
  line_subtotal: string;
  line_vat: string;
  line_total: string;
};

export type ApiSale = {
  id: number;
  customer: number | null;
  bill_type: "tax_invoice" | "abbreviated";
  status: string;
  fiscal_year: string;
  invoice_number: number;
  date_ad: string;
  date_bs: string;
  subtotal: string;
  vat_total: string;
  grand_total: string;
  amount_paid: string;
  amount_due: string;
  notes: string;
  items: ApiSaleItem[];
  created_at: string;
};

function paymentStatus(sale: ApiSale): PaymentStatus {
  const due = Number(sale.amount_due);
  const paid = Number(sale.amount_paid);
  if (due <= 0) return "Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
}

export function mapTaxSale(sale: ApiSale, customerName = ""): TaxInvoiceSale {
  const products: TaxInvoiceProduct[] = sale.items.map((item) => ({
    name: item.product_name,
    qty: Number(item.quantity),
    listPriceNpr: Number(item.unit_price),
    deductedPriceNpr: Number(item.unit_price),
    vatNpr: Number(item.line_vat),
  }));
  return {
    invoice: `${sale.fiscal_year}-${sale.invoice_number}`,
    customer: customerName || (sale.customer ? `#${sale.customer}` : "Walk-in"),
    type: sale.bill_type === "tax_invoice" ? "Tax Invoice" : "Abbreviated",
    status: paymentStatus(sale),
    products,
    saleId: String(sale.id),
  };
}

export function mapPersonalSale(sale: ApiSale): PersonalSale {
  const products: PersonalSaleProduct[] = sale.items.map((item) => ({
    name: item.product_name,
    qty: Number(item.quantity),
    priceNpr: Number(item.unit_price),
  }));
  return {
    id: String(sale.id),
    buyer: sale.notes || "Walk-in",
    time: sale.date_ad,
    status: paymentStatus(sale),
    products,
  };
}

export async function listSales(params?: {
  bill_type?: "tax_invoice" | "abbreviated";
  payment_status?: string;
}): Promise<ApiSale[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", "100");
  if (params?.bill_type) qs.set("bill_type", params.bill_type);
  if (params?.payment_status) qs.set("payment_status", params.payment_status);
  const data = await apiFetch<Paginated<ApiSale>>(
    `/api/v1/sales/?${qs.toString()}`,
  );
  return data.results;
}

export type CreateSaleLine = {
  product_id: number;
  quantity: string;
  unit_price?: string;
};

export type CreateSalePayload = {
  bill_type: "tax_invoice" | "abbreviated";
  customer_id?: number | null;
  lines: CreateSaleLine[];
  amount_paid?: string;
  notes?: string;
  date_ad?: string;
};

export async function createSale(
  payload: CreateSalePayload,
  idempotencyKey: string,
): Promise<ApiSale> {
  return apiFetch<ApiSale>("/api/v1/sales/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export async function createPayment(input: {
  saleId: string;
  amount: string;
  method?: "cash" | "bank" | "other";
  notes?: string;
  paidOnAd?: string;
}): Promise<unknown> {
  const paid_on_ad =
    input.paidOnAd ?? new Date().toISOString().slice(0, 10);
  return apiFetch("/api/v1/payments/", {
    method: "POST",
    body: JSON.stringify({
      sale_id: Number(input.saleId),
      amount: input.amount,
      method: input.method ?? "cash",
      paid_on_ad,
      notes: input.notes ?? "",
    }),
  });
}

export async function findUnpaidSaleForCustomer(
  customerId: string,
): Promise<ApiSale | null> {
  const qs = new URLSearchParams({
    customer: customerId,
    page_size: "50",
  });
  const data = await apiFetch<Paginated<ApiSale>>(
    `/api/v1/sales/?${qs.toString()}`,
  );
  return (
    data.results.find((s) => Number(s.amount_due) > 0) ?? null
  );
}
