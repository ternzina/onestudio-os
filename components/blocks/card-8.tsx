"use client";

import { useState } from "react";
import {
  Check,
  Download,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "flex w-full flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border bg-neutral-50 p-1 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

type Asset = {
  id: string;
  name: string;
  kind: string;
  size: string;
  updated: string;
  icon: LucideIcon;
};

const ASSETS: Asset[] = [
  {
    id: "a1",
    name: "Q3-narrative.pdf",
    kind: "Document",
    size: "2.4 MB",
    updated: "2h ago",
    icon: FileText,
  },
  {
    id: "a2",
    name: "cap-table.xlsx",
    kind: "Spreadsheet",
    size: "480 KB",
    updated: "Yesterday",
    icon: FileSpreadsheet,
  },
  {
    id: "a3",
    name: "brand-mark.svg",
    kind: "Vector",
    size: "16 KB",
    updated: "3d ago",
    icon: FileImage,
  },
  {
    id: "a4",
    name: "walkthrough.mp4",
    kind: "Video",
    size: "184 MB",
    updated: "3d ago",
    icon: FileVideo,
  },
  {
    id: "a5",
    name: "board-deck.key",
    kind: "Presentation",
    size: "31 MB",
    updated: "1w ago",
    icon: Presentation,
  },
  {
    id: "a6",
    name: "schema.prisma",
    kind: "Source",
    size: "9 KB",
    updated: "1w ago",
    icon: FileCode2,
  },
  {
    id: "a7",
    name: "hero-still.png",
    kind: "Image",
    size: "6.1 MB",
    updated: "2w ago",
    icon: FileImage,
  },
  {
    id: "a8",
    name: "policy-v4.pdf",
    kind: "Document",
    size: "1.1 MB",
    updated: "3w ago",
    icon: FileText,
  },
];

export default function Card8() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["a1"]));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = selected.size;

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="flex h-9 shrink-0 items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[13px] tabular-nums text-neutral-600 dark:text-neutral-400">
          {count > 0 ? (
            <>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {count} selected
              </span>{" "}
              of {ASSETS.length} files
            </>
          ) : (
            <>{ASSETS.length} files</>
          )}
        </p>

        <button
          type="button"
          disabled={count === 0}
          onClick={() => setSelected(new Set())}
          className={cx(
            "inline-flex h-9 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] px-3 text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
            transition,
            focus,
          )}
        >
          Clear
        </button>
        <button
          type="button"
          disabled={count === 0}
          className={cx(
            "inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
            transition,
            focus,
          )}
        >
          <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
          Download
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ASSETS.map((asset) => {
          const Icon = asset.icon;
          const isSelected = selected.has(asset.id);

          return (
            <li key={asset.id} className="flex">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(asset.id)}
                className={cx(
                  frame,
                  "cursor-pointer text-left active:scale-[0.99]",
                  isSelected
                    ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                    : "border-neutral-200/70 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700",
                  transition,
                  focus,
                )}
              >
                <span
                  className={cx(
                    panel,
                    "relative flex h-24 items-center justify-center",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="h-7 w-7 text-neutral-400 dark:text-neutral-600"
                  />
                  <span
                    aria-hidden="true"
                    className={cx(
                      "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-[var(--rb-r-sm,6px)] border",
                      isSelected
                        ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-neutral-100 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "border-neutral-300 text-transparent dark:border-neutral-700",
                      transition,
                    )}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                </span>

                <span className={cx(panel, "flex min-w-0 flex-1 flex-col p-3")}>
                  <span className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {asset.name}
                  </span>
                  <span className="mt-0.5 truncate text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                    {asset.kind} · {asset.size}
                  </span>
                  <span className="mt-2 truncate text-[11px] text-neutral-500 dark:text-neutral-500">
                    Edited {asset.updated}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
