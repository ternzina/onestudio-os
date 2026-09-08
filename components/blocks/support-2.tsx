"use client";

import { useState } from "react";
import { ChevronDown, FileText, Paperclip, X } from "lucide-react";

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

const field =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white";

const PRIORITIES = [
  { id: "low", label: "Low", eta: "2 business days" },
  { id: "normal", label: "Normal", eta: "8 hours" },
  { id: "urgent", label: "Urgent", eta: "1 hour" },
] as const;

const SUGGESTED = [
  "Scheduled export arrives with no rows",
  "Export runs but the file never lands in storage",
  "Column order changes between runs",
];

export default function Support2() {
  const [priority, setPriority] =
    useState<(typeof PRIORITIES)[number]["id"]>("normal");
  const [subject, setSubject] = useState("Scheduled export is empty");
  const [attached, setAttached] = useState(["export-log-1104.txt"]);

  const eta = PRIORITIES.find((p) => p.id === priority)?.eta;

  return (
    <div className="flex h-full min-h-[800px] w-full flex-col overflow-y-auto bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[820px]">
        <div className="min-w-0">
          <h2 className="text-[17px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Open a ticket
          </h2>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            The more detail you give us up front, the fewer round trips it
            takes.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_260px]">
          <div className={cx(frame)}>
            <div className={cx(panel, "space-y-4 p-4 sm:p-5")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="support-2-area"
                    className="block text-[12px] font-medium text-neutral-900 dark:text-neutral-100"
                  >
                    Area
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id="support-2-area"
                      defaultValue="exports"
                      className={cx(
                        field,
                        "cursor-pointer appearance-none pr-8",
                      )}
                    >
                      <option value="exports">Reports and exports</option>
                      <option value="billing">Billing and plans</option>
                      <option value="access">Accounts and access</option>
                      <option value="api">Integrations and API</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                      aria-hidden
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="support-2-workspace"
                    className="block text-[12px] font-medium text-neutral-900 dark:text-neutral-100"
                  >
                    Workspace
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id="support-2-workspace"
                      defaultValue="northwind"
                      className={cx(
                        field,
                        "cursor-pointer appearance-none pr-8",
                      )}
                    >
                      <option value="northwind">Northwind · Production</option>
                      <option value="northwind-stg">Northwind · Staging</option>
                      <option value="meridian">Meridian</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="support-2-subject"
                  className="block text-[12px] font-medium text-neutral-900 dark:text-neutral-100"
                >
                  Subject
                </label>
                <input
                  id="support-2-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={cx(field, "mt-1.5")}
                />
                {subject.trim().length > 3 && (
                  <div className="mt-2 rounded-[var(--rb-r-md,8px)] bg-neutral-50 p-1 dark:bg-neutral-950">
                    <p className="px-2 pt-1.5 pb-1 text-[11px] tracking-[0.06em] text-neutral-400 uppercase">
                      These may answer it already
                    </p>
                    <ul>
                      {SUGGESTED.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            className={cx(
                              "flex w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-sm,6px)] px-2 py-1.5 text-left hover:bg-white dark:hover:bg-neutral-900",
                              transition,
                              focus,
                            )}
                          >
                            <FileText
                              className="h-3 w-3 shrink-0 text-neutral-400"
                              aria-hidden
                            />
                            <span className="truncate text-[12px] text-neutral-700 dark:text-neutral-300">
                              {s}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <span className="block text-[12px] font-medium text-neutral-900 dark:text-neutral-100">
                  Priority
                </span>
                <div
                  role="radiogroup"
                  aria-label="Priority"
                  className="mt-1.5 flex items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800"
                >
                  {PRIORITIES.map((p) => {
                    const active = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPriority(p.id)}
                        className={cx(
                          "inline-flex h-7 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-[13px] font-medium",
                          active
                            ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                          transition,
                          focus,
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="support-2-detail"
                  className="block text-[12px] font-medium text-neutral-900 dark:text-neutral-100"
                >
                  What happened?
                </label>
                <textarea
                  id="support-2-detail"
                  rows={4}
                  placeholder="What you did, what you expected, and what happened instead."
                  className="mt-1.5 w-full resize-none rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className={cx(
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-2.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  <Paperclip className="h-3.5 w-3.5" aria-hidden />
                  Attach files
                </button>
                {attached.map((a) => (
                  <span
                    key={a}
                    className="inline-flex h-8 items-center gap-1 rounded-[var(--rb-r-md,8px)] bg-neutral-100 pr-1 pl-2.5 text-[12px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {a}
                    <button
                      type="button"
                      aria-label={`Remove ${a}`}
                      onClick={() =>
                        setAttached((prev) => prev.filter((x) => x !== a))
                      }
                      className={cx(
                        "inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[var(--rb-r-xs,4px)] text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
                        transition,
                        focus,
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={cx(
                    "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] px-3 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  Save draft
                </button>
                <button
                  type="button"
                  className={cx(
                    "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                    transition,
                    focus,
                  )}
                >
                  Submit ticket
                </button>
              </div>
            </div>
          </div>

          <aside className={cx(frame, "h-fit space-y-1")}>
            <div className={cx(panel, "p-4")}>
              <p className="text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
                First response
              </p>
              <p className="mt-1.5 text-lg font-medium tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                {eta}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">
                Based on your plan and the priority you selected.
              </p>
            </div>
            <div className={cx(panel, "p-4")}>
              <p className="text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
                Sent with your ticket
              </p>
              <ul className="mt-2 space-y-1.5 text-[12px] text-neutral-600 dark:text-neutral-400">
                <li className="flex justify-between gap-2">
                  <span>Plan</span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    Pro
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span>Region</span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    eu-west
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span>App version</span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    4.19.2
                  </span>
                </li>
              </ul>
            </div>
            <div className={cx(panel, "p-4")}>
              <p className="text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
                Before you send
              </p>
              <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-neutral-500">
                <li>
                  Name the report or schedule, not just the screen it appeared
                  on.
                </li>
                <li>
                  Include the run time and time zone if the problem is
                  intermittent.
                </li>
                <li>
                  Attach the run log rather than a screenshot of it where you
                  can.
                </li>
              </ul>
            </div>
            <div className={cx(panel, "p-4")}>
              <p className="text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
                Recent tickets
              </p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12px] text-neutral-700 dark:text-neutral-300">
                    Webhook retries stop
                  </span>
                  <span className="shrink-0 text-[11px] text-neutral-400">
                    Resolved
                  </span>
                </li>
                <li className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12px] text-neutral-700 dark:text-neutral-300">
                    Two invoices in March
                  </span>
                  <span className="shrink-0 text-[11px] text-neutral-400">
                    Open
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
