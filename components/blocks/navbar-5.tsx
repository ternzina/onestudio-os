"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Cpu,
  Database,
  GitBranch,
  Hexagon,
  KeyRound,
  Menu,
  Radio,
  Terminal,
  Webhook,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const pop = (reduce: boolean | null) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 },
  animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
  exit: reduce
    ? { opacity: 0, transition: { duration: 0.12 } }
    : {
        opacity: 0,
        scale: 0.97,
        y: -4,
        transition: { duration: 0.12, ease: EASE_OUT },
      },
  transition: { duration: 0.18, ease: EASE_OUT },
});

type Item = { icon: typeof Cpu; label: string; hint: string };

const COLUMNS: Record<string, { title: string; items: Item[] }[]> = {
  Platform: [
    {
      title: "Build",
      items: [
        { icon: Terminal, label: "Runtime", hint: "Deploy in nine regions" },
        {
          icon: GitBranch,
          label: "Preview branches",
          hint: "One URL per pull request",
        },
        {
          icon: Webhook,
          label: "Webhooks",
          hint: "Signed, retried, replayable",
        },
      ],
    },
    {
      title: "Operate",
      items: [
        { icon: Radio, label: "Live metrics", hint: "Second-level resolution" },
        {
          icon: Database,
          label: "Managed data",
          hint: "Backups every six hours",
        },
        { icon: KeyRound, label: "Secrets", hint: "Scoped per environment" },
      ],
    },
  ],
  Solutions: [
    {
      title: "By team",
      items: [
        { icon: Cpu, label: "Platform teams", hint: "Golden paths, not gates" },
        {
          icon: BarChart3,
          label: "Data teams",
          hint: "Pipelines you can read",
        },
        { icon: Terminal, label: "Agencies", hint: "Ship client work faster" },
      ],
    },
    {
      title: "By stage",
      items: [
        { icon: GitBranch, label: "Startups", hint: "Free for the first year" },
        {
          icon: Database,
          label: "Scale-ups",
          hint: "Usage that grows with you",
        },
        { icon: KeyRound, label: "Enterprise", hint: "SSO, audit logs, DPA" },
      ],
    },
  ],
};

const FLAT = ["Docs", "Pricing"];

export default function Navbar5() {
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.("[data-menu-root]")) setMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [menu]);

  const open = (id: string) => {
    setMenu((m) => (m === id ? null : id));
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950"
    >
      <div className="relative z-20" data-menu-root>
        <header className="flex h-16 items-center gap-2 border-b border-neutral-200 px-4 sm:px-6 dark:border-neutral-800">
          <a
            href="#"
            className={cx(
              "inline-flex shrink-0 items-center gap-2 rounded-[var(--rb-r-md,8px)]",
              focus,
            )}
          >
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
            >
              <Hexagon className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
              Meridian
            </span>
          </a>

          <nav aria-label="Main" className="ml-4 hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {Object.keys(COLUMNS).map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={menu === key}
                    onClick={() => open(key)}
                    className={cx(
                      "inline-flex h-9 cursor-pointer items-center gap-1 rounded-[var(--rb-r-md,8px)] px-2.5 text-sm font-medium",
                      menu === key
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    {key}
                    <ChevronDown
                      aria-hidden
                      className={cx(
                        "h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ease-out motion-reduce:transition-none",
                        menu === key && "rotate-180",
                      )}
                    />
                  </button>
                </li>
              ))}
              {FLAT.map((f) => (
                <li key={f}>
                  <a
                    href="#"
                    className={cx(
                      "inline-flex h-9 items-center rounded-[var(--rb-r-md,8px)] px-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    {f}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a
              href="#"
              className={cx(
                "hidden h-9 items-center rounded-[var(--rb-r-md,8px)] px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              Sign in
            </a>
            <a
              href="#"
              className={cx(
                "inline-flex h-9 items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3.5 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                transition,
                focus,
              )}
            >
              Start building
              <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className={cx(
                "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-600 hover:bg-neutral-100 lg:hidden dark:text-neutral-300 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              {mobileOpen ? (
                <X className="h-4.5 w-4.5" />
              ) : (
                <Menu className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {menu && (
            <motion.div
              {...pop(reduce)}
              className="absolute inset-x-0 top-full z-30 hidden origin-top border-b border-neutral-200 bg-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.22)] lg:block dark:border-neutral-800 dark:bg-neutral-900"
            >
              <motion.div
                key={menu}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className="mx-auto max-w-[1000px] px-6 py-6"
              >
                <div className="grid grid-cols-2 gap-8">
                  {COLUMNS[menu].map((col) => (
                    <div key={col.title}>
                      <p className="px-2 text-[11px] font-medium tracking-[0.08em] text-neutral-400 uppercase">
                        {col.title}
                      </p>
                      <ul className="mt-2 space-y-0.5">
                        {col.items.map((it) => {
                          const Icon = it.icon;
                          return (
                            <li key={it.label}>
                              <a
                                href="#"
                                onClick={() => setMenu(null)}
                                className={cx(
                                  "flex items-start gap-2.5 rounded-[var(--rb-r-lg,10px)] p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                  transition,
                                  focus,
                                )}
                              >
                                <span
                                  aria-hidden
                                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                                    {it.label}
                                  </span>
                                  <span className="mt-0.5 block text-[12px] text-neutral-500">
                                    {it.hint}
                                  </span>
                                </span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-[var(--rb-r-xl,12px)] bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      Migrating from a self-hosted stack?
                    </p>
                    <p className="mt-0.5 text-[12px] text-neutral-500">
                      Our team will move your first three services for free.
                    </p>
                  </div>
                  <a
                    href="#"
                    onClick={() => setMenu(null)}
                    className={cx(
                      "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    Talk to us
                    <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-[620px] text-center">
          <h1 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-neutral-900 sm:text-[38px] dark:text-neutral-100">
            Infrastructure that stays out of the way
          </h1>
          <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-relaxed text-neutral-500">
            Push a branch, get an environment. Every service, region and secret
            managed from a single control plane.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-[820px] gap-3 sm:grid-cols-3">
          {["Regions", "Median cold start", "Uptime"].map((l, i) => (
            <div
              key={l}
              className="rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-[12px] text-neutral-500">{l}</p>
              <p className="mt-1 text-[22px] leading-none font-medium tracking-[-0.02em] text-neutral-900 tabular-nums dark:text-neutral-100">
                {["9", "34ms", "99.99%"][i]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-neutral-200 bg-white p-3 lg:hidden dark:border-neutral-800 dark:bg-neutral-950"
        >
          {Object.entries(COLUMNS).map(([key, cols]) => (
            <div key={key} className="mb-4">
              <p className="px-3 text-[11px] font-medium tracking-[0.08em] text-neutral-400 uppercase">
                {key}
              </p>
              <ul className="mt-1 space-y-0.5">
                {cols
                  .flatMap((c) => c.items)
                  .map((it) => (
                    <li key={it.label}>
                      <a
                        href="#"
                        onClick={() => setMobileOpen(false)}
                        className={cx(
                          "flex h-10 items-center rounded-[var(--rb-r-md,8px)] px-3 text-[13px] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900",
                          transition,
                          focus,
                        )}
                      >
                        {it.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
