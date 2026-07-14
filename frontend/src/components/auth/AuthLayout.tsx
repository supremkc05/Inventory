import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import nepalFlag from "@/assets/nepal-flag.png";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-white lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        </div>

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <img
            src={logo}
            alt={SITE.name}
            className="h-10 w-10 rounded-xl bg-white object-contain p-0.5"
          />
          <span className="text-lg font-semibold text-white">
            Dokan<span className="text-red-400">Daftar</span>
          </span>
        </Link>

        <motion.div
          className="relative z-10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          <img
            src={nepalFlag}
            alt=""
            className="mb-8 h-16 w-auto object-contain opacity-90"
            aria-hidden
          />
          <h1 className="font-display text-4xl leading-tight text-white xl:text-5xl">
            Shop records built for Nepal
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Inventory, IRD VAT invoices, Bikram Sambat dates, and udhaaro —
            everything your dokan needs in one place.
          </p>
        </motion.div>

        <p className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <img
              src={logo}
              alt={SITE.name}
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="text-lg font-semibold text-slate-900">
              Dokan<span className="text-red-600">Daftar</span>
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </motion.div>

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
