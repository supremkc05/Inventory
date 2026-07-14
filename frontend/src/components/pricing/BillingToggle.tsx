import type { BillingPeriod } from "@/constants/pricing";

type BillingToggleProps = {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
};

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="group"
        aria-label="Billing period"
        className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1"
      >
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            value === "monthly"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("annual")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            value === "annual"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Annual
        </button>
      </div>
      {value === "annual" ? (
        <p className="text-sm font-medium text-red-600">Save 30% with annual billing</p>
      ) : (
        <p className="text-sm text-slate-500">
          Switch to annual and save{" "}
          <span className="font-semibold text-red-600">30%</span>
        </p>
      )}
    </div>
  );
}
