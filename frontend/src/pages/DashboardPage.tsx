import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import { Link } from "react-router-dom";

/**
 * Stub dashboard — real app shell comes next after plan selection.
 */
export default function DashboardPage() {
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
          You&apos;re in
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-slate-600">
          Plan selected. The real shop dashboard — sales, stock, VAT, and
          udhaaro — will live here next.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/pricing"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Change plan
          </Link>
          <Link
            to="/"
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
