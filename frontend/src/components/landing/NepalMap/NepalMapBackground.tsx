import { cn } from "@/lib/cn";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { motion } from "framer-motion";
import { NepalMapSvg } from "./NepalMapSvg";

type NepalMapBackgroundProps = {
  className?: string;
};

/** Full-bleed hero background map, centered with city dots. */
export function NepalMapBackground({ className }: NepalMapBackgroundProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.88)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/70" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[165%] w-[min(115vw,980px)] max-w-none -translate-x-1/2 -translate-y-1/2 sm:h-[160%] sm:w-[min(110vw,940px)] lg:h-[155%] lg:w-[min(105vw,1020px)]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
      >
        <NepalMapSvg
          variant="background"
          showDots
          showDotLabels
          animate
          interactive={false}
          className="h-full w-full"
        />
      </motion.div>
    </div>
  );
}
