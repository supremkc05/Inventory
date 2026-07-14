import { CITY_DOTS, NEPAL_MAP_VIEWBOX } from "@/constants/landing";
import { cn } from "@/lib/cn";
import type { NepalMapVariant } from "@/types/landing";
import { motion } from "framer-motion";
import { DISTRICTS } from "nepal-district-map/data";

type NepalMapSvgProps = {
  variant?: NepalMapVariant;
  showDots?: boolean;
  showDotLabels?: boolean;
  animate?: boolean;
  interactive?: boolean;
  className?: string;
};

export function NepalMapSvg({
  variant = "default",
  showDots = false,
  showDotLabels = false,
  animate = true,
  interactive = true,
  className,
}: NepalMapSvgProps) {
  const isBg = variant === "background";
  const fill = isBg ? "#c4c4c4" : "#8a8a8a";
  const strokeWidth = isBg ? 0.9 : 1.2;
  const mapOpacity = isBg ? 0.55 : 1;

  return (
    <svg
      viewBox={NEPAL_MAP_VIEWBOX}
      className={cn(className)}
      aria-hidden={isBg}
      aria-label={isBg ? undefined : "Map of Nepal showing all 77 districts"}
      role={isBg ? "presentation" : "img"}
      preserveAspectRatio="xMidYMid meet"
    >
      <g opacity={mapOpacity}>
        {DISTRICTS.map((district, index) => (
          <motion.path
            key={district.id}
            d={district.d}
            fill={fill}
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={animate && !isBg ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={
              animate && !isBg
                ? { delay: index * 0.008, duration: 0.3, ease: "easeOut" }
                : { duration: 0 }
            }
            whileHover={
              interactive && !isBg
                ? { fill: "#6b6b6b", transition: { duration: 0.15 } }
                : undefined
            }
          >
            {!isBg && <title>{district.name}</title>}
          </motion.path>
        ))}
      </g>

      {showDots &&
        CITY_DOTS.map((city) => (
          <g key={city.id}>
            <motion.circle
              cx={city.cx}
              cy={city.cy}
              r={isBg ? 22 : 16}
              fill="rgba(220,38,38,0.15)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{
                delay: city.delay,
                duration: 2.8,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.circle
              cx={city.cx}
              cy={city.cy}
              r={isBg ? 7 : 5}
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: city.delay, type: "spring", stiffness: 260 }}
            />
            {showDotLabels && (
              <motion.text
                x={city.cx}
                y={city.cy - (isBg ? 14 : 10)}
                textAnchor="middle"
                fill="#334155"
                fontSize={isBg ? 14 : 11}
                fontWeight={600}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: city.delay + 0.2 }}
              >
                {city.name}
              </motion.text>
            )}
          </g>
        ))}
    </svg>
  );
}
