import { apiFetch, type Paginated } from "@/lib/api";

export type ApiCategory = {
  id: number;
  name: string;
  parent: number | null;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  isActive: boolean;
  productCount: number;
};

export function mapCategory(api: ApiCategory): Category {
  return {
    id: String(api.id),
    name: api.name,
    isActive: api.is_active,
    productCount: api.product_count ?? 0,
  };
}

export async function listCategories(params?: {
  is_active?: boolean;
  search?: string;
}): Promise<Category[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", "100");
  if (params?.is_active != null) qs.set("is_active", String(params.is_active));
  if (params?.search) qs.set("search", params.search);
  const data = await apiFetch<Paginated<ApiCategory>>(
    `/api/v1/categories/?${qs.toString()}`,
  );
  return data.results.map(mapCategory);
}

export async function createCategory(name: string): Promise<Category> {
  const created = await apiFetch<ApiCategory>("/api/v1/categories/", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() }),
  });
  return mapCategory(created);
}

export async function updateCategory(
  id: string,
  values: { name?: string; is_active?: boolean },
): Promise<Category> {
  const updated = await apiFetch<ApiCategory>(`/api/v1/categories/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
  return mapCategory(updated);
}

export async function archiveCategory(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/categories/${id}/`, { method: "DELETE" });
}
