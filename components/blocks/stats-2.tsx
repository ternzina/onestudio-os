"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const competitors = [
  {
    name: "Acme Inc",
    score: 94,
    progress: 94,
    isHighlighted: true,
  },
  {
    name: "CompanyX",
    score: 0,
    progress: 0,
    isHighlighted: false,
  },
  {
    name: "BuildCo",
    score: 0,
    progress: 0,
    isHighlighted: false,
  },
];

export default function Stats2() {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 bg-white dark:bg-neutral-950"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
                Top rated platform in 94 categories
              </h2>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Acme Inc leads the industry with highest satisfaction scores
                across developer tools and enterprise software.
              </p>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors duration-200 group underline"
              >
                View full results
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            <div className="flex items-center justify-start lg:justify-end gap-[min(2vw,2rem)]">
              {competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    className="relative"
                    style={{
                      width: "min(20vw, 9rem)",
                      height: "min(20vw, 9rem)",
                    }}
                  >
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                      style={{ transform: "scaleY(-1)" }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={
                          competitor.isHighlighted
                            ? "text-neutral-200 dark:text-neutral-800"
                            : "text-neutral-200 dark:text-neutral-800"
                        }
                      />

                      {competitor.progress > 0 && (
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          className="text-neutral-900 dark:text-white"
                          initial={{ strokeDashoffset: 283 }}
                          whileInView={{
                            strokeDashoffset:
                              283 - (283 * competitor.progress) / 100,
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                          style={{
                            strokeDasharray: "283",
                          }}
                        />
                      )}
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`font-bold ${
                          competitor.isHighlighted
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-300 dark:text-neutral-700"
                        }`}
                        style={{ fontSize: "min(10vw, 3.75rem)" }}
                      >
                        {competitor.score}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-medium ${
                      competitor.isHighlighted
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-400 dark:text-neutral-600"
                    }`}
                    style={{ fontSize: "min(3vw, 1rem)" }}
                  >
                    {competitor.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
