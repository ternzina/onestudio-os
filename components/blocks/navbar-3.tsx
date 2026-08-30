"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Book,
  Check,
  ChevronsUpDown,
  Globe,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
  Zap,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const surface =
  "rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] dark:border-neutral-800 dark:bg-neutral-900";

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

const menuItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-2.5 py-1.5 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

const selector =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] px-2 text-[13px] font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800";

const ORGS = ["Northwind", "Cedar Labs", "Harbor Coffee"];
const PROJECTS = ["web-app", "marketing-site", "billing-api", "mobile-client"];
const ENVS = ["Production", "Staging", "Preview"];

export default function Navbar3() {
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState<string | null>(null);
  const [org, setOrg] = useState(ORGS[0]);
  const [project, setProject] = useState(PROJECTS[0]);
  const [env, setEnv] = useState(ENVS[0]);
  const [projectQuery, setProjectQuery] = useState("");
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

  const visibleProjects = PROJECTS.filter((p) =>
    p.toLowerCase().includes(projectQuery.trim().toLowerCase()),
  );

  const divider = (
    <span
      aria-hidden
      className="px-0.5 text-neutral-300 select-none dark:text-neutral-600"
    >
      /
    </span>
  );

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[480px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950"
    >
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-1 border-b border-neutral-200 px-3 sm:px-4 dark:border-neutral-800">
        <div className="relative min-w-0" data-menu-root>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === "org"}
            onClick={() => open("org")}
            className={cx(selector, "max-w-[170px]", transition, focus)}
          >
            <span
              aria-hidden
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[10px] font-semibold text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
            >
              {org.charAt(0)}
            </span>
            <span className="truncate">{org}</span>
            <ChevronsUpDown
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-neutral-400"
            />
          </button>
          <AnimatePresence>
            {menu === "org" && (
              <motion.div
                {...pop(reduce)}
                role="menu"
                className={cx(
                  surface,
                  "absolute top-full left-0 z-30 mt-1.5 w-[220px] origin-top-left",
                )}
              >
                {ORGS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="menuitemradio"
                    aria-checked={o === org}
                    onClick={() => {
                      setOrg(o);
                      setMenu(null);
                    }}
                    className={cx(menuItem, transition, focus)}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      {o.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{o}</span>
                    {o === org && (
                      <Check aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>
                ))}
                <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                <button
                  type="button"
                  role="menuitem"
                  className={cx(menuItem, transition, focus)}
                >
                  <Plus aria-hidden className="h-3.5 w-3.5" />
                  Create organisation
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {divider}

        <div className="relative hidden min-w-0 sm:block" data-menu-root>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === "project"}
            onClick={() => open("project")}
            className={cx(selector, "max-w-[190px]", transition, focus)}
          >
            <Globe
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-neutral-400"
            />
            <span className="truncate">{project}</span>
            <ChevronsUpDown
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-neutral-400"
            />
          </button>
          <AnimatePresence>
            {menu === "project" && (
              <motion.div
                {...pop(reduce)}
                className={cx(
                  surface,
                  "absolute top-full left-0 z-30 mt-1.5 w-[240px] origin-top-left",
                )}
              >
                <div className="relative p-1">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                  />
                  <label htmlFor="navbar-3-project" className="sr-only">
                    Search projects
                  </label>
                  <input
                    id="navbar-3-project"
                    value={projectQuery}
                    onChange={(e) => setProjectQuery(e.target.value)}
                    placeholder="Find a project…"
                    className={cx(
                      "h-8 w-full rounded-[var(--rb-r-md,8px)] bg-neutral-100 pr-2.5 pl-8 text-[13px] text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-800 dark:text-neutral-100",
                      transition,
                      focus,
                    )}
                  />
                </div>
                {visibleProjects.length === 0 ? (
                  <p className="px-2.5 py-3 text-center text-[12px] text-neutral-500">
                    No project matches that name.
                  </p>
                ) : (
                  visibleProjects.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setProject(p);
                        setMenu(null);
                        setProjectQuery("");
                      }}
                      className={cx(menuItem, transition, focus)}
                    >
                      <span className="min-w-0 flex-1 truncate">{p}</span>
                      {p === project && (
                        <Check aria-hidden className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="hidden sm:inline">{divider}</span>

        <div className="relative hidden min-w-0 md:block" data-menu-root>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === "env"}
            onClick={() => open("env")}
            className={cx(selector, "max-w-[170px]", transition, focus)}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500"
            />
            <span className="truncate">{env}</span>
            <ChevronsUpDown
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-neutral-400"
            />
          </button>
          <AnimatePresence>
            {menu === "env" && (
              <motion.div
                {...pop(reduce)}
                role="menu"
                className={cx(
                  surface,
                  "absolute top-full left-0 z-30 mt-1.5 w-[190px] origin-top-left",
                )}
              >
                {ENVS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    role="menuitemradio"
                    aria-checked={e === env}
                    onClick={() => {
                      setEnv(e);
                      setMenu(null);
                    }}
                    className={cx(menuItem, transition, focus)}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600"
                    />
                    <span className="min-w-0 flex-1 truncate">{e}</span>
                    {e === env && (
                      <Check aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Documentation"
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Book className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cx(
              "ml-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2.5 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            <Zap aria-hidden className="h-3.5 w-3.5" />
            Upgrade
          </button>
          <div className="relative ml-1" data-menu-root>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu === "account"}
              aria-label="Account menu"
              onClick={() => open("account")}
              className={cx(
                "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
                transition,
                focus,
              )}
            >
              EM
            </button>
            <AnimatePresence>
              {menu === "account" && (
                <motion.div
                  {...pop(reduce)}
                  role="menu"
                  className={cx(
                    surface,
                    "absolute top-full right-0 z-30 mt-1.5 w-[210px] origin-top-right",
                  )}
                >
                  <div className="px-2.5 py-2">
                    <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      Elena Marsh
                    </p>
                    <p className="truncate text-[12px] text-neutral-500">
                      elena@northwind.co
                    </p>
                  </div>
                  <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(menuItem, transition, focus)}
                  >
                    <User aria-hidden className="h-3.5 w-3.5" />
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(menuItem, transition, focus)}
                  >
                    <Settings aria-hidden className="h-3.5 w-3.5" />
                    Account settings
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(menuItem, transition, focus)}
                  >
                    <LogOut aria-hidden className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <h2 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
          {project}
        </h2>
        <p className="mt-0.5 text-[13px] text-neutral-500">
          {org} · {env.toLowerCase()} deployment
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Deployments", value: "128" },
            { label: "Median build", value: "42s" },
            { label: "Last release", value: "6h ago" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-[12px] text-neutral-500">{s.label}</p>
              <p className="mt-1 text-[20px] leading-none font-medium tracking-[-0.02em] text-neutral-900 tabular-nums dark:text-neutral-100">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
