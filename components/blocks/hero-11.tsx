"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

function WireframeCorner({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const lineColor = "bg-neutral-200 dark:bg-neutral-700";
  const length = "w-2 sm:w-8";
  const height = "h-2 sm:h-6";
  const thickness = ".5px";

  if (position === "top-left") {
    return (
      <div className="absolute top-0 left-0 z-10 pointer-events-none">
        <div
          className={`absolute top-0 right-0 ${length} ${lineColor} origin-right`}
          style={{ height: thickness, transform: "translateY(-50%)" }}
        />
        <div
          className={`absolute bottom-0 left-0 ${height} ${lineColor} origin-bottom`}
          style={{ width: thickness, transform: "translateX(-50%)" }}
        />
      </div>
    );
  }

  if (position === "top-right") {
    return (
      <div className="absolute top-0 right-0 z-10 pointer-events-none">
        <div
          className={`absolute top-0 left-0 ${length} ${lineColor} origin-left`}
          style={{ height: thickness, transform: "translateY(-50%)" }}
        />
        <div
          className={`absolute bottom-0 right-0 ${height} ${lineColor} origin-bottom`}
          style={{ width: thickness, transform: "translateX(50%)" }}
        />
      </div>
    );
  }

  if (position === "bottom-left") {
    return (
      <div className="absolute bottom-0 left-0 z-10 pointer-events-none">
        <div
          className={`absolute bottom-0 right-0 ${length} ${lineColor} origin-right`}
          style={{ height: thickness, transform: "translateY(50%)" }}
        />
        <div
          className={`absolute top-0 left-0 ${height} ${lineColor} origin-top`}
          style={{ width: thickness, transform: "translateX(-50%)" }}
        />
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 right-0 z-10 pointer-events-none">
      <div
        className={`absolute bottom-0 left-0 ${length} ${lineColor} origin-left`}
        style={{ height: thickness, transform: "translateY(50%)" }}
      />
      <div
        className={`absolute top-0 right-0 ${height} ${lineColor} origin-top`}
        style={{ width: thickness, transform: "translateX(50%)" }}
      />
    </div>
  );
}

export function Hero11() {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-neutral-950 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col items-start sm:items-center text-left sm:text-center mb-12 sm:mb-16 lg:mb-20">
          <motion.a
            href="#"
            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors mb-8 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-2.5 py-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold">
              New
            </span>
            <span>See our latest features</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-neutral-900 dark:text-white tracking-tight max-w-4xl leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Customer relationship magic.
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Powerful, flexible and data-driven. Build the exact CRM your
            business needs with tools designed for modern teams.
          </motion.p>

          <motion.div
            className="mt-8 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button className="w-full sm:w-auto px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-base font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer">
              Start for free
            </button>
            <button className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg text-base font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
              Talk to sales
            </button>
          </motion.div>
        </div>

        <motion.div
          className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="relative">
            <WireframeCorner position="top-left" />
            <WireframeCorner position="top-right" />
            <WireframeCorner position="bottom-left" />
            <WireframeCorner position="bottom-right" />

            <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&h=800&fit=crop"
                alt="Product dashboard screenshot"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero11;
