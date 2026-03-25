import type { ReactNode } from "react";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";

type MotionSectionProps = {
  delayMs?: number;
  className?: string;
  children: ReactNode;
} & Omit<MotionProps, "children" | "className">;

export function MotionSection({ delayMs = 0, className, children, ...props }: MotionSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? undefined
          : {
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
              delay: delayMs / 1000,
            }
      }
      {...props}
    >
      {children}
    </motion.section>
  );
}

