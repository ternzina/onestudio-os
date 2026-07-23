"use client";

import { motion } from "framer-motion";

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export default function PremiumCard({
  children,
  className = "",
  delay = 0,
}: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut",
      }}
      whileHover={{
        y: -12,
        scale: 1.025,
      }}
      className={`
        group
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-[#D4A37333]
        bg-[#1A1512]
        p-8
        shadow-xl
        transition-all
        duration-500
        hover:border-[#D4A373]
        ${className}
      `}
    >
      {/* Luxury Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[#D4A37322] blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#E6B98F18] blur-3xl" />
      </div>

      {/* Shine Effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
        <div className="absolute -left-40 top-0 h-full w-24 rotate-12 bg-white/10 opacity-0 blur-xl transition-all duration-700 group-hover:left-[140%] group-hover:opacity-100" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}