"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, Plus, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const fieldClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const ROLES = ["Member", "Admin", "Viewer"];

let nextId = 3;

export default function Onboarding5() {
  const [rows, setRows] = useState([
    { id: 1, email: "priya@northwind.co", role: "Admin" },
    { id: 2, email: "", role: "Member" },
  ]);
  const [copied, setCopied] = useState(false);

  const update = (id: number, patch: Partial<(typeof rows)[number]>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const filled = rows.filter((r) => r.email.trim()).length;

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto my-auto w-full max-w-[560px]">
        <h2 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
          Invite your team
        </h2>
        <p className="mt-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
          Invitations stay open for 14 days. Anyone you add can be removed
          later.
        </p>

        <div className="mt-6 flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Invite link
              </p>
              <button
                type="button"
                onClick={() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                }}
                className={cx(
                  "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                  transition,
                  focus,
                )}
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 truncate rounded-[var(--rb-r-sm,6px)] bg-neutral-50 px-2 py-1.5 text-xs text-neutral-500 dark:bg-neutral-900">
              northwind.app/join/9f2c-41ab
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            {rows.map((row, i) => (
              <div key={row.id} className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  {i === 0 && (
                    <label
                      htmlFor={`ob5-email-${row.id}`}
                      className="mb-1.5 block text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
                    >
                      Email address
                    </label>
                  )}
                  <input
                    id={`ob5-email-${row.id}`}
                    type="email"
                    value={row.email}
                    onChange={(e) => update(row.id, { email: e.target.value })}
                    placeholder="teammate@company.com"
                    className={fieldClass}
                  />
                </div>

                <div className="w-[120px] shrink-0">
                  {i === 0 && (
                    <label
                      htmlFor={`ob5-role-${row.id}`}
                      className="mb-1.5 block text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
                    >
                      Role
                    </label>
                  )}
                  <div className="relative">
                    <select
                      id={`ob5-role-${row.id}`}
                      value={row.role}
                      onChange={(e) => update(row.id, { role: e.target.value })}
                      className={cx(
                        fieldClass,
                        "cursor-pointer appearance-none pr-8",
                      )}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) => prev.filter((r) => r.id !== row.id))
                  }
                  disabled={rows.length === 1}
                  aria-label="Remove invitation"
                  className={cx(
                    "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setRows((prev) => [
                  ...prev,
                  { id: nextId++, email: "", role: "Member" },
                ])
              }
              className={cx(
                "inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-3 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                transition,
                focus,
              )}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add another
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            className={cx(
              "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            Skip for now
          </button>
          <button
            type="button"
            disabled={filled === 0}
            className={cx(
              "inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            {filled > 0
              ? `Send ${filled} invitation${filled > 1 ? "s" : ""}`
              : "Send invitations"}
          </button>
        </div>
      </div>
    </div>
  );
}
