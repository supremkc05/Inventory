import { cn } from "@/lib/cn";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";
import { NepalFlag } from "./NepalFlag";
import { NepalMapSvg } from "./NepalMapSvg";

type NepalMapProps = {
  className?: string;
  showBadge?: boolean;
  showLabel?: boolean;
  showDots?: boolean;
  animate?: boolean;
  interactive?: boolean;
};

export function NepalMap({
  className,
  showBadge = true,
  showLabel = true,
  showDots = false,
  animate = true,
  interactive = true,
}: NepalMapProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white" />

      {showBadge && (
        <motion.div
          className="absolute right-2 top-2 z-20 flex flex-col items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm sm:right-4 sm:top-4"
          initial={animate ? { opacity: 0, y: -12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <NepalFlag className="h-12 w-14" />
          <span className="mt-1 text-xs font-semibold tracking-[0.2em] text-slate-900">
            NEPAL
          </span>
        </motion.div>
      )}

      <motion.div
        className="relative z-10 mx-auto h-full w-full max-h-[560px]"
        initial={animate ? { opacity: 0, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <NepalMapSvg
          variant="default"
          showDots={showDots}
          showDotLabels={showDots}
          animate={animate}
          interactive={interactive}
          className="h-full w-full"
        />
      </motion.div>

      {showLabel && (
        <motion.p
          className="relative z-20 mt-4 text-center text-sm text-slate-500"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          77 districts · Built for businesses across Nepal
        </motion.p>
      )}
    </div>
  );
}
