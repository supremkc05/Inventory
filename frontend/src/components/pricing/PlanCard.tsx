import {
  annualMonthlyNpr,
  annualTotalNpr,
  formatNpr,
  type BillingPeriod,
  type Plan,
} from "@/constants/pricing";
import { Link } from "react-router-dom";

type PlanCardProps = {
  plan: Plan;
  billing: BillingPeriod;
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PlanCard({ plan, billing }: PlanCardProps) {
  const isFree = plan.monthlyPriceNpr === 0;
  const isAnnual = billing === "annual" && !isFree;
  const displayMonthly = isAnnual
    ? annualMonthlyNpr(plan.monthlyPriceNpr)
    : plan.monthlyPriceNpr;
  const yearlyTotal = annualTotalNpr(plan.monthlyPriceNpr);

  return (
    <article
      className={`relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8 ${
        plan.featured
          ? "border-red-600 shadow-[0_20px_40px_-24px_rgba(220,38,38,0.45)] ring-1 ring-red-600"
          : "border-slate-200 shadow-sm"
      }`}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          Most popular
        </span>
      ) : null}

      <div>
        <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight text-slate-900">
            {isFree ? "Rs 0" : formatNpr(displayMonthly)}
          </span>
          {!isFree ? (
            <span className="text-sm font-medium text-slate-500">/mo</span>
          ) : null}
        </div>
        {isAnnual ? (
          <p className="mt-1 text-sm text-slate-500">
            {formatNpr(yearlyTotal)}/year · billed annually
          </p>
        ) : isFree ? (
          <p className="mt-1 text-sm text-slate-500">Forever free</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Billed monthly in NPR</p>
        )}
      </div>

      <ul className="mt-8 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm text-slate-700">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/dashboard"
        className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
          plan.featured
            ? "bg-red-600 text-white hover:bg-red-700"
            : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
        }`}
      >
        {plan.cta}
      </Link>
    </article>
  );
}
