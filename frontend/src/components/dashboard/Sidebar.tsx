import { APP_NAV } from "@/constants/appNav";
import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import { cn } from "@/lib/cn";
import { Link, NavLink } from "react-router-dom";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const READY_ROUTES = new Set(["/dashboard", "/sales"]);

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5"
            onClick={onClose}
          >
            <img
              src={logo}
              alt={SITE.name}
              className="h-9 w-9 rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Dokan<span className="text-red-600">Daftar</span>
              </p>
              <p className="text-xs text-slate-500">{SITE.demoStore}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="App navigation">
          {APP_NAV.map((item) => {
            const ready = READY_ROUTES.has(item.href);
            if (!ready) {
              return (
                <span
                  key={item.href}
                  className="flex w-full cursor-not-allowed items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300"
                  title="Coming soon"
                >
                  {item.label}
                </span>
              );
            }

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Fiscal year
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {SITE.fiscalYear}
            </p>
            <p className="text-xs text-slate-500">Shrawan – Ashad</p>
          </div>
        </div>
      </aside>
    </>
  );
}
