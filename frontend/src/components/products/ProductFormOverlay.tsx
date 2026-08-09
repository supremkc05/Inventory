import { PRODUCT_UNITS } from "@/constants/products";
import { cn } from "@/lib/cn";
import type { Category } from "@/api/categories";
import type { Product, ProductFormValues } from "@/types/products";
import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type ProductFormOverlayProps = {
  open: boolean;
  mode: "create" | "edit";
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (
    values: ProductFormValues,
    editingId?: string,
  ) => void | Promise<void>;
  onCreateCategory: (name: string) => Promise<Category>;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-red-600/20 placeholder:text-slate-400 focus:border-red-300 focus:ring-4";

const NEW_CATEGORY = "__new__";

function emptyForm(): ProductFormValues {
  return {
    name: "",
    categoryId: "",
    sku: "",
    unit: "pcs",
    costPriceNpr: "",
    sellingPriceNpr: "",
    vatApplicable: true,
    reorderLevel: "10",
    initialStock: "0",
    imageFile: null,
    clearImage: false,
    existingImageUrl: null,
  };
}

function fromProduct(product: Product): ProductFormValues {
  return {
    name: product.name,
    categoryId: product.categoryId ?? "",
    sku: product.sku,
    unit: product.unit,
    costPriceNpr: String(product.costPriceNpr),
    sellingPriceNpr: String(product.sellingPriceNpr),
    vatApplicable: product.vatApplicable,
    reorderLevel: String(product.reorderLevel),
    initialStock: "0",
    imageFile: null,
    clearImage: false,
    existingImageUrl: product.imageUrl,
  };
}

export function ProductFormOverlay({
  open,
  mode,
  product,
  categories,
  onClose,
  onSave,
  onCreateCategory,
}: ProductFormOverlayProps) {
  const titleId = useId();
  const isCreate = mode === "create";
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [categoryMode, setCategoryMode] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = product ? fromProduct(product) : emptyForm();
    setValues(next);
    setCategoryMode(next.categoryId || "");
    setNewCategoryName("");
    setPreviewUrl(null);
    setError(null);
    setSaving(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, product, onClose]);

  useEffect(() => {
    if (!values.imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(values.imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [values.imageFile]);

  if (!open) return null;

  const update = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const shownImage =
    previewUrl ||
    (!values.clearImage ? values.existingImageUrl : null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!values.sku.trim()) {
      setError("SKU is required.");
      return;
    }
    const cost = Number(values.costPriceNpr);
    const sale = Number(values.sellingPriceNpr);
    const reorder = Number(values.reorderLevel);
    if (values.sellingPriceNpr.trim() === "" || !Number.isFinite(sale) || sale < 0) {
      setError("Enter a valid sale price.");
      return;
    }
    if (
      values.costPriceNpr.trim() !== "" &&
      (!Number.isFinite(cost) || cost < 0)
    ) {
      setError("Enter a valid cost price.");
      return;
    }
    if (!(reorder >= 0)) {
      setError("Reorder level must be 0 or more.");
      return;
    }
    if (isCreate) {
      const initial = Number(values.initialStock);
      if (!(initial >= 0)) {
        setError("Initial stock must be 0 or more.");
        return;
      }
    }
    if (categoryMode === NEW_CATEGORY && !newCategoryName.trim()) {
      setError("Enter a name for the new category.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let categoryId = categoryMode === NEW_CATEGORY ? "" : categoryMode;
      if (categoryMode === NEW_CATEGORY) {
        const created = await onCreateCategory(newCategoryName.trim());
        categoryId = created.id;
      }
      await onSave({ ...values, categoryId }, product?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close overlay"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              {isCreate ? "Catalog" : "Update"}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-semibold text-slate-900"
            >
              {isCreate ? "New product" : "Edit product"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isCreate
                ? "Set category and optional photo for your store catalog."
                : "Price & VAT apply to future sales. Adjust stock separately."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Field label="Photo (optional)">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {shownImage ? (
                    <img
                      src={shownImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No image</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    {shownImage ? "Replace photo" : "Add photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file && file.size > 2 * 1024 * 1024) {
                          setError("Image must be 2 MB or smaller.");
                          return;
                        }
                        update("imageFile", file);
                        update("clearImage", false);
                      }}
                    />
                  </label>
                  {shownImage ? (
                    <button
                      type="button"
                      className="text-left text-sm font-semibold text-red-600 hover:text-red-700"
                      onClick={() => {
                        update("imageFile", null);
                        update("clearImage", true);
                      }}
                    >
                      Remove photo
                    </button>
                  ) : null}
                </div>
              </div>
            </Field>

            <Field label="Name">
              <input
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
                placeholder="e.g. Basmati rice 25kg"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  value={categoryMode}
                  onChange={(e) => setCategoryMode(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Uncategorized</option>
                  {categories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  <option value={NEW_CATEGORY}>+ New category…</option>
                </select>
              </Field>
              <Field label="SKU / barcode">
                <input
                  value={values.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. GRN-RICE-25"
                />
              </Field>
            </div>

            {categoryMode === NEW_CATEGORY ? (
              <Field label="New category name">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Dairy"
                />
              </Field>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Unit">
                <select
                  value={values.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  className={inputClass}
                >
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Cost (रू)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.costPriceNpr}
                  onChange={(e) => update("costPriceNpr", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Sale price (रू)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.sellingPriceNpr}
                  onChange={(e) => update("sellingPriceNpr", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reorder level">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={values.reorderLevel}
                  onChange={(e) => update("reorderLevel", e.target.value)}
                  className={inputClass}
                />
              </Field>
              {isCreate ? (
                <Field label="Initial stock">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={values.initialStock}
                    onChange={(e) => update("initialStock", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xs font-semibold text-slate-500">
                    Current stock
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {product?.stockQty.toLocaleString("en-NP")} {product?.unit}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Use Adjust stock to change quantity
                  </p>
                </div>
              )}
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  VAT applicable
                </span>
                <span className="text-xs text-slate-500">
                  Off = exempt goods (e.g. basic grains, some medicines)
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.vatApplicable}
                onClick={() => update("vatApplicable", !values.vatApplicable)}
                className={cn(
                  "relative h-7 w-12 rounded-full transition",
                  values.vatApplicable ? "bg-red-600" : "bg-slate-300",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                    values.vatApplicable ? "left-5" : "left-0.5",
                  )}
                />
              </button>
            </label>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700 disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : isCreate
                  ? "Save product"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
