import { SITE } from "@/constants/landing";
import logo from "@/assets/image.png";

type BrowserChromeProps = {
  path?: string;
};

export function BrowserChrome({ path = "/dashboard" }: BrowserChromeProps) {
  return (
    <div className="relative z-0 flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
      <div className="ml-3 flex flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
        <img
          src={logo}
          alt=""
          className="h-3.5 w-3.5 rounded-sm object-contain"
          aria-hidden
        />
        <span className="truncate">
          {SITE.url}
          {path}
        </span>
      </div>
    </div>
  );
}
