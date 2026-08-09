import { apiFetch, type Paginated } from "@/lib/api";
import type { Product, ProductFormValues, StockAdjustReason } from "@/types/products";

export type ApiProduct = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  category: number | null;
  category_name?: string | null;
  cost_price: string;
  selling_price: string;
  reorder_level: string;
  vat_applicable: boolean;
  vat_rate: string;
  is_active: boolean;
  stock_quantity: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
};

function num(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  return Number(value);
}

function mediaPath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

export function mapProduct(api: ApiProduct): Product {
  return {
    id: String(api.id),
    name: api.name,
    category: api.category_name ?? "",
    categoryId: api.category != null ? String(api.category) : null,
    sku: api.sku,
    unit: api.unit,
    costPriceNpr: num(api.cost_price),
    sellingPriceNpr: num(api.selling_price),
    vatApplicable: api.vat_applicable,
    reorderLevel: num(api.reorder_level),
    stockQty: num(api.stock_quantity),
    isActive: api.is_active,
    hasTransactions: false,
    movements: [],
    imageUrl: mediaPath(api.image_url),
  };
}

function productPayload(values: ProductFormValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    unit: values.unit,
    cost_price: values.costPriceNpr || "0",
    selling_price: values.sellingPriceNpr,
    vat_applicable: values.vatApplicable,
    reorder_level: values.reorderLevel || "0",
    category: values.categoryId ? Number(values.categoryId) : null,
  };
}

function productFormData(values: ProductFormValues): FormData {
  const form = new FormData();
  const payload = productPayload(values);
  for (const [key, value] of Object.entries(payload)) {
    if (value == null) {
      form.append(key, "");
    } else {
      form.append(key, String(value));
    }
  }
  // Multipart BooleanField treats missing as False — force active on write paths
  // that still need a file (is_active is read-only on API; kept here as safety).
  form.append("is_active", "true");
  if (values.imageFile) {
    form.append("image", values.imageFile);
  } else if (values.clearImage) {
    form.append("clear_image", "true");
  }
  return form;
}

function needsMultipart(values: ProductFormValues): boolean {
  return Boolean(values.imageFile) || values.clearImage;
}

export async function listProducts(params?: {
  search?: string;
  is_active?: boolean;
  category?: string;
}): Promise<Product[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", "100");
  if (params?.search) qs.set("search", params.search);
  if (params?.is_active != null) qs.set("is_active", String(params.is_active));
  if (params?.category) qs.set("category", params.category);
  const data = await apiFetch<Paginated<ApiProduct>>(
    `/api/v1/products/?${qs.toString()}`,
  );
  return data.results.map(mapProduct);
}

export async function createProduct(
  values: ProductFormValues,
): Promise<Product> {
  const created = needsMultipart(values)
    ? await apiFetch<ApiProduct>("/api/v1/products/", {
        method: "POST",
        body: productFormData(values),
      })
    : await apiFetch<ApiProduct>("/api/v1/products/", {
        method: "POST",
        body: JSON.stringify(productPayload(values)),
      });

  const initial = Number(values.initialStock);
  if (initial > 0) {
    await adjustStock({
      productId: String(created.id),
      quantityDelta: initial,
      reason: "adjustment",
      notes: "Opening stock",
    });
    return mapProduct({
      ...created,
      stock_quantity: String(initial),
      is_active: true,
    });
  }
  return mapProduct({ ...created, is_active: true });
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<Product> {
  const updated = needsMultipart(values)
    ? await apiFetch<ApiProduct>(`/api/v1/products/${id}/`, {
        method: "PATCH",
        body: productFormData(values),
      })
    : await apiFetch<ApiProduct>(`/api/v1/products/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(productPayload(values)),
      });
  return mapProduct(updated);
}

export async function archiveProduct(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/products/${id}/`, { method: "DELETE" });
}

function mapAdjustReason(reason: StockAdjustReason): "adjustment" | "damage" {
  return reason === "damage" ? "damage" : "adjustment";
}

export async function adjustStock(input: {
  productId: string;
  quantityDelta: number;
  reason: StockAdjustReason;
  notes: string;
}): Promise<{ quantity: number }> {
  const data = await apiFetch<{ product_id: number; quantity: string }>(
    "/api/v1/stock/adjust/",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: Number(input.productId),
        quantity_delta: String(input.quantityDelta),
        reason: mapAdjustReason(input.reason),
        notes: input.notes,
      }),
    },
  );
  return { quantity: num(data.quantity) };
}
