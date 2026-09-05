"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function SectionReveal({
  children,
  amount = 0.15,
}: {
  children: ReactNode;
  amount?: number;
}) {
  const reducedMotion = useReducedMotion() === true;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
