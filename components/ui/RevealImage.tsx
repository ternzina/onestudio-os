"use client";

import { motion } from "framer-motion";

type RevealImageProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export default function RevealImage({
  children,
  className = "",
  delay = 0,
}: RevealImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1.1, delay, ease: "easeOut" }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}