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
import { DEMO_CUSTOMERS, MOCK_APP_ROLE } from "@/constants/customers";
import {
  canManageCustomers,
  type Customer,
  type CustomerFormValues,
  type DueFilter,
} from "@/types/customers";
import { useMemo, useState } from "react";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function CustomersPage() {
  const canManage = canManageCustomers(MOCK_APP_ROLE);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [due, setDue] = useState<DueFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    DEMO_CUSTOMERS.find((c) => c.isActive)?.id ?? null,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Customer | null>(null);

  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Customer | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

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

  const handleSaveForm = (values: CustomerFormValues, editingId?: string) => {
    if (editingId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: values.name,
                phone: values.phone,
                pan: values.pan,
                address: values.address,
              }
            : c,
        ),
      );
      return;
    }
    const created: Customer = {
      id: newId("cus"),
      name: values.name,
      phone: values.phone,
      pan: values.pan,
      address: values.address,
      dueBalanceNpr: 0,
      isActive: true,
      hasTransactions: false,
      payments: [],
      sales: [],
    };
    setCustomers((prev) => [created, ...prev]);
    setSelectedId(created.id);
  };

  const handlePayment = (input: {
    customerId: string;
    amountNpr: number;
    notes: string;
  }) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== input.customerId) return c;
        return {
          ...c,
          dueBalanceNpr: Math.max(0, c.dueBalanceNpr - input.amountNpr),
          payments: [
            {
              id: newId("pay"),
              amountNpr: input.amountNpr,
              notes: input.notes,
              createdAt: new Date().toISOString(),
            },
            ...c.payments,
          ],
        };
      }),
    );
  };

  const handleDelete = (customer: Customer) => {
    if (customer.hasTransactions) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, isActive: false } : c,
        ),
      );
      if (selectedId === customer.id) setSelectedId(null);
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    if (selectedId === customer.id) setSelectedId(null);
  };

  return (
    <DashboardShell
      title="Customers"
      subtitle="Contacts, PAN, and udhaaro dues"
    >
      <CustomerInsights customers={customers} filteredCount={filtered.length} />

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
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </DashboardShell>
  );
}
