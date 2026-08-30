"use client";

import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";
const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

type Note = {
  id: string;
  author: string;
  time: string;
  body: string;
  quote: string;
  resolved: boolean;
};

const NOTES: Note[] = [
  {
    id: "n1",
    author: "Sofia Alvarez",
    time: "3h ago",
    body: "This promise is stronger than what the contract actually covers. Legal asked us to say response time, not resolution time.",
    quote: "resolved within four hours",
    resolved: false,
  },
  {
    id: "n2",
    author: "Marcus Bell",
    time: "2h ago",
    body: "Can we name the regions here? Customers on the Frankfurt cluster keep asking whether the guarantee applies to them.",
    quote: "every supported region",
    resolved: false,
  },
  {
    id: "n3",
    author: "Priya Nandakumar",
    time: "1h ago",
    body: "Fixed the figure and linked the status page in the footer.",
    quote: "99.9 percent uptime",
    resolved: true,
  },
];

const PARAGRAPHS: { text: string; noteId?: string }[] = [
  {
    text: "Northwind commits to keeping the platform available and responsive for every customer on a paid plan. This document sets out what we measure, how we report it, and what happens when we fall short.",
  },
  {
    text: "We target 99.9 percent uptime",
    noteId: "n3",
  },
  {
    text: " measured monthly across the API, the dashboard, and the webhook delivery pipeline. Scheduled maintenance is announced at least five business days in advance and does not count against the target.",
  },
  {
    text: "Support requests raised through the console are acknowledged within one hour and resolved within four hours",
    noteId: "n1",
  },
  {
    text: " during business hours. Outside those hours an on-call engineer is paged for anything that blocks production traffic.",
  },
  {
    text: "The guarantee applies in every supported region",
    noteId: "n2",
  },
  {
    text: ", and credits are issued automatically against the following invoice when a monthly target is missed.",
  },
  {
    text: " Credits are capped at thirty percent of the monthly fee and are applied without the customer having to ask for them. A customer who believes a target was missed can open a claim for up to sixty days after the affected month closes.",
  },
  {
    text: " We publish a monthly report on the status page with the measured figures, a short note on any incident that consumed error budget, and the remediation work that followed it.",
  },
  {
    text: " Support is staffed between 08:00 and 20:00 in the customer's primary region, Monday through Friday, excluding public holidays observed at the registered billing address. Enterprise plans add weekend coverage for anything classified as severity one.",
  },
  {
    text: " Either party may propose changes to this document. Changes take effect at the start of the following billing period, and customers are notified at least thirty days before an existing commitment is reduced.",
  },
];

export default function Comments2() {
  const [active, setActive] = useState("n1");
  const [resolved, setResolved] = useState<string[]>(
    NOTES.filter((n) => n.resolved).map((n) => n.id),
  );

  const toggleResolved = (id: string) =>
    setResolved((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );

  const open = NOTES.filter((n) => !resolved.includes(n.id)).length;

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1040px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Service commitment draft
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-neutral-500">
              <span
                className={cx(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  open
                    ? "bg-neutral-900 dark:bg-neutral-100"
                    : "bg-neutral-300 dark:bg-neutral-600",
                )}
              />
              {open} open comment{open === 1 ? "" : "s"} · {NOTES.length} total
            </p>
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className={frame}>
            <div
              className={cx(
                panel,
                "max-h-[380px] overflow-y-auto px-5 py-4 lg:max-h-none",
              )}
            >
              <p className="text-[13px] leading-[1.75] text-neutral-700 dark:text-neutral-300">
                {PARAGRAPHS.map((part, i) => {
                  if (!part.noteId) return <span key={i}>{part.text}</span>;
                  const isActive = active === part.noteId;
                  const isDone = resolved.includes(part.noteId);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActive(part.noteId as string)}
                      aria-label={`Show comment on "${part.text}"`}
                      className={cx(
                        "cursor-pointer rounded-[var(--rb-r-xs,4px)] px-0.5 text-left underline decoration-dotted underline-offset-4 [box-decoration-break:clone]",
                        isDone
                          ? "text-neutral-500 decoration-neutral-300 dark:decoration-neutral-700"
                          : isActive
                            ? "bg-neutral-200 text-neutral-900 decoration-solid decoration-neutral-900 dark:bg-neutral-700 dark:text-neutral-100 dark:decoration-neutral-100"
                            : "bg-neutral-100 text-neutral-900 decoration-neutral-400 dark:bg-neutral-800 dark:text-neutral-100",
                        transition,
                        focus,
                      )}
                    >
                      {part.text}
                    </button>
                  );
                })}
              </p>
            </div>
          </div>

          <aside className="hidden min-w-0 flex-col lg:flex">
            <p className="mb-2 px-1 text-[12px] text-neutral-500">Comments</p>
            <div className={cx(frame, "flex-1 space-y-1")}>
              {NOTES.map((note) => {
                const isActive = active === note.id;
                const isDone = resolved.includes(note.id);
                return (
                  <div
                    key={note.id}
                    className={cx(
                      panel,
                      "p-3",
                      isActive && "border-neutral-900 dark:border-neutral-100",
                      transition,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {initials(note.author)}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                        {note.author}
                      </p>
                      <span className="shrink-0 text-[12px] text-neutral-500">
                        {note.time}
                      </span>
                    </div>

                    <p className="mt-2 truncate border-l-2 border-neutral-200 pl-2 text-[12px] text-neutral-500 dark:border-neutral-700">
                      {note.quote}
                    </p>

                    <p
                      className={cx(
                        "mt-2 text-[13px] leading-relaxed",
                        isDone
                          ? "text-neutral-500 line-through decoration-neutral-300 dark:decoration-neutral-700"
                          : "text-neutral-700 dark:text-neutral-300",
                      )}
                    >
                      {note.body}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1">
                      <button
                        type="button"
                        aria-pressed={isDone}
                        onClick={() => toggleResolved(note.id)}
                        className={cx(
                          "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border px-2 text-[12px]",
                          isDone
                            ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                            : "border-neutral-200 text-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100",
                          transition,
                          focus,
                        )}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        {isDone ? "Resolved" : "Resolve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActive(note.id)}
                        className={cx(
                          "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] px-2 text-[12px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                          transition,
                          focus,
                        )}
                      >
                        Show in text
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className={cx(frame, "lg:hidden")}>
            <div
              className={cx(
                panel,
                "flex items-center justify-between gap-3 px-4 py-3",
              )}
            >
              <p className="flex min-w-0 items-center gap-2 text-[13px] text-neutral-500">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">
                  {open} open comment{open === 1 ? "" : "s"} on this draft
                </span>
              </p>
              <button
                type="button"
                className={cx(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
                  "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                  transition,
                  focus,
                )}
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
