"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, CircleUserRound } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const RO = el.ownerDocument.defaultView?.ResizeObserver;
    const ro = RO ? new RO(update) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [update]);
  return { ref, edges, onScroll: update };
}

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const labelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const inputClass =
  "mt-1.5 h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxClass =
  "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[var(--rb-r-xs,4px)] border border-neutral-300 bg-white transition-colors duration-150 checked:border-neutral-900 checked:bg-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:checked:bg-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxBox =
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center";

const checkboxMark =
  "pointer-events-none absolute h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] opacity-0 transition-opacity duration-150 peer-checked:opacity-100 motion-reduce:transition-none dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]";

const ZONES = [
  { value: "lisbon", label: "Lisbon (GMT+0)", short: "Lisbon" },
  { value: "berlin", label: "Berlin (GMT+1)", short: "Berlin" },
  { value: "new-york", label: "New York (GMT−5)", short: "New York" },
  { value: "singapore", label: "Singapore (GMT+8)", short: "Singapore" },
];

export default function Onboarding1() {
  const body = useScrollFade<HTMLFormElement>();
  const [name, setName] = useState("Sam Rivera");
  const [title, setTitle] = useState("Product Engineer");
  const [zone, setZone] = useState("berlin");
  const [updates, setUpdates] = useState(true);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "-";

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <div className="relative flex min-w-0 flex-1 flex-col lg:max-w-[46%] lg:border-r lg:border-neutral-200 lg:dark:border-neutral-800">
        <form
          ref={body.ref}
          onScroll={body.onScroll}
          onSubmit={(e) => e.preventDefault()}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-10"
        >
          <h2 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
            Set up your profile
          </h2>
          <p className="mt-1.5 text-[13px] text-neutral-500 dark:text-neutral-400">
            Add the details teammates will see across the workspace.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600"
            >
              <CircleUserRound className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <button
                type="button"
                className={cx(
                  "inline-flex h-9 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                Upload photo
              </button>
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-500">
                PNG or JPG, at least 400 × 400 px, up to 10 MB.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="ob1-name" className={labelClass}>
                Full name
                <span aria-hidden="true" className="ml-1 text-neutral-400">
                  *
                </span>
              </label>
              <input
                id="ob1-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="ob1-title" className={labelClass}>
                Job title
              </label>
              <input
                id="ob1-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What you do"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="ob1-zone" className={labelClass}>
                Timezone
              </label>
              <div className="relative">
                <select
                  id="ob1-zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className={cx(
                    inputClass,
                    "cursor-pointer appearance-none pr-9",
                    zone === "" && "text-neutral-400 dark:text-neutral-500",
                  )}
                >
                  <option value="">Select a timezone</option>
                  {ZONES.map((z) => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 mt-[3px] h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <span className={checkboxBox}>
                <input
                  type="checkbox"
                  checked={updates}
                  onChange={(e) => setUpdates(e.target.checked)}
                  className={checkboxClass}
                />
                <Check
                  aria-hidden="true"
                  strokeWidth={3}
                  className={checkboxMark}
                />
              </span>
              <span className="text-[13px] text-neutral-600 dark:text-neutral-400">
                Send me product updates and workspace tips.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={name.trim() === ""}
            className={cx(
              "mt-8 inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            Continue
          </button>
        </form>
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
            body.edges.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
            body.edges.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <aside className="hidden min-w-0 flex-1 items-center justify-center bg-neutral-50 p-10 lg:flex dark:bg-neutral-900">
        <div className="w-full max-w-[320px]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Directory preview
          </p>

          <div className="mt-2 flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-3 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[13px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {name.trim() || "Your name"}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {title.trim() || "Job title"}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-1">
              <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <dt className="truncate text-[11px] text-neutral-500">
                  Timezone
                </dt>
                <dd className="mt-0.5 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                  {ZONES.find((z) => z.value === zone)?.short ?? "-"}
                </dd>
              </div>
              <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <dt className="truncate text-[11px] text-neutral-500">
                  Updates
                </dt>
                <dd className="mt-0.5 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                  {updates ? "Subscribed" : "Off"}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            This is how teammates will see you. You can change any of it later
            from your account settings.
          </p>
        </div>
      </aside>
    </div>
  );
}
