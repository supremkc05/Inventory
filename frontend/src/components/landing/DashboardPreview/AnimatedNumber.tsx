import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { cn } from "@/lib/cn";

type AnimatedNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: AnimatedNumberProps) {
  const { ref, display } = useAnimatedNumber({ value, duration });

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}
      {display.toLocaleString("en-NP")}
      {suffix}
    </span>
  );
}
