"use client";

import { useState } from "react";
import { Check, CornerUpLeft, GitPullRequest } from "lucide-react";

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

type Line = { no: number; kind: "context" | "add" | "del"; text: string };

const LINES: Line[] = [
  { no: 82, kind: "context", text: "  const pool = await getPool(region);" },
  { no: 83, kind: "context", text: "" },
  { no: 84, kind: "del", text: "  const rows = await pool.query(sql);" },
  { no: 85, kind: "add", text: "  const rows = await pool.query(sql, {" },
  { no: 86, kind: "add", text: "    timeout: 30_000," },
  { no: 87, kind: "add", text: "    maxWorkers: 8," },
  { no: 88, kind: "add", text: "  });" },
  { no: 89, kind: "context", text: "" },
  { no: 90, kind: "context", text: "  return rows.map(toRecord);" },
];

type Note = {
  id: string;
  author: string;
  time: string;
  body: string;
  suggestion?: string;
};

const NOTES: Note[] = [
  {
    id: "c1",
    author: "Wei Chen",
    time: "4h ago",
    body: "Hard-coding eight workers here will bite us when the pool size changes. Read it from the pool config so the two never drift apart.",
    suggestion: "maxWorkers: pool.size / 2,",
  },
  {
    id: "c2",
    author: "Priya Nandakumar",
    time: "2h ago",
    body: "Good catch. I also want the timeout to come from the same place, otherwise a slow region silently inherits the default.",
  },
];

export default function Comments3() {
  const [resolved, setResolved] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[820px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              <GitPullRequest className="h-4 w-4 shrink-0" aria-hidden />
              Cap backfill concurrency
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-neutral-500">
              packages/data/src/query.ts · 2 comments
            </p>
          </div>

          <button
            type="button"
            aria-pressed={resolved}
            onClick={() => setResolved(!resolved)}
            className={cx(
              "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border px-3 text-[13px] font-medium",
              resolved
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-neutral-200 text-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            {resolved ? "Resolved" : "Resolve thread"}
          </button>
        </div>

        <div className={cx(frame, "space-y-1")}>
          <div
            className={cx(
              panel,
              "max-h-[200px] overflow-hidden overflow-y-auto sm:max-h-none",
            )}
          >
            <pre className="overflow-x-auto py-2 font-mono text-[12px] leading-[1.7]">
              {LINES.map((line) => (
                <div
                  key={line.no}
                  className={cx(
                    "flex gap-3 px-3",
                    line.kind === "add" && "bg-neutral-100 dark:bg-neutral-900",
                    line.kind === "del" &&
                      "bg-neutral-50 text-neutral-400 line-through decoration-neutral-300 dark:bg-neutral-900/40 dark:decoration-neutral-700",
                  )}
                >
                  <span className="w-8 shrink-0 text-right text-neutral-400 tabular-nums select-none">
                    {line.no}
                  </span>
                  <span
                    aria-hidden
                    className="w-2 shrink-0 text-neutral-400 select-none"
                  >
                    {line.kind === "add" ? "+" : line.kind === "del" ? "-" : ""}
                  </span>
                  <span
                    className={cx(
                      "whitespace-pre",
                      line.kind === "context"
                        ? "text-neutral-600 dark:text-neutral-400"
                        : "text-neutral-900 dark:text-neutral-100",
                    )}
                  >
                    {line.text || " "}
                  </span>
                </div>
              ))}
            </pre>
          </div>

          <div
            className={cx(
              panel,
              "max-h-[260px] divide-y divide-transparent overflow-y-auto sm:max-h-none",
            )}
          >
            {NOTES.map((note) => (
              <article key={note.id} className="flex gap-3 px-4 py-3.5">
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {initials(note.author)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {note.author}
                    <span className="ml-2 font-normal text-neutral-500">
                      {note.time}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {note.body}
                  </p>

                  {note.suggestion && (
                    <div className="mt-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                      <p className="px-3 pt-2 text-[11px] text-neutral-500">
                        Suggested change
                      </p>
                      <pre className="overflow-x-auto px-3 pt-1 pb-2 font-mono text-[12px] whitespace-pre text-neutral-900 dark:text-neutral-100">
                        {note.suggestion}
                      </pre>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-start gap-2 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
          <label htmlFor="comments-3-draft" className="sr-only">
            Reply to this thread
          </label>
          <input
            id="comments-3-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply to this thread"
            className="h-8 min-w-0 flex-1 bg-transparent px-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
          />
          <button
            type="button"
            disabled={draft.trim().length === 0}
            className={cx(
              "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-neutral-900 px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-neutral-100 dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
              "hover:bg-neutral-800 dark:hover:bg-white",
              "disabled:pointer-events-none disabled:opacity-40",
              transition,
              focus,
            )}
          >
            <CornerUpLeft className="h-3.5 w-3.5" aria-hidden />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
