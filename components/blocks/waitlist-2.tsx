"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export default function Waitlist2() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Email submitted:", email);
    setIsSubmitting(false);
    setEmail("");
  };

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start lg:items-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col items-center space-y-8 sm:space-y-12">
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl relative"
          >
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 w-[200px] h-[200px] z-0 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%,
                    rgba(147, 51, 234, 0.3) 0%,
                    rgba(147, 51, 234, 0.15) 25%,
                    rgba(147, 51, 234, 0.08) 40%,
                    transparent 60%
                  )
                `,
              }}
            />
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-2xl relative z-10">
              <div className="hidden sm:flex shrink-0 w-10 h-10 sm:w-12 sm:h-12 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 text-neutral-500 dark:text-neutral-400"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                disabled={isSubmitting}
                aria-label="Email address"
                className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm sm:text-base rounded-md focus:outline-none disabled:opacity-50 border border-neutral-200 dark:border-transparent"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                aria-label={isSubmitting ? "Joining waitlist" : "Join waitlist"}
                className="w-full sm:w-auto shrink-0 px-6 sm:px-8 py-2.5 sm:py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md font-medium text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Joining...</span>
                  </>
                ) : (
                  "Join waitlist"
                )}
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center text-center space-y-4 sm:space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 dark:text-white leading-tight max-w-4xl">
              Curate your elements
            </h1>
            <p className="text-base tracking-tight text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
              Organize your elements into clusters that people can follow.
              Clusters can be made private or public, and you can collaborate
              with others.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl relative"
          >
            <div className="w-full rounded-4xl min-h-[300px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 md:p-16 lg:p-20"></div>

            <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 pointer-events-none rounded-b-3xl bg-linear-to-b from-transparent to-white dark:to-neutral-950" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
