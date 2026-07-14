import { cn } from "@/lib/cn";
import type { PaymentStatus } from "@/types/landing";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Partial: "bg-amber-50 text-amber-700",
  Unpaid: "bg-red-50 text-red-700",
};

type StatusPillProps = {
  status: PaymentStatus;
  className?: string;
};

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
