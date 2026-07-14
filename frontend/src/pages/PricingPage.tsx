import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import { Link } from "react-router-dom";

/**
 * Placeholder pricing page — full plans UI comes next.
 * Signup/login currently redirect here in the product flow.
 */
export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 px-6">
      <Link to="/" className="mb-8 flex items-center gap-2.5">
        <img src={logo} alt={SITE.name} className="h-10 w-10 object-contain" />
        <span className="text-lg font-semibold text-slate-900">
          Dokan<span className="text-red-600">Daftar</span>
        </span>
      </Link>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
          Next up
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Pricing page
        </h1>
        <p className="mt-3 text-slate-600">
          You&apos;re signed in to the flow. We&apos;ll build plan cards and
          checkout here next — then the real dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to home
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Back to signup
          </Link>
        </div>
      </div>
    </div>
  );
}
