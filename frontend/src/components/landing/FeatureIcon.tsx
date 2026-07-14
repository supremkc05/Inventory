import { cn } from "@/lib/cn";

export type FeatureIconName =
  | "inventory"
  | "invoice"
  | "calendar"
  | "dues"
  | "credit-note"
  | "roles";

type FeatureIconProps = {
  name: FeatureIconName;
  className?: string;
};

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FeatureIcon({ name, className }: FeatureIconProps) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...strokeProps}>
        {name === "inventory" && (
          <>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <path d="M3.3 7 12 12l8.7-5M12 22V12" />
          </>
        )}
        {name === "invoice" && (
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
          </>
        )}
        {name === "calendar" && (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </>
        )}
        {name === "dues" && (
          <>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20M12 15h4" />
          </>
        )}
        {name === "credit-note" && (
          <>
            <path d="M3 12h13M10 5l7 7-7 7" />
            <path d="M21 5v14" />
          </>
        )}
        {name === "roles" && (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        )}
      </svg>
    </span>
  );
}
