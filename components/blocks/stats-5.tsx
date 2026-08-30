"use client";

import { motion } from "motion/react";

const stats = [
  {
    value: "180+",
    description: "Regions served worldwide",
  },
  {
    value: "43",
    description: "Reliable availability zones",
  },
  {
    value: "$152m",
    description: "Savings in just one year",
  },
];

export default function Stats5() {
  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-4xl overflow-hidden bg-purple-500 px-6 sm:px-8 py-16"
        >
          <motion.img
            initial={{ filter: "blur(20px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src="/svg/world-map.svg"
            alt=""
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover"
          />

          <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-medium tracking-tight text-white text-center leading-tight max-w-4xl"
            >
              CloudScale is powering the world
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-16 w-full max-w-6xl">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex flex-col items-center text-center gap-3 sm:gap-4"
                >
                  <span className="text-4xl sm:text-5xl font-semibold text-white">
                    {stat.value}
                  </span>
                  <p className="text-sm sm:text-base md:text-lg text-white max-w-xs">
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="px-8 sm:px-10 py-3 rounded-md bg-neutral-900 dark:bg-neutral-950 text-white font-semibold text-base sm:text-lg hover:bg-neutral-800 dark:hover:bg-neutral-900 transition-colors duration-200"
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
