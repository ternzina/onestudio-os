"use client";

import { useState } from "react";
import {
  Bug,
  Check,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  X,
} from "lucide-react";

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

const KINDS = [
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "issue", label: "Issue", icon: Bug },
  { id: "praise", label: "Praise", icon: Heart },
] as const;

type Kind = (typeof KINDS)[number]["id"];

const PLACEHOLDER: Record<Kind, string> = {
  idea: "What would you like the product to do?",
  issue: "What went wrong, and what did you expect instead?",
  praise: "What worked well? We pass these on to the team.",
};

export default function Feedback1() {
  const [kind, setKind] = useState<Kind>("idea");
  const [message, setMessage] = useState("");
  const [attached, setAttached] = useState(true);
  const [sent, setSent] = useState(false);

  const limit = 400;
  const remaining = limit - message.length;

  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center overflow-y-auto bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-900">
      <div className="w-full max-w-[420px] rounded-[var(--rb-r-3xl,16px)] border border-neutral-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] dark:border-neutral-800 dark:bg-neutral-950">
        {sent ? (
          <div className="px-4 py-12 text-center">
            <span
              aria-hidden
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 dark:border-neutral-800"
            >
              <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
            </span>
            <p className="mt-3 text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
              Thanks, that is on its way
            </p>
            <p className="mx-auto mt-1 max-w-[280px] text-[13px] leading-relaxed text-neutral-500">
              We read every note. If it needs a reply you will hear from us at
              your account address.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setMessage("");
              }}
              className={cx(
                "mt-5 inline-flex h-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              Send another
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 px-3 pt-3 pb-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  Send feedback
                </h2>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  Goes to the team that owns this screen.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close feedback"
                className={cx(
                  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              role="radiogroup"
              aria-label="Feedback type"
              className="flex items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800"
            >
              {KINDS.map(({ id, label, icon: Icon }) => {
                const active = kind === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setKind(id)}
                    className={cx(
                      "inline-flex h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-sm,6px)] text-[13px] font-medium",
                      active
                        ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <label htmlFor="feedback-1-message" className="sr-only">
                Your feedback
              </label>
              <textarea
                id="feedback-1-message"
                value={message}
                maxLength={limit}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={PLACEHOLDER[kind]}
                rows={4}
                className="w-full resize-none bg-transparent px-3 pt-3 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-2">
                <button
                  type="button"
                  onClick={() => setAttached((v) => !v)}
                  className={cx(
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] px-2 text-[12px] font-medium",
                    attached
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                  {attached ? "Screenshot attached" : "Attach a screenshot"}
                </button>
                <span
                  className="text-[12px] tabular-nums text-neutral-400"
                  aria-live="polite"
                >
                  {remaining}
                </span>
              </div>
            </div>

            <div className={cx(frame, "mt-2")}>
              <div className={cx(panel, "px-3 py-2.5")}>
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  Sent with your page URL, browser and workspace so we can
                  reproduce it. No page content is captured.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-1 pt-3 pb-1">
              <button
                type="button"
                className={cx(
                  "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] px-3 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={message.trim().length === 0}
                onClick={() => setSent(true)}
                className={cx(
                  "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] disabled:pointer-events-none disabled:opacity-40 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                  transition,
                  focus,
                )}
              >
                Send feedback
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
