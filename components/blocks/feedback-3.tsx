"use client";

import { useState } from "react";
import { Star } from "lucide-react";

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

const LABELS = [
  "Not good",
  "Could be better",
  "Fine",
  "Good",
  "Excellent",
] as const;

const TAGS_POSITIVE = [
  "Fast reply",
  "Solved it first time",
  "Clear explanation",
  "Followed up",
];

const TAGS_NEGATIVE = [
  "Took too long",
  "Had to repeat myself",
  "Answer was unclear",
  "Not actually solved",
];

export default function Feedback3() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const shown = hover || rating;
  const options = rating >= 4 ? TAGS_POSITIVE : TAGS_NEGATIVE;

  const toggle = (t: string) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[520px]">
        <div className={cx(frame)}>
          <div className={cx(panel, "flex items-center gap-3 px-3 py-2.5")}>
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-[12px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              SA
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Sofia Alvarez closed your ticket
              </p>
              <p className="truncate text-[12px] text-neutral-500">
                #4192 · Export job stuck in queue · resolved in 3h 12m
              </p>
            </div>
          </div>
        </div>

        <h2 className="mt-5 text-center text-[17px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
          How was the support you received?
        </h2>

        <div
          role="radiogroup"
          aria-label="Rating out of five"
          className="mt-4 flex items-center justify-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} out of 5, ${LABELS[n - 1]}`}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => {
                setRating(n);
                setTags([]);
              }}
              className={cx(
                "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)]",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              <Star
                className={cx(
                  "h-6 w-6",
                  n <= shown
                    ? "fill-neutral-900 text-neutral-900 dark:fill-white dark:text-white"
                    : "text-neutral-300 dark:text-neutral-700",
                  transition,
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>

        <p
          className="mt-2 text-center text-[13px] text-neutral-500"
          aria-live="polite"
        >
          {shown ? LABELS[shown - 1] : "Tap a star to rate"}
        </p>

        <div
          className={cx(
            "mt-5",
            rating === 0 && "pointer-events-none opacity-40",
          )}
          aria-hidden={rating === 0}
        >
          <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            {rating >= 4 ? "What went well?" : "What should have gone better?"}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {options.map((t) => {
              const active = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(t)}
                  className={cx(
                    "inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border px-2.5 text-[12px] font-medium",
                    active
                      ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <label htmlFor="feedback-3-note" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="feedback-3-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add a comment for Sofia (optional)"
            className="mt-3 w-full resize-none rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white"
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            className={cx(
              "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] px-3 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            No thanks
          </button>
          <button
            type="button"
            disabled={rating === 0}
            className={cx(
              "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] disabled:pointer-events-none disabled:opacity-40 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            Send rating
          </button>
        </div>
      </div>
    </div>
  );
}
