"use client";

import { motion, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ARPU_YEAR = 240;
const CONVERSION = 0.015;
const INDUSTRY = 0.002;
const MIN_USERS = 10_000;
const MAX_USERS = 5_000_000;

export default function Stats9() {
  const [users, setUsers] = useState(1_000_000);

  const earnings = Math.round(users * CONVERSION * ARPU_YEAR);
  const industry = Math.round(users * INDUSTRY * ARPU_YEAR);
  const percent = ((users - MIN_USERS) / (MAX_USERS - MIN_USERS)) * 100;

  const bigRef = useRef<HTMLSpanElement | null>(null);
  const indRef = useRef<HTMLSpanElement | null>(null);
  const badgeRef = useRef<HTMLSpanElement | null>(null);
  const prevEarn = useRef(earnings);
  const prevInd = useRef(industry);
  const prevUsers = useRef(users);

  useEffect(() => {
    if (!bigRef.current) return;
    const el = bigRef.current;
    const c = animate(prevEarn.current, earnings, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `$${Math.round(v).toLocaleString()}`;
      },
    });
    prevEarn.current = earnings;
    return () => c.stop();
  }, [earnings]);

  useEffect(() => {
    if (!indRef.current) return;
    const el = indRef.current;
    const c = animate(prevInd.current, industry, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `$${Math.round(v).toLocaleString()}`;
      },
    });
    prevInd.current = industry;
    return () => c.stop();
  }, [industry]);

  useEffect(() => {
    if (!badgeRef.current) return;
    const el = badgeRef.current;
    const c = animate(prevUsers.current, users, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent =
          v >= 1_000_000
            ? `${(v / 1_000_000).toFixed(1)}M`
            : `${Math.round(v / 1000)}K`;
      },
    });
    prevUsers.current = users;
    return () => c.stop();
  }, [users]);

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start sm:items-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl font-semibold text-neutral-900 dark:text-white tracking-tight"
        >
          Turn your free tier into revenue.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 max-w-xl text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed"
        >
          Most freemium products convert under 0.2% of their free users. With
          smart in-product upgrade prompts, top teams push that past 1.5%
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 sm:mt-14 flex items-end justify-center"
        >
          <span
            ref={bigRef}
            className="text-[13vw] sm:text-[13vw] lg:text-[11vw] leading-none font-semibold tracking-tight text-sky-500 tabular-nums"
          >
            ${earnings.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-sm lg:text-base text-sky-500 mb-2 sm:mb-5">
            /Year
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-2 text-sm sm:text-base text-neutral-700 dark:text-neutral-300"
        >
          vs. industry baseline (0.2%) ={" "}
          <span
            ref={indRef}
            className="underline decoration-neutral-400 underline-offset-2 tabular-nums"
          >
            ${industry.toLocaleString()}
          </span>
          <sup>2</sup>
        </motion.p>

        <div className="mt-10 w-full max-w-xl">
          <div className="relative py-4">
            <div className="h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div
              className="absolute top-1/2 left-0 h-1 -mt-0.5 rounded-full bg-neutral-900 dark:bg-white"
              style={{ width: `${percent}%` }}
            />
            <div
              className="absolute top-1/2 -mt-2.5 -ml-2.5"
              style={{ left: `${percent}%` }}
            >
              <div className="relative">
                <span
                  ref={badgeRef}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium tabular-nums whitespace-nowrap"
                >
                  1.0M
                </span>
                <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white" />
              </div>
            </div>
            <input
              type="range"
              min={MIN_USERS}
              max={MAX_USERS}
              step={10_000}
              value={users}
              onChange={(e) => setUsers(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Free users"
            />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500">Free users</p>
        </div>
      </div>
    </section>
  );
}
