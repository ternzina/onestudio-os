"use client";

import { useMemo, useState } from "react";
import { Check, Inbox } from "lucide-react";

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

type Item = {
  id: string;
  author: string;
  time: string;
  place: string;
  body: string;
  mention: boolean;
};

const ITEMS: Item[] = [
  {
    id: "n1",
    author: "Priya Nandakumar",
    time: "12m",
    place: "Q3 pricing model · Cell D14",
    body: "@amelia the enterprise tier still assumes the old seat minimum. Can you confirm before this goes to finance?",
    mention: true,
  },
  {
    id: "n2",
    author: "Marcus Bell",
    time: "1h",
    place: "Backfill runbook · Step 4",
    body: "Rewrote the rollback section so it no longer depends on the operator being on call.",
    mention: false,
  },
  {
    id: "n3",
    author: "Sofia Alvarez",
    time: "3h",
    place: "Onboarding redesign · Frame 12",
    body: "@amelia the empty state copy reads a little cold here. Suggested two alternates in the thread.",
    mention: true,
  },
  {
    id: "n4",
    author: "Wei Chen",
    time: "5h",
    place: "query.ts · Line 86",
    body: "Left a suggestion on the worker cap. Not blocking, but nice to land here.",
    mention: false,
  },
  {
    id: "n5",
    author: "Tomás Guerrero",
    time: "Yesterday",
    place: "Incident 4471 · Timeline",
    body: "Added the paging gap between 02:10 and 02:40. That is the part we should fix first.",
    mention: false,
  },
];

const TABS = ["All", "Unresolved", "Mentions"] as const;

export default function Comments5() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [resolved, setResolved] = useState<string[]>(["n5"]);

  const shown = useMemo(() => {
    if (tab === "Unresolved")
      return ITEMS.filter((i) => !resolved.includes(i.id));
    if (tab === "Mentions") return ITEMS.filter((i) => i.mention);
    return ITEMS;
  }, [tab, resolved]);

  const toggle = (id: string) =>
    setResolved((r) =>
      r.includes(id) ? r.filter((x) => x !== id) : [...r, id],
    );

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              <Inbox className="h-4 w-4 shrink-0" aria-hidden />
              Comment inbox
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">
              {ITEMS.length - resolved.length} unresolved across 5 documents
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter comments"
            className="flex shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800"
          >
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cx(
                  "h-7 cursor-pointer rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px]",
                  tab === t
                    ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={frame}>
          <div
            className={cx(
              panel,
              "max-h-[400px] overflow-hidden overflow-y-auto sm:max-h-none",
            )}
          >
            {shown.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
                <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  Nothing left here
                </p>
                <p className="text-[13px] text-neutral-500">
                  Every comment in this view has been resolved.
                </p>
              </div>
            ) : (
              shown.map((item) => {
                const isDone = resolved.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={cx(
                      "flex gap-3 px-4 py-3.5",
                      transition,
                      "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                    )}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {initials(item.author)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                          {item.author}
                        </p>
                        <span className="shrink-0 text-[12px] text-neutral-500">
                          {item.time}
                        </span>
                        {item.mention && !isDone && (
                          <span className="hidden h-5 shrink-0 items-center rounded-[var(--rb-r-xs,4px)] border border-neutral-200 px-1.5 text-[11px] text-neutral-600 sm:inline-flex dark:border-neutral-800 dark:text-neutral-300">
                            Mention
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                        {item.place}
                      </p>

                      <p
                        className={cx(
                          "mt-1.5 text-[13px] leading-relaxed",
                          isDone
                            ? "text-neutral-500 line-through decoration-neutral-300 dark:decoration-neutral-700"
                            : "text-neutral-700 dark:text-neutral-300",
                        )}
                      >
                        {item.body}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-pressed={isDone}
                      aria-label={
                        isDone
                          ? `Reopen comment from ${item.author}`
                          : `Resolve comment from ${item.author}`
                      }
                      onClick={() => toggle(item.id)}
                      className={cx(
                        "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] border",
                        isDone
                          ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                          : "border-neutral-200 text-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100",
                        transition,
                        focus,
                      )}
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
