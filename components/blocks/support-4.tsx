"use client";

import { useState } from "react";
import {
  ArrowRight,
  FileText,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const TURNS = [
  {
    id: "t1",
    from: "bot" as const,
    body: "Hi Priya. I can look things up in your workspace and in the docs. What are you running into?",
  },
  {
    id: "t2",
    from: "user" as const,
    body: "Our Monday export came through with no rows in it.",
  },
  {
    id: "t3",
    from: "bot" as const,
    body: "Run 1104 finished at 06:00 and returned 0 rows. The saved view it uses was edited on Sunday at 17:41 and its date range is now a single day, which is the usual cause.",
    sources: [
      "Why an export can succeed with zero rows",
      "Editing a saved view used by a schedule",
    ],
  },
];

const QUICK = [
  "Restore the previous date range",
  "Re-run the export now",
  "Talk to a person",
];

export default function Support4() {
  const [message, setMessage] = useState("");
  const [handoff, setHandoff] = useState(false);

  return (
    <div className="flex h-full min-h-[640px] w-full items-center justify-center overflow-hidden bg-neutral-100 p-4 sm:p-6 dark:bg-neutral-900">
      <div className="flex h-full max-h-[560px] w-full max-w-[420px] flex-col rounded-[var(--rb-r-3xl,16px)] border border-neutral-200 bg-white p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
          >
            {handoff ? (
              <UserRound className="h-4 w-4 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]" />
            ) : (
              <Sparkles className="h-4 w-4 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              {handoff ? "Sofia Alvarez" : "Northwind Assistant"}
            </p>
            <p className="truncate text-[11px] text-neutral-500">
              {handoff
                ? "Support · typically replies in a few minutes"
                : "Answers from your workspace and the docs"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            className={cx(
              "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--rb-r-xl,12px)] bg-white dark:bg-neutral-900">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {TURNS.map((t) =>
              t.from === "user" ? (
                <div key={t.id} className="flex justify-end">
                  <p className="max-w-[80%] rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 py-2 text-[13px] leading-relaxed text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
                    {t.body}
                  </p>
                </div>
              ) : (
                <div key={t.id} className="max-w-[88%]">
                  <p className="rounded-[var(--rb-r-lg,10px)] bg-neutral-100 px-3 py-2 text-[13px] leading-relaxed text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    {t.body}
                  </p>
                  {t.sources && (
                    <ul className="mt-1.5 space-y-1">
                      {t.sources.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            className={cx(
                              "flex w-full cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] px-2 py-1.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800",
                              transition,
                              focus,
                            )}
                          >
                            <FileText
                              className="h-3 w-3 shrink-0 text-neutral-400"
                              aria-hidden
                            />
                            <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">
                              {s}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ),
            )}

            {handoff && (
              <div className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-950">
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  Sofia has joined and can see everything above. Ticket #4192
                  was created from this conversation.
                </p>
              </div>
            )}
          </div>

          <div className="p-1">
            {!handoff && (
              <div className="flex flex-wrap gap-1.5 px-1 pb-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => q === "Talk to a person" && setHandoff(true)}
                    className={cx(
                      "inline-flex h-7 cursor-pointer items-center gap-1 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-2 text-[12px] text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    {q}
                    {q === "Talk to a person" && (
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <label htmlFor="support-4-message" className="sr-only">
                Message
              </label>
              <textarea
                id="support-4-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder={
                  handoff ? "Message Sofia" : "Ask about your workspace"
                }
                className="w-full resize-none bg-transparent px-3 pt-2.5 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-2">
                <span className="pl-1 text-[11px] text-neutral-400">
                  {handoff
                    ? "Replies land in your email too"
                    : "AI answers, checked against your data"}
                </span>
                <button
                  type="button"
                  aria-label="Send message"
                  disabled={message.trim().length === 0}
                  className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] disabled:pointer-events-none disabled:opacity-40 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                    transition,
                    focus,
                  )}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
