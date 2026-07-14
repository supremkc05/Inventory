import nepalFlag from "@/assets/nepal-flag.png";
import { cn } from "@/lib/cn";

type NepalFlagProps = {
  className?: string;
  alt?: string;
};

/** Official Nepal flag graphic (double pennon). */
export function NepalFlag({
  className,
  alt = "Flag of Nepal",
}: NepalFlagProps) {
  return (
    <img
      src={nepalFlag}
      alt={alt}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}
