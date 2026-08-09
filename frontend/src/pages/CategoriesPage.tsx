import {
  archiveCategory,
  createCategory,
  listCategories,
  updateCategory,
  type Category,
} from "@/api/categories";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getStoredRole } from "@/lib/authStorage";
import { canManageProducts } from "@/types/products";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

export default function CategoriesPage() {
  const canManage = canManageProducts(getStoredRole());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const rows = await listCategories();
      setCategories(rows);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load categories.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCategory(name.trim());
      setName("");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create.");
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not rename.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (category: Category) => {
    setSaving(true);
    setError(null);
    try {
      await archiveCategory(category.id);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not archive.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (category: Category) => {
    setSaving(true);
    setError(null);
    try {
      await updateCategory(category.id, { is_active: true });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not restore.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Categories"
      subtitle="Your store’s product categories"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/products"
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          ← Back to products
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {canManage ? (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end"
        >
          <label className="min-w-0 flex-1 space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              New category
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dairy, Snacks, Pharmacy"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-red-600/20 focus:border-red-300 focus:ring-4"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add category"}
          </button>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="font-semibold text-slate-900">No categories yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add categories for your store, or create them while adding a
            product.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Products</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {canManage ? (
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-5 py-3.5">
                    {editingId === c.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">
                        {c.name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {c.productCount}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        c.isActive
                          ? "font-medium text-emerald-600"
                          : "font-medium text-slate-400"
                      }
                    >
                      {c.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  {canManage ? (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === c.id ? (
                          <>
                            <button
                              type="button"
                              className="text-sm font-semibold text-emerald-600"
                              onClick={() => void handleRename(c.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="text-sm font-semibold text-slate-500"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                              onClick={() => {
                                setEditingId(c.id);
                                setEditName(c.name);
                              }}
                            >
                              Rename
                            </button>
                            {c.isActive ? (
                              <button
                                type="button"
                                className="text-sm font-semibold text-red-600 hover:text-red-700"
                                onClick={() => void handleArchive(c)}
                              >
                                Archive
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                                onClick={() => void handleRestore(c)}
                              >
                                Restore
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
