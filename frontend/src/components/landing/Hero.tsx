import { HERO_STATS } from "@/constants/landing";
import { NepalMapBackground } from "@/components/landing/NepalMap/index";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-white pt-24">
      <NepalMapBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] max-w-4xl flex-col items-center justify-center px-6 pb-20 text-center lg:px-8 lg:pb-28">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/90 px-4 py-1.5 text-sm text-red-700 shadow-sm backdrop-blur-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Built for Nepali businesses
        </motion.div>

        <motion.h1
          className="font-display text-5xl leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          Your shop records,{" "}
          <span className="animate-shimmer bg-gradient-to-r from-red-600 via-amber-500 to-blue-700 bg-clip-text text-transparent">
            Nepal-ready
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Inventory, IRD-compliant VAT billing, customer dues, and fiscal-year
          reports, one platform for kirana shops, pharmacies, and wholesalers
          across Nepal.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Link
            to="/signup"
            className="group relative overflow-hidden rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
          >
            <span className="relative z-10">Start free trial</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent duration-700 transition group-hover:translate-x-full" />
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-slate-300 bg-white/90 px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-400 hover:bg-white"
          >
            See features
          </a>
        </motion.div>

        <motion.div
          className="mt-14 flex flex-wrap justify-center gap-8 border-t border-slate-200/80 pt-8 sm:gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
