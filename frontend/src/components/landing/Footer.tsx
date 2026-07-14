import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt={SITE.name}
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="font-semibold text-slate-900">
            Dokan<span className="text-red-600">Daftar</span>
          </span>
        </div>

        <p className="text-sm text-slate-500">
          © {year} {SITE.name}. Inventory & billing for Nepal.
        </p>

        <nav className="flex gap-6 text-sm text-slate-500" aria-label="Footer">
          <a href="#" className="transition hover:text-red-600">
            Privacy
          </a>
          <a href="#" className="transition hover:text-red-600">
            Terms
          </a>
          <a href="#" className="transition hover:text-red-600">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
