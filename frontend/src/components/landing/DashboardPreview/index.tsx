import { FadeIn } from "@/components/ui";
import { FloatingDashboard } from "./FloatingDashboard";

export function DashboardPreview() {
  return (
    <section
      id="dashboard"
      className="relative overflow-hidden bg-slate-50 py-16 lg:py-24"
      aria-labelledby="dashboard-heading"
    >
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-red-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
            Product preview
          </p>
          <h2
            id="dashboard-heading"
            className="font-display mt-4 text-4xl text-slate-900 sm:text-5xl"
          >
            Your shop at a glance
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Daily sales, VAT totals, stock alerts, and dues — everything your
            dokan needs, in one clean dashboard.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-12">
          <FloatingDashboard />
        </FadeIn>
      </div>
    </section>
  );
}
