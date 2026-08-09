import { apiFetch, type Paginated } from "@/lib/api";
import type { Customer, CustomerFormValues } from "@/types/customers";

export type ApiCustomer = {
  id: number;
  name: string;
  phone: string;
  pan_vat_number: string;
  address: string;
  current_due_balance: string;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
};

export function mapCustomer(api: ApiCustomer): Customer {
  return {
    id: String(api.id),
    name: api.name,
    phone: api.phone,
    pan: api.pan_vat_number,
    address: api.address,
    dueBalanceNpr: Number(api.current_due_balance),
    isActive: api.is_active,
    hasTransactions: Number(api.current_due_balance) !== 0,
    payments: [],
    sales: [],
  };
}

export async function listCustomers(params?: {
  search?: string;
  has_due?: boolean;
  is_active?: boolean;
}): Promise<Customer[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", "100");
  if (params?.search) qs.set("search", params.search);
  if (params?.has_due != null) qs.set("has_due", String(params.has_due));
  qs.set("is_active", String(params?.is_active ?? true));
  const data = await apiFetch<Paginated<ApiCustomer>>(
    `/api/v1/customers/?${qs.toString()}`,
  );
  return data.results.map(mapCustomer);
}

export async function createCustomer(
  values: CustomerFormValues,
): Promise<Customer> {
  const created = await apiFetch<ApiCustomer>("/api/v1/customers/", {
    method: "POST",
    body: JSON.stringify({
      name: values.name.trim(),
      phone: values.phone.trim(),
      pan_vat_number: values.pan.trim(),
      address: values.address.trim(),
    }),
  });
  return mapCustomer(created);
}

export async function updateCustomer(
  id: string,
  values: CustomerFormValues,
): Promise<Customer> {
  const updated = await apiFetch<ApiCustomer>(`/api/v1/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      name: values.name.trim(),
      phone: values.phone.trim(),
      pan_vat_number: values.pan.trim(),
      address: values.address.trim(),
    }),
  });
  return mapCustomer(updated);
}

export async function archiveCustomer(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/customers/${id}/`, { method: "DELETE" });
}
