"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950";
const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900";

const SCORES = Array.from({ length: 11 }, (_, i) => i);

const REASONS = [
  "It is fast",
  "It replaced other tools",
  "Support helped",
  "Pricing works for us",
  "Missing a feature",
  "Too hard to learn",
];

const prompt = (score: number | null) => {
  if (score === null) return "";
  if (score >= 9) return "What made it worth recommending?";
  if (score >= 7) return "What would move you to a nine or ten?";
  return "What let you down most?";
};

export default function Feedback2() {
  const [score, setScore] = useState<number | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const toggle = (r: string) =>
    setReasons((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[620px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] tracking-[0.08em] text-neutral-500 uppercase">
              Quarterly survey
            </p>
            <h2 className="mt-1 text-[17px] font-medium tracking-[-0.01em] text-neutral-900 sm:text-xl dark:text-neutral-100">
              How likely are you to recommend Northwind to a colleague?
            </h2>
          </div>
          <button
            type="button"
            aria-label="Dismiss survey"
            className={cx(
              "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className={cx(frame, "mt-5")}>
            <div className={cx(panel, "flex items-start gap-3 p-5")}>
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 dark:border-neutral-800"
              >
                <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                  Recorded, thank you
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                  Your score of {score} goes to the product team with this
                  quarter&apos;s results. We will not ask again for 90 days.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              role="radiogroup"
              aria-label="Score from 0 to 10"
              className={cx(
                frame,
                "mt-5 grid grid-cols-6 gap-1 sm:grid-cols-11",
              )}
            >
              {SCORES.map((n) => {
                const active = score === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setScore(n)}
                    className={cx(
                      "inline-flex h-11 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] border text-[14px] font-medium tabular-nums",
                      active
                        ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "border-neutral-200/70 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-[12px] text-neutral-500">
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>

            <div
              className={cx(
                "mt-5",
                score === null && "pointer-events-none opacity-40",
              )}
              aria-hidden={score === null}
            >
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                {score === null ? "Pick a score to continue" : prompt(score)}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {REASONS.map((r) => {
                  const active = reasons.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(r)}
                      className={cx(
                        "inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border px-2.5 text-[12px] font-medium",
                        active
                          ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                          : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
                        transition,
                        focus,
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              <label htmlFor="feedback-2-note" className="sr-only">
                Anything else
              </label>
              <textarea
                id="feedback-2-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Anything else worth adding (optional)"
                className="mt-3 w-full resize-none rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] text-neutral-500">
                One question, and we will not ask again for 90 days.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={cx(
                    "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] px-3 text-[13px] font-medium whitespace-nowrap text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  Ask me later
                </button>
                <button
                  type="button"
                  disabled={score === null}
                  onClick={() => setSent(true)}
                  className={cx(
                    "inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium whitespace-nowrap text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] disabled:pointer-events-none disabled:opacity-40 sm:flex-none dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                    transition,
                    focus,
                  )}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
