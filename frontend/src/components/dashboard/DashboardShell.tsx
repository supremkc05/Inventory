import { fetchMe } from "@/api/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { getStoredUser, saveUser } from "@/lib/authStorage";
import { useEffect, useState, type ReactNode } from "react";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeName, setStoreName] = useState(
    () => getStoredUser()?.business?.name ?? "",
  );

  useEffect(() => {
    let cancelled = false;
    void fetchMe()
      .then((me) => {
        if (cancelled) return;
        saveUser(me);
        setStoreName(me.business?.name ?? "");
      })
      .catch(() => {
        // Keep cached store name if /me fails
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-svh bg-slate-50">
      <Sidebar
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        storeName={storeName}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMenuOpen(true)}
        />
        <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
