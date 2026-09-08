"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Paperclip, Send } from "lucide-react";

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

const THREAD = [
  {
    id: "m1",
    from: "you" as const,
    name: "You",
    time: "Mon 09:12",
    body: "The Monday revenue export landed with headers but no rows. It ran at 06:00 as usual and the run log says it succeeded.",
    attachment: "export-log-1104.txt",
  },
  {
    id: "m2",
    from: "agent" as const,
    name: "Sofia Alvarez",
    time: "Mon 09:31",
    body: "Thanks for the log. The job completed against a filter that excluded every row, which is why it reported success. Was the saved view edited on Sunday?",
    attachment: null,
  },
  {
    id: "m3",
    from: "you" as const,
    name: "You",
    time: "Mon 10:04",
    body: "Yes, someone narrowed the date range to a single day while testing and left it that way.",
    attachment: null,
  },
  {
    id: "m4",
    from: "agent" as const,
    name: "Sofia Alvarez",
    time: "Mon 10:22",
    body: "That explains it. I have added a warning on scheduled runs that return zero rows, shipping this week. In the meantime the schedule will email you instead of writing an empty file.",
    attachment: null,
  },
  {
    id: "m5",
    from: "you" as const,
    name: "You",
    time: "Mon 11:15",
    body: "Restored the range and re-ran it, 14,208 rows this time. Is there a way to lock a saved view so a schedule cannot be changed underneath it?",
    attachment: null,
  },
  {
    id: "m6",
    from: "agent" as const,
    name: "Sofia Alvarez",
    time: "Mon 11:40",
    body: "Yes. Open the view, choose Lock for schedules, and edits then require an admin. I have attached the steps for your workspace.",
    attachment: "lock-a-saved-view.pdf",
  },
];

const TIMELINE = [
  { label: "Opened", value: "Mon 09:12" },
  { label: "First reply", value: "19m later" },
  { label: "Assigned to", value: "Sofia Alvarez" },
  { label: "Last update", value: "Mon 10:22" },
];

export default function Support3() {
  const [reply, setReply] = useState("");

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Scheduled export is empty
            </h2>
            <span className="inline-flex h-5 items-center rounded-[var(--rb-r-xs,4px)] border border-neutral-900 px-1.5 text-[11px] font-medium text-neutral-900 dark:border-neutral-100 dark:text-neutral-100">
              Awaiting your reply
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            Ticket #4192 · Reports and exports · Normal priority
          </p>
        </div>
        <button
          type="button"
          className={cx(
            "inline-flex h-8 w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-2.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
            transition,
            focus,
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Mark resolved
        </button>
      </div>

      <div className={cx(frame, "mt-3 flex min-h-0 flex-1 flex-col")}>
        <div className="grid min-h-0 flex-1 gap-1 lg:grid-cols-[1fr_240px]">
          <div className="flex min-h-[420px] min-w-0 flex-col gap-1 lg:min-h-0">
            <div
              className={cx(
                panel,
                "flex min-h-0 flex-1 flex-col overflow-hidden",
              )}
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {THREAD.map((m) => {
                  const mine = m.from === "you";
                  return (
                    <article key={m.id} className="flex gap-3">
                      <span
                        aria-hidden
                        className={cx(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] text-[11px] font-medium",
                          mine
                            ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
                        )}
                      >
                        {mine ? "You" : "SA"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                            {m.name}
                          </span>
                          {!mine && (
                            <span className="text-[11px] text-neutral-400">
                              Support
                            </span>
                          )}
                          <span className="ml-auto shrink-0 text-[11px] text-neutral-400">
                            {m.time}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                          {m.body}
                        </p>
                        {m.attachment && (
                          <span className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-2 text-[12px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                            <Paperclip className="h-3 w-3" aria-hidden />
                            {m.attachment}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <label htmlFor="support-3-reply" className="sr-only">
                Write a reply
              </label>
              <textarea
                id="support-3-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                placeholder="Reply to Sofia"
                className="w-full resize-none bg-transparent px-3 pt-2.5 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-2">
                <button
                  type="button"
                  aria-label="Attach a file"
                  className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={reply.trim().length === 0}
                  className={cx(
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[12px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] disabled:pointer-events-none disabled:opacity-40 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                    transition,
                    focus,
                  )}
                >
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  Send reply
                </button>
              </div>
            </div>
          </div>

          <aside className="flex max-h-[200px] flex-col gap-1 overflow-y-auto lg:max-h-none lg:overflow-visible">
            <div className={cx(panel, "p-4")}>
              <p className="text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
                Timeline
              </p>
              <dl className="mt-2.5 space-y-2">
                {TIMELINE.map((t) => (
                  <div key={t.label} className="flex justify-between gap-2">
                    <dt className="text-[12px] text-neutral-500">{t.label}</dt>
                    <dd className="text-[12px] text-neutral-900 dark:text-neutral-100">
                      {t.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={cx(panel, "p-4")}>
              <p className="text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
                Related article
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-900 dark:text-neutral-100">
                Why a scheduled export can succeed with zero rows
              </p>
              <button
                type="button"
                className={cx(
                  "mt-2.5 inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-2.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                Open article
              </button>
            </div>
            <div className={cx(panel, "flex items-start gap-2 p-4")}>
              <Lock
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400"
                aria-hidden
              />
              <p className="text-[12px] leading-relaxed text-neutral-500">
                Only workspace admins and the assigned agent can read this
                thread.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
