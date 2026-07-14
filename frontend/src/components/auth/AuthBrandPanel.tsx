import {
  BoxIcon,
  ChartIcon,
  UserIcon,
} from "@/components/auth/AuthIcons";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";
import { Link } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";

/** Sampled from illu.png */
const ILLU_NAVY = "#1E3D69";
const ILLU_NAVY_DARK = "#09254A";
const ILLU_CREAM = "#FDF8F4";
const ILLU_ORANGE = "#E75E30";

const FEATURES: {
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { label: "Smart Insights", Icon: ChartIcon },
  { label: "Stock Control", Icon: BoxIcon },
  { label: "Customer Management", Icon: UserIcon },
];

export function AuthBrandPanel() {
  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden border-r border-[#1E3D69]/15 bg-gradient-to-b from-white via-[#F4F7FB] to-[#E8EEF6] px-9 py-8 lg:px-11 lg:py-9">
      {/* Side / top stripes — navy + cream from illu.png */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3.5"
        style={{
          background: `repeating-linear-gradient(180deg, ${ILLU_NAVY} 0 12px, ${ILLU_CREAM} 12px 24px)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2.5"
        style={{
          background: `repeating-linear-gradient(90deg, ${ILLU_NAVY} 0 16px, ${ILLU_CREAM} 16px 32px)`,
        }}
        aria-hidden
      />
      {/* Soft navy shading (from illustration building blue) */}
      <div
        className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: `${ILLU_NAVY}33` }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-10 h-48 w-48 rounded-full blur-3xl"
        style={{ backgroundColor: `${ILLU_NAVY_DARK}22` }}
      />

      <Link to="/" className="relative z-10 flex shrink-0 items-center gap-2.5">
        <img
          src={logo}
          alt={SITE.name}
          className="h-10 w-10 rounded-lg object-contain"
        />
        <span className="text-xl font-semibold tracking-tight text-slate-900">
          Dokan<span style={{ color: ILLU_ORANGE }}>Daftar</span>
        </span>
      </Link>

      <div className="relative z-10 mt-9 max-w-[22rem] shrink-0">
        <h1 className="text-[1.9rem] font-bold leading-[1.25] tracking-tight text-slate-900 xl:text-[2.25rem]">
          Chalau Byapar,{" "}
          <span style={{ color: ILLU_ORANGE }}>Sajilo Tarikale.</span>
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
          DokanDaftar helps you manage your sales, stock, customers and accounts
          —all in one place.
        </p>
      </div>

      <div className="relative z-10 mt-6 flex min-h-0 flex-1 items-center justify-center">
        <AuthIllustration className="h-auto w-full max-h-[260px] max-w-[420px]" />
      </div>

      <ul className="relative z-10 mt-6 flex shrink-0 items-center border-t border-[#1E3D69]/15 pt-5">
        {FEATURES.map(({ label, Icon }, index) => (
          <li
            key={label}
            className={`flex flex-1 items-center gap-2.5 ${
              index > 0 ? "border-l border-[#1E3D69]/15 pl-3.5" : "pr-2"
            }`}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
              style={{ borderColor: ILLU_NAVY, color: ILLU_NAVY }}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-slate-800 xl:text-xs">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
