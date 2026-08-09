import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  CustomerDetailPanel,
  CustomerFilters,
  CustomerFormOverlay,
  CustomerInsights,
  CustomerTable,
  DeleteCustomerDialog,
  RecordPaymentOverlay,
} from "@/components/customers";
import {
  archiveCustomer,
  createCustomer,
  listCustomers,
  updateCustomer,
} from "@/api/customers";
import {
  createPayment,
  findUnpaidSaleForCustomer,
} from "@/api/sales";
import { ApiError } from "@/lib/api";
import { getStoredRole } from "@/lib/authStorage";
import {
  canManageCustomers,
  type Customer,
  type CustomerFormValues,
  type DueFilter,
} from "@/types/customers";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CustomersPage() {
  const canManage = canManageCustomers(getStoredRole());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [due, setDue] = useState<DueFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Customer | null>(null);

  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Customer | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const rows = await listCustomers();
      setCustomers(rows);
      setSelectedId((prev) => {
        if (prev && rows.some((c) => c.id === prev && c.isActive)) return prev;
        return rows.find((c) => c.isActive)?.id ?? null;
      });
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Could not load customers. Is the API running?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (!c.isActive) return false;
      if (due === "with_due" && c.dueBalanceNpr <= 0) return false;
      if (due === "clear" && c.dueBalanceNpr > 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.pan.includes(q)
      );
    });
  }, [customers, search, due]);

  const selected =
    filtered.find((c) => c.id === selectedId) ??
    customers.find((c) => c.id === selectedId && c.isActive) ??
    null;

  const handleSaveForm = async (
    values: CustomerFormValues,
    editingId?: string,
  ) => {
    try {
      if (editingId) {
        const updated = await updateCustomer(editingId, values);
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? {
                  ...updated,
                  payments: c.payments,
                  sales: c.sales,
                  dueBalanceNpr: c.dueBalanceNpr,
                  hasTransactions: c.hasTransactions,
                }
              : c,
          ),
        );
        return;
      }
      const created = await createCustomer(values);
      setCustomers((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } catch (err) {
      throw err instanceof ApiError
        ? err
        : new Error("Could not save customer.");
    }
  };

  const handlePayment = async (input: {
    customerId: string;
    amountNpr: number;
    notes: string;
  }) => {
    const sale = await findUnpaidSaleForCustomer(input.customerId);
    if (!sale) {
      throw new Error(
        "No unpaid sale found for this customer. Record a sale with due first.",
      );
    }
    try {
      await createPayment({
        saleId: String(sale.id),
        amount: String(input.amountNpr),
        notes: input.notes,
      });
      await refresh();
    } catch (err) {
      throw err instanceof ApiError
        ? err
        : new Error("Could not record payment.");
    }
  };

  const handleDelete = async (customer: Customer) => {
    await archiveCustomer(customer.id);
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    if (selectedId === customer.id) setSelectedId(null);
  };

  return (
    <DashboardShell
      title="Customers"
      subtitle="Contacts, PAN, and udhaaro dues"
    >
      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setLoading(true);
              void refresh();
            }}
          >
            Retry
          </button>
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading customers…</p>
      ) : (
        <>
          <CustomerInsights
            customers={customers}
            filteredCount={filtered.length}
          />

          <CustomerFilters
            search={search}
            due={due}
            canManage={canManage}
            resultCount={filtered.length}
            onSearchChange={setSearch}
            onDueChange={setDue}
            onAdd={() => {
              setFormMode("create");
              setEditing(null);
              setFormOpen(true);
            }}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <CustomerTable
              customers={filtered}
              selectedId={selectedId}
              canManage={canManage}
              onSelect={(c) => setSelectedId(c.id)}
              onEdit={(c) => {
                setFormMode("edit");
                setEditing(c);
                setFormOpen(true);
              }}
              onPayment={(c) => {
                setPayTarget(c);
                setPayOpen(true);
              }}
              onDelete={(c) => {
                setDeleteTarget(c);
                setDeleteOpen(true);
              }}
            />
            <CustomerDetailPanel customer={selected} />
          </div>
        </>
      )}

      {canManage ? (
        <>
          <CustomerFormOverlay
            open={formOpen}
            mode={formMode}
            customer={editing}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSave={handleSaveForm}
          />
          <RecordPaymentOverlay
            open={payOpen}
            customer={payTarget}
            onClose={() => {
              setPayOpen(false);
              setPayTarget(null);
            }}
            onSave={handlePayment}
          />
          <DeleteCustomerDialog
            open={deleteOpen}
            customer={deleteTarget}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteTarget(null);
            }}
            onConfirm={(customer) => {
              void handleDelete(customer).then(() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              });
            }}
          />
        </>
      ) : null}
    </DashboardShell>
  );
}
