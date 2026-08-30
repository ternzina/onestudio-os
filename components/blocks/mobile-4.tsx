"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ChevronUp,
  CreditCard,
  House,
  LifeBuoy,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];

const TABS = [
  { id: "home", label: "Home", icon: House },
  { id: "orders", label: "Orders", icon: Package },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

const SHORTCUTS = [
  { label: "Shipments", icon: Truck, meta: "6 in transit" },
  { label: "Invoices", icon: Receipt, meta: "2 due" },
  { label: "Payments", icon: CreditCard, meta: "Up to date" },
  { label: "Team", icon: Users, meta: "9 members" },
];

const MORE = [
  { label: "Account settings", icon: Settings },
  { label: "Security and access", icon: ShieldCheck },
  { label: "Help centre", icon: LifeBuoy },
];

const ORDERS = [
  { id: "4192", who: "Northwind", meta: "Packed · 3 items" },
  { id: "4188", who: "Cedar Labs", meta: "In transit · 1 item" },
  { id: "4181", who: "Harbor Coffee", meta: "Delivered · 5 items" },
  { id: "4174", who: "Alder Group", meta: "Delivered · 2 items" },
  { id: "4169", who: "Meridian", meta: "Delivered · 4 items" },
  { id: "4162", who: "Northwind", meta: "Returned · 1 item" },
];

export default function Mobile4() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<"closed" | "peek" | "full">("closed");
  const rootRef = useRef<HTMLDivElement>(null);

  const open = sheet !== "closed";

  useEffect(() => {
    if (!open) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheet("closed");
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative flex h-full min-h-[680px] w-full justify-center overflow-hidden bg-white p-5 dark:bg-neutral-950">
      <div
        ref={rootRef}
        className="relative flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-5">
          <p className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Northwind Supply
          </p>
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            NS
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-24">
          <p className="text-[12px] font-medium tracking-[0.08em] text-neutral-400 uppercase">
            Recent orders
          </p>
          <ul className="mt-2 space-y-1">
            {ORDERS.map((o, i) => (
              <motion.li
                key={o.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.26,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : Math.min(i * 0.04, 0.2),
                }}
              >
                <button
                  type="button"
                  className={cx(
                    "flex min-h-[60px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white px-3.5 py-3 text-left hover:bg-neutral-50 active:scale-[0.995] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                      {o.who}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-neutral-500">
                      Order {o.id} · {o.meta}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600"
                  />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        <AnimatePresence>
          {open && (
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setSheet("closed")}
              initial={{ opacity: 0 }}
              animate={{ opacity: sheet === "full" ? 1 : 0.6 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.18, ease: EASE_OUT },
              }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="absolute inset-0 z-30 cursor-default bg-neutral-950/35 dark:bg-neutral-950/65"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="More destinations"
              initial={reduce ? { opacity: 0 } : { y: "100%", height: "46%" }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : { y: 0, height: sheet === "full" ? "82%" : "46%" }
              }
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.16 } }
                  : {
                      y: "100%",
                      transition: { duration: 0.22, ease: EASE_DRAWER },
                    }
              }
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { duration: 0.32, ease: EASE_DRAWER }
              }
              className="absolute inset-x-0 bottom-0 z-40 flex flex-col overflow-hidden rounded-t-[var(--rb-r-4xl,18px)] border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              style={reduce ? { height: "82%" } : undefined}
            >
              <button
                type="button"
                aria-label={sheet === "full" ? "Collapse menu" : "Expand menu"}
                aria-expanded={sheet === "full"}
                onClick={() => setSheet(sheet === "full" ? "peek" : "full")}
                className={cx(
                  "group flex h-9 w-full shrink-0 cursor-pointer items-center justify-center",
                  focus,
                )}
              >
                <span
                  aria-hidden
                  className="h-1 w-10 rounded-full bg-neutral-300 transition-colors duration-150 group-hover:bg-neutral-400 dark:bg-neutral-700 dark:group-hover:bg-neutral-600"
                />
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-2 gap-2">
                  {SHORTCUTS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.button
                        key={s.label}
                        type="button"
                        initial={
                          reduce ? { opacity: 0 } : { opacity: 0, y: 12 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          ease: EASE_OUT,
                          delay: reduce ? 0 : 0.06 + i * 0.035,
                        }}
                        className={cx(
                          "flex min-h-[76px] cursor-pointer flex-col items-start justify-between rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-3 text-left hover:bg-neutral-50 active:scale-[0.985] dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800",
                          transition,
                          focus,
                        )}
                      >
                        <Icon
                          aria-hidden
                          className="h-4 w-4 text-neutral-500"
                        />
                        <span>
                          <span className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                            {s.label}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-neutral-500">
                            {s.meta}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <ul className="mt-2 space-y-0.5">
                  {MORE.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <motion.li
                        key={m.label}
                        initial={
                          reduce ? { opacity: 0 } : { opacity: 0, y: 12 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          ease: EASE_OUT,
                          delay: reduce
                            ? 0
                            : 0.06 + (SHORTCUTS.length + i) * 0.035,
                        }}
                      >
                        <button
                          type="button"
                          className={cx(
                            "flex min-h-[48px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-xl,12px)] px-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            transition,
                            focus,
                          )}
                        >
                          <Icon
                            aria-hidden
                            className="h-4 w-4 shrink-0 text-neutral-500"
                          />
                          <span className="min-w-0 flex-1 truncate text-[14px] text-neutral-900 dark:text-neutral-100">
                            {m.label}
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          aria-label="Primary"
          className="relative z-20 flex shrink-0 items-stretch gap-0.5 border-t border-neutral-200 p-3 dark:border-neutral-800"
        >
          {TABS.map((t) => {
            const isActive = t.id === tab && !open;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setTab(t.id);
                  setSheet("closed");
                }}
                className={cx(
                  "relative flex min-h-[48px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--rb-r-3xl,16px)]",
                  transition,
                  focus,
                  isActive
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                )}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId={`${uid}-tab`}
                    transition={reduce ? { duration: 0 } : SPRING}
                    className="absolute inset-0 rounded-[var(--rb-r-3xl,16px)] bg-neutral-100 dark:bg-neutral-900"
                  />
                )}
                <Icon aria-hidden className="relative h-[18px] w-[18px]" />
                <span className="relative text-[10px] leading-none font-medium">
                  {t.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setSheet(open ? "closed" : "peek")}
            className={cx(
              "relative flex min-h-[48px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--rb-r-3xl,16px)]",
              transition,
              focus,
              open
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
            )}
          >
            {open && (
              <motion.span
                aria-hidden
                layoutId={`${uid}-tab`}
                transition={reduce ? { duration: 0 } : SPRING}
                className="absolute inset-0 rounded-[var(--rb-r-3xl,16px)] bg-neutral-100 dark:bg-neutral-900"
              />
            )}
            <motion.span
              aria-hidden
              animate={{ rotate: open && !reduce ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : SPRING}
              className="relative inline-flex"
            >
              <ChevronUp className="h-[18px] w-[18px]" />
            </motion.span>
            <span className="relative text-[10px] leading-none font-medium">
              More
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
