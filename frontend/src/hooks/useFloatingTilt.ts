import {
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, type MouseEvent } from "react";

type UseFloatingTiltOptions = {
  rotateRange?: number;
  translateRange?: number;
};

/**
 * 3D tilt + subtle float that follows pointer position over a card.
 */
export function useFloatingTilt({
  rotateRange = 9,
  translateRange = 6,
}: UseFloatingTiltOptions = {}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [rotateRange, -rotateRange]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-rotateRange - 1, rotateRange + 1]), {
    stiffness: 200,
    damping: 20,
  });
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-translateRange, translateRange]), {
    stiffness: 180,
    damping: 18,
  });

  const glowX = useTransform(mouseX, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [20, 80]);
  const glowBackground = useMotionTemplate`radial-gradient(520px circle at ${glowX}% ${glowY}%, rgba(220,38,38,0.08), transparent 50%)`;

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return {
    cardRef,
    style: { rotateX, rotateY, y, transformStyle: "preserve-3d" as const },
    glowBackground,
    onMouseMove,
    onMouseLeave,
  };
}
