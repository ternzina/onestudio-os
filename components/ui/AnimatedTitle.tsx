"use client";

import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "./animations";

type AnimatedTitleProps = {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
};

const smoothTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function AnimatedTitle({
  eyebrow,
  title,
  align = "center",
}: AnimatedTitleProps) {
  const alignment = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`mb-16 ${alignment}`}>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={smoothTransition}
        className="mb-4 text-sm uppercase tracking-[0.35em] text-[#D4A373]"
      >
        {eyebrow}
      </motion.p>

      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={{ ...smoothTransition, delay: 0.12 }}
        className="text-5xl font-light leading-tight text-[#F7EFE6] md:text-6xl"
      >
        {title}
      </motion.h2>
    </div>
  );
}
