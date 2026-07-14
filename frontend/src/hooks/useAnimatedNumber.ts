import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type UseAnimatedNumberOptions = {
  value: number;
  duration?: number;
  enabled?: boolean;
};

/**
 * Counts from 0 to `value` when the element enters the viewport.
 */
export function useAnimatedNumber({
  value,
  duration = 1.4,
  enabled = true,
}: UseAnimatedNumberOptions) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!enabled || !inView) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, enabled]);

  return { ref, display };
}
