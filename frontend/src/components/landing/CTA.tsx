import { FadeIn } from "@/components/ui";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section id="cta" className="bg-white py-24 lg:py-32" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-blue-50 px-8 py-16 text-center shadow-lg shadow-red-100/40 sm:px-16"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-100/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

            <h2
              id="cta-heading"
              className="font-display relative text-4xl text-slate-900 sm:text-5xl"
            >
              Ready to digitize your dokan?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Join Nepali businesses moving from paper khata to accurate,
              auditable shop records.
            </p>

            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="rounded-xl bg-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700"
              >
                Get started free
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Log in
              </Link>
            </div>

            <p className="relative mt-6 text-sm text-slate-500">
              No credit card required · Web-first · Nepali fiscal year ready
            </p>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
