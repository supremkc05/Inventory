import illu from "@/assets/illu.png";
import { cn } from "@/lib/cn";

/** DokanDaftar shop + ledger illustration (transparent PNG). */
export function AuthIllustration({ className }: { className?: string }) {
  return (
    <img
      src={illu}
      alt="Shop storefront and sales ledger"
      className={cn("h-auto w-full object-contain object-center", className)}
      draggable={false}
    />
  );
}
