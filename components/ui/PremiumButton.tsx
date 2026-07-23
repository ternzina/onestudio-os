"use client";

import { motion } from "framer-motion";

type PremiumButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "outline";
  className?: string;
};

export default function PremiumButton({
  children,
  href,
  onClick,
  variant = "gold",
  className = "",
}: PremiumButtonProps) {
  const styles =
    variant === "gold"
      ? "bg-[#E6B98F] text-[#130D09] hover:bg-[#F0C9A6]"
      : "border border-[#D4A37366] text-[#F7EFE6] hover:bg-[#D4A37322]";

  const baseClass = `inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${styles} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.04, y: -3 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className={baseClass}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className={baseClass}
    >
      {children}
    </motion.button>
  );
}