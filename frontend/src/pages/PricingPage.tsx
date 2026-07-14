import { BillingToggle, PlanCard } from "@/components/pricing";
import { SITE } from "@/constants/landing";
import {
  PLANS,
  type BillingPeriod,
} from "@/constants/pricing";
import logo from "@/assets/image.png";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("annual");

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-slate-100" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9 object-contain" />
            <span className="text-lg font-semibold text-slate-900">
              Dokan<span className="text-red-600">Daftar</span>
            </span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Sign in
          </Link>
        </header>

        <motion.div
          className="mx-auto mt-12 max-w-2xl text-center sm:mt-16"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
            Pricing in NPR
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Simple pricing for Nepali shops
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Built for {SITE.tagline.toLowerCase()} inventory, VAT bills, and
            udhaaro in rupees you recognise.
          </p>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: EASE_OUT_EXPO }}
        >
          <BillingToggle value={billing} onChange={setBilling} />
        </motion.div>

        <motion.div
          className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-5 lg:items-stretch"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: EASE_OUT_EXPO }}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </motion.div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Prices shown in Nepalese Rupees (Rs). No credit card required to start
          free.
        </p>
      </div>
    </div>
  );
}
