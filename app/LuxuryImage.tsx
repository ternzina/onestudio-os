"use client";

import { motion } from "framer-motion";

type LuxuryImageProps = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
  delay?: number;
};

export default function LuxuryImage({
  title,
  subtitle,
  imageUrl,
  className = "",
  delay = 0,
}: LuxuryImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, clipPath: "inset(0 0 18% 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-[28px] bg-[#2A211D] ${className}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-[1200ms] ease-out group-hover:scale-110"
        style={{
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : "linear-gradient(135deg, #6B4A39, #2A1C16)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D4A37322] blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[#E6B98F14] blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute -left-44 top-0 h-full w-28 rotate-12 bg-[#F7EFE633] opacity-0 blur-xl transition-all duration-1000 group-hover:left-[140%] group-hover:opacity-100" />
      </div>

      <div className="relative z-10 flex h-full min-h-[380px] flex-col justify-end p-8">
        <h3 className="mb-2 text-2xl font-light text-[#F7EFE6] transition duration-500 group-hover:translate-y-[-4px]">
          {title}
        </h3>

        {subtitle && (
          <p className="max-w-xs leading-7 text-[#C8B8AA] transition duration-500 group-hover:translate-y-[-4px]">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}