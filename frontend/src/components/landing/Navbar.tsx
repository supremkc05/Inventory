import { NAV_LINKS, SITE } from "@/constants/landing";
import { EASE_OUT_EXPO } from "@/lib/motion";
import logo from "@/assets/image.png";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Primary"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt={SITE.name}
            className="h-9 w-9 rounded-lg object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Dokan<span className="text-red-600">Daftar</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-slate-600 transition-colors hover:text-red-600"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="block h-0.5 w-5 bg-slate-700" />
        </button>
      </nav>

      {open && (
        <motion.div
          className="border-t border-slate-200 bg-white px-6 py-4 md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-slate-600"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="mt-2 block py-2 text-slate-600"
            onClick={() => setOpen(false)}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="mt-1 block rounded-lg bg-red-600 px-3 py-2 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Get started
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
