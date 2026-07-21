import { formatNpr } from "@/lib/vat";
import { cn } from "@/lib/cn";
import type { Customer } from "@/types/customers";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type CustomerTableProps = {
  customers: Customer[];
  selectedId: string | null;
  canManage: boolean;
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onPayment: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

export function CustomerTable({
  customers,
  selectedId,
  canManage,
  onSelect,
  onEdit,
  onPayment,
  onDelete,
}: CustomerTableProps) {
  if (!customers.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-900">
          No customers found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try another search or add a customer.
        </p>
      </div>
    );
  }

  return (
    <motion.section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Customers</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Contacts, PAN, and udhaaro balance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">PAN</th>
              <th className="px-5 py-3 font-medium">Due</th>
              {canManage ? (
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className={cn(
                  "cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/80",
                  selectedId === c.id && "bg-red-50/40",
                )}
                onClick={() => onSelect(c)}
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  {c.address ? (
                    <p className="mt-0.5 text-xs text-slate-500">{c.address}</p>
                  ) : null}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {c.phone || "—"}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                  {c.pan || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      c.dueBalanceNpr > 0
                        ? "text-amber-700"
                        : "text-slate-900",
                    )}
                  >
                    {formatNpr(c.dueBalanceNpr)}
                  </span>
                </td>
                {canManage ? (
                  <td
                    className="px-5 py-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <ActionButton label="Edit" onClick={() => onEdit(c)}>
                        <EditIcon />
                      </ActionButton>
                      {c.dueBalanceNpr > 0 ? (
                        <ActionButton
                          label="Record payment"
                          onClick={() => onPayment(c)}
                        >
                          <CashIcon />
                        </ActionButton>
                      ) : null}
                      <ActionButton
                        label="Delete"
                        danger
                        onClick={() => onDelete(c)}
                      >
                        <TrashIcon />
                      </ActionButton>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

function ActionButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm",
        danger && "hover:border-red-100 hover:bg-red-50 hover:text-red-600",
      )}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 6l4 4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V5h6v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
