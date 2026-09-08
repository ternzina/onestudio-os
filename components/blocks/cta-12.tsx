"use client";

import { useRef, useState } from "react";
import { ArrowRight, Terminal } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const COMMAND = "npx atlas init";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const arrow: Variants = {
  hover: { x: 3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
};

export default function CTA12() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const startedRef = useRef(false);

  const startTyping = () => {
    if (startedRef.current || reduceMotion) return;
    startedRef.current = true;
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(i);
      if (i < COMMAND.length) {
        window.setTimeout(tick, 90 + Math.random() * 70);
      }
    };
    window.setTimeout(tick, 450);
  };

  const shown = reduceMotion ? COMMAND.length : typed;
  const isTyping = shown < COMMAND.length;

  return (
    <section className="relative w-full overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(23,23,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,23,23,0.06)_1px,transparent_1px)] [background-size:96px_96px] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_50%,transparent_25%,black_80%)] dark:[background-image:linear-gradient(to_right,rgba(245,245,245,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,245,245,0.05)_1px,transparent_1px)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px]">
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              onViewportEnter={startTyping}
              viewport={{ once: true, margin: "-80px" }}
              className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-28"
            >
              <motion.div variants={item} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="hidden font-mono text-sm text-neutral-300 sm:block dark:text-neutral-700"
                >
                  {"//"}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  <Terminal className="h-4 w-4 text-neutral-900 dark:text-white" />
                  Start building
                </span>
                <span
                  aria-hidden="true"
                  className="hidden font-mono text-sm text-neutral-300 sm:block dark:text-neutral-700"
                >
                  {"\\\\"}
                </span>
              </motion.div>

              <motion.h2
                variants={item}
                className="mt-8 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-950 sm:text-5xl md:text-6xl dark:text-white"
              >
                Ready when you are.
              </motion.h2>

              <motion.p
                variants={item}
                className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400"
              >
                Create a project and make your first call to the Atlas API in
                under a minute. 10,000 requests a month on the free tier: no
                credit card, no expiry.
              </motion.p>

              <motion.div
                variants={item}
                className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              >
                <motion.a
                  href="#"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900"
                >
                  Create free account
                  <motion.span variants={arrow} className="flex">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </motion.a>
                <motion.a
                  href="#"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900"
                >
                  Compare plans
                </motion.a>
              </motion.div>

              <motion.div
                variants={item}
                className="mt-10 inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-2.5 font-mono text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
              >
                <span className="text-neutral-400 dark:text-neutral-600">
                  $
                </span>
                <span className="whitespace-pre text-neutral-900 dark:text-neutral-100">
                  {COMMAND.slice(0, shown)}
                </span>
                <motion.span
                  aria-hidden="true"
                  animate={
                    reduceMotion || isTyping
                      ? { opacity: 1 }
                      : { opacity: [1, 1, 0, 0] }
                  }
                  transition={
                    reduceMotion || isTyping
                      ? { duration: 0 }
                      : {
                          duration: 1.1,
                          repeat: Infinity,
                          times: [0, 0.5, 0.5, 1],
                          ease: "linear",
                        }
                  }
                  className="-ml-1 h-3.5 w-[7px] bg-neutral-900 dark:bg-neutral-100"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
