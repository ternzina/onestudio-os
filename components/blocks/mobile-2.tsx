"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Camera,
  CheckCircle2,
  ListTodo,
  Mic,
  Paperclip,
  Plus,
  Search,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.32 };
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const ACTIONS = [
  { id: "task", label: "New task", icon: ListTodo },
  { id: "note", label: "Voice note", icon: Mic },
  { id: "photo", label: "Photo", icon: Camera },
  { id: "file", label: "Attach file", icon: Paperclip },
];

const SEED = [
  { id: "s1", title: "Send the Northwind renewal quote", meta: "Due today" },
  { id: "s2", title: "Review Cedar Labs onboarding notes", meta: "Due today" },
  { id: "s3", title: "Approve the refund for order 4192", meta: "Tomorrow" },
  { id: "s4", title: "Draft the Q3 pipeline summary", meta: "Thursday" },
  { id: "s5", title: "Call Harbor Coffee about seat count", meta: "Friday" },
  { id: "s6", title: "Close out the Meridian pilot checklist", meta: "Friday" },
  { id: "s7", title: "Update the Q3 forecast assumptions", meta: "Next week" },
];

export default function Mobile2() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(SEED);
  const [seq, setSeq] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const add = (label: string) => {
    const id = `n${seq}`;
    setSeq(seq + 1);
    setRows([{ id, title: `${label} captured`, meta: "Just now" }, ...rows]);
    setOpen(false);
  };

  return (
    <div className="relative flex h-full min-h-[680px] w-full justify-center overflow-hidden bg-white p-5 dark:bg-neutral-950">
      <div
        ref={rootRef}
        className="relative flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
          <p className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Inbox
          </p>
          <button
            type="button"
            aria-label="Search"
            className={cx(
              "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Search className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28">
          <p className="text-[12px] font-medium tracking-[0.08em] text-neutral-400 uppercase">
            {rows.length} open
          </p>
          <ul className="mt-2 space-y-1">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((r) => (
                <motion.li
                  key={r.id}
                  layout={!reduce}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0.12 } }
                      : {
                          opacity: 0,
                          x: 12,
                          transition: { duration: 0.16, ease: EASE_OUT },
                        }
                  }
                  transition={reduce ? { duration: 0.15 } : SPRING}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setRows((prev) => prev.filter((x) => x.id !== r.id))
                    }
                    className={cx(
                      "group flex min-h-[56px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-xl,12px)] px-3 py-2.5 text-left hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-900 dark:active:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-400 group-hover:border-neutral-900 group-hover:text-neutral-900 dark:border-neutral-700 dark:group-hover:border-white dark:group-hover:text-white"
                    >
                      <CheckCircle2 className="h-3 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-neutral-900 dark:text-neutral-100">
                        {r.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-neutral-500">
                        {r.meta}
                      </span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {rows.length === 0 && (
            <p className="mt-10 text-center text-[13px] text-neutral-500">
              Everything is done. Add something with the button below.
            </p>
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.button
              type="button"
              aria-label="Close actions"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.16, ease: EASE_OUT },
              }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="absolute inset-0 z-30 cursor-default bg-white/70 backdrop-blur-[2px] dark:bg-neutral-950/70"
            />
          )}
        </AnimatePresence>

        <div className="absolute right-5 bottom-5 z-40 flex flex-col items-end gap-2">
          <AnimatePresence>
            {open && (
              <motion.ul
                key="actions"
                className="flex flex-col items-end gap-2"
                initial="hidden"
                animate="shown"
                exit="hidden"
              >
                {ACTIONS.map((a, i) => {
                  const Icon = a.icon;
                  const delay = reduce
                    ? 0
                    : (ACTIONS.length - 1 - i) * 0.035 + 0.02;
                  return (
                    <motion.li
                      key={a.id}
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, y: 12, scale: 0.9 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reduce
                          ? { opacity: 0, transition: { duration: 0.1 } }
                          : {
                              opacity: 0,
                              y: 8,
                              scale: 0.95,
                              transition: {
                                duration: 0.14,
                                ease: EASE_OUT,
                                delay: i * 0.02,
                              },
                            }
                      }
                      transition={
                        reduce ? { duration: 0.15 } : { ...SPRING, delay }
                      }
                      className="origin-bottom-right"
                    >
                      <button
                        type="button"
                        onClick={() => add(a.label)}
                        className={cx(
                          "flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-neutral-200 bg-white pr-2 pl-4 text-[13px] font-medium text-neutral-900 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.16)] hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                          transition,
                          focus,
                        )}
                      >
                        {a.label}
                        <span
                          aria-hidden
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>

          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close quick actions" : "Open quick actions"}
            onClick={() => setOpen((v) => !v)}
            className={cx(
              "inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] active:scale-[0.95] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
              transition,
              focus,
            )}
          >
            <motion.span
              aria-hidden
              animate={{ rotate: open && !reduce ? 45 : 0 }}
              transition={reduce ? { duration: 0 } : SPRING}
              className="inline-flex"
            >
              <Plus className="h-6 w-6" />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
