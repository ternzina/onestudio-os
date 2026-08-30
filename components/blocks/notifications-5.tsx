"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Info,
  RotateCcw,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

type Tone = "info" | "warning" | "error" | "success" | "usage";

const ICONS: Record<Tone, typeof Info> = {
  info: Info,
  warning: TriangleAlert,
  error: CircleAlert,
  success: CircleCheck,
  usage: Zap,
};

const TONE: Record<Tone, string> = {
  info: "text-neutral-500 dark:text-neutral-400",
  warning: "text-amber-600 dark:text-amber-500",
  error: "text-red-600 dark:text-red-400",
  success: "text-emerald-600 dark:text-emerald-500",
  usage: "text-neutral-500 dark:text-neutral-400",
};

type Banner = {
  id: string;
  tone: Tone;
  title: string;
  body: string;
  action?: string;
  quiet?: string;
  details?: string[];
  meter?: { used: number; limit: number; unit: string };
};

const SEED: Banner[] = [
  {
    id: "b1",
    tone: "info",
    title: "Scheduled maintenance on Sunday",
    body: "Halcyon will be read-only from 02:00 to 04:00 UTC while we migrate the ingest cluster.",
    quiet: "Read the notice",
  },
  {
    id: "b2",
    tone: "warning",
    title: "Your card expires in 6 days",
    body: "Renewal for Cedar Labs is due on 12 November. Update the payment method to avoid an interruption.",
    action: "Update card",
    quiet: "Remind me later",
  },
  {
    id: "b3",
    tone: "error",
    title: "3 of 5 imports failed",
    body: "The Northwind sync stopped after repeated schema errors. Nothing was written for the failed files.",
    action: "Retry failed",
    details: [
      "contacts-oct.csv: unmapped column at row 118",
      "accounts-eu.csv: duplicate primary key 'NW-4471'",
      "deals-q3.csv: date parsed outside the allowed range",
    ],
  },
  {
    id: "b4",
    tone: "success",
    title: "meridian.example is verified",
    body: "DNS records propagated and the certificate was issued. Outbound mail now sends from this domain.",
    quiet: "View DNS",
  },
  {
    id: "b5",
    tone: "usage",
    title: "You have used 84% of your monthly events",
    body: "At the current rate the workspace reaches its limit around 26 November.",
    action: "Increase limit",
    meter: { used: 4.2, limit: 5, unit: "M events" },
  },
];

export default function Notifications5() {
  const reduce = useReducedMotion();
  const [banners, setBanners] = useState<Banner[]>(SEED);
  const [open, setOpen] = useState<string | null>(null);

  const dismiss = (id: string) =>
    setBanners((prev) => prev.filter((b) => b.id !== id));

  return (
    <div className="relative flex h-full min-h-[620px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <div>
          <h2 className="text-[15px] font-medium text-neutral-900 dark:text-white">
            System messages
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
            Persistent banners for account, billing and platform state.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setBanners(SEED);
            setOpen(null);
          }}
          disabled={banners.length === SEED.length}
          className={cx(
            "inline-flex h-8 items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
            "hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-neutral-900",
            transition,
            focus,
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Restore all
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {banners.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-[13px] text-neutral-900 dark:text-white">
              No messages
            </p>
            <p className="max-w-[30ch] text-[13px] text-neutral-500 dark:text-neutral-400">
              Dismissed banners do not come back unless the condition repeats.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {banners.map((b) => {
                const Icon = ICONS[b.tone];
                const expanded = open === b.id;
                return (
                  <motion.li
                    key={b.id}
                    layout={reduce ? false : "position"}
                    initial={false}
                    exit={
                      reduce
                        ? undefined
                        : { opacity: 0, height: 0, marginTop: 0 }
                    }
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="flex gap-3">
                        <span className={cx("mt-0.5 shrink-0", TONE[b.tone])}>
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                            {b.title}
                          </p>
                          <p className="mt-1 max-w-[68ch] text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
                            {b.body}
                          </p>

                          {b.meter && (
                            <div className="mt-3 max-w-[320px]">
                              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <motion.div
                                  initial={reduce ? false : { scaleX: 0 }}
                                  animate={{
                                    scaleX: b.meter.used / b.meter.limit,
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                  }}
                                  className="h-full origin-left rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                                />
                              </div>
                              <p className="mt-1.5 text-[12px] text-neutral-500 tabular-nums dark:text-neutral-400">
                                {b.meter.used} of {b.meter.limit} {b.meter.unit}
                              </p>
                            </div>
                          )}

                          {b.details && (
                            <>
                              <button
                                type="button"
                                onClick={() => setOpen(expanded ? null : b.id)}
                                aria-expanded={expanded}
                                className={cx(
                                  "mt-2 inline-flex items-center gap-1 rounded-[var(--rb-r-sm,6px)] text-[13px] text-neutral-700 dark:text-neutral-300",
                                  "hover:text-neutral-900 dark:hover:text-white",
                                  transition,
                                  focus,
                                )}
                              >
                                {expanded ? "Hide details" : "Show details"}
                                <ChevronDown
                                  className={cx(
                                    "h-3.5 w-3.5 transition-transform duration-150",
                                    expanded && "rotate-180",
                                  )}
                                  strokeWidth={1.75}
                                />
                              </button>
                              <AnimatePresence initial={false}>
                                {expanded && (
                                  <motion.div
                                    initial={
                                      reduce ? false : { height: 0, opacity: 0 }
                                    }
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={
                                      reduce
                                        ? undefined
                                        : { height: 0, opacity: 0 }
                                    }
                                    transition={{
                                      duration: 0.2,
                                      ease: "easeOut",
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <ul className="mt-2 space-y-px overflow-hidden rounded-[var(--rb-r-md,8px)] bg-neutral-200/70 dark:bg-neutral-800">
                                      {b.details.map((d) => (
                                        <li
                                          key={d}
                                          className="bg-neutral-50 px-3 py-2 font-mono text-[12px] text-neutral-600 dark:bg-neutral-950 dark:text-neutral-400"
                                        >
                                          {d}
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {b.action && (
                              <button
                                type="button"
                                className={cx(
                                  "inline-flex h-8 items-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
                                  "hover:bg-neutral-800 dark:hover:bg-neutral-200",
                                  transition,
                                  focus,
                                )}
                              >
                                {b.action}
                              </button>
                            )}
                            {b.quiet && (
                              <button
                                type="button"
                                onClick={() => dismiss(b.id)}
                                className={cx(
                                  "inline-flex h-8 items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
                                  "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                                  transition,
                                  focus,
                                )}
                              >
                                {b.quiet}
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => dismiss(b.id)}
                          aria-label={`Dismiss: ${b.title}`}
                          className={cx(
                            "-mt-1 -mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-400 dark:text-neutral-500",
                            "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white",
                            transition,
                            focus,
                          )}
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
