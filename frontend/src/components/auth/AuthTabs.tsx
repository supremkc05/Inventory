import { cn } from "@/lib/cn";
import type { AuthMode } from "@/types/auth";
import { Link } from "react-router-dom";

type AuthTabsProps = {
  mode: AuthMode;
};

export function AuthTabs({ mode }: AuthTabsProps) {
  return (
    <div
      className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1"
      role="tablist"
      aria-label="Authentication"
    >
      <Link
        to="/login"
        role="tab"
        aria-selected={mode === "login"}
        className={cn(
          "rounded-lg px-3 py-2 text-center text-sm font-medium transition",
          mode === "login"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-800",
        )}
      >
        Log in
      </Link>
      <Link
        to="/signup"
        role="tab"
        aria-selected={mode === "signup"}
        className={cn(
          "rounded-lg px-3 py-2 text-center text-sm font-medium transition",
          mode === "signup"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-800",
        )}
      >
        Sign up
      </Link>
    </div>
  );
}
