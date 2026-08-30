"use client";

import { useState } from "react";
import { ChevronRight, Folder, Link2, Upload } from "lucide-react";

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

const CRUMBS = ["Northwind", "Brand", "2025 refresh"];

const FORMATS = ["PDF", "PNG", "JPG", "SVG", "FIG", "MP4"];

export default function EmptyState5() {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col overflow-y-auto bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-1">
          {CRUMBS.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700"
                  aria-hidden
                />
              )}
              <span
                className={cx(
                  "text-[13px]",
                  i === CRUMBS.length - 1
                    ? "font-medium text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500",
                )}
              >
                {c}
              </span>
            </span>
          ))}
        </nav>

        <div className={cx(frame, "mt-3 flex flex-1 flex-col")}>
          <div className={cx(panel, "flex flex-1 flex-col p-1")}>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
              }}
              className={cx(
                "flex flex-1 flex-col items-center justify-center rounded-[var(--rb-r-sm,6px)] border border-dashed px-6 py-10 text-center",
                transition,
                dragging
                  ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800"
                  : "border-neutral-300 dark:border-neutral-700",
              )}
            >
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 dark:border-neutral-800"
              >
                <Folder className="h-5 w-5 text-neutral-400" />
              </span>
              <h2 className="mt-4 text-[16px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                This folder is empty
              </h2>
              <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] leading-relaxed text-neutral-500">
                Drag files anywhere in this area, or add them from your
                computer. Everything here is shared with the Brand team.
              </p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className={cx(
                    "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                    transition,
                    focus,
                  )}
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  Upload files
                </button>
                <button
                  type="button"
                  className={cx(
                    "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  <Link2 className="h-3.5 w-3.5" aria-hidden />
                  Import from a link
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
                {FORMATS.map((f) => (
                  <span
                    key={f}
                    className="inline-flex h-6 items-center rounded-[var(--rb-r-sm,6px)] border border-neutral-200 px-2 text-[11px] tracking-[0.04em] text-neutral-500 dark:border-neutral-800"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 px-1 text-[12px] text-neutral-500">
          Up to 2 GB per file · 46 GB of 100 GB used in this workspace
        </p>
      </div>
    </div>
  );
}
