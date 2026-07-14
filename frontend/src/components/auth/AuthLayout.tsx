import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import {
  ChevronDownIcon,
  GlobeIcon,
} from "@/components/auth/AuthIcons";
import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AUTH_CARD =
  "grid w-full max-w-[1080px] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_20px_50px_-20px_rgba(37,99,235,0.18)] h-[min(680px,calc(100svh-2rem))] lg:grid-cols-2";

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Soft grey base so translucent white shows through */}
      <div className="pointer-events-none absolute inset-0 bg-slate-100" aria-hidden />
      {/* Login/signup page background: white @ 60% opacity */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        aria-hidden
      />

      <motion.div
        className={`relative z-10 ${AUTH_CARD}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
      >
        <div className="hidden h-full min-h-0 lg:block">
          <AuthBrandPanel />
        </div>

        <main className="relative flex min-h-0 flex-col overflow-hidden bg-white">
          <div className="flex shrink-0 items-center justify-between px-6 pt-5 sm:px-8 lg:px-10 lg:pt-6">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <img
                src={logo}
                alt={SITE.name}
                className="h-9 w-9 rounded-lg object-contain"
              />
              <span className="text-lg font-semibold text-slate-900">
                Dokan<span className="text-red-600">Daftar</span>
              </span>
            </Link>

            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-sky-50"
              aria-label="Language"
            >
              <GlobeIcon className="h-4 w-4 text-slate-500" />
              <span>English</span>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <div className="mx-auto flex min-h-0 w-full max-w-[380px] flex-1 flex-col overflow-y-auto px-6 py-5 sm:px-8 lg:px-0">
            <div className="my-auto w-full py-2">
              <div>
                <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-[1.9rem]">
                  {title}
                </h2>
                <p className="mt-1 text-[14px] text-slate-500">{subtitle}</p>
              </div>
              <div className="mt-5">{children}</div>
            </div>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
