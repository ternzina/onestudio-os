"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CHANNELS = ["Email", "Slack", "PagerDuty", "Webhook"];

const SAVED = {
  channel: "Slack",
  threshold: "5% / 5 min",
  enabled: true,
  note: "Page the on-call engineer when errors climb.",
};

function getFocusable(container: HTMLElement | null) {
  return Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
}

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: Math.ceil(scrollTop + clientHeight) < scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

export default function AppDialog5() {
  const body = useScrollFade<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [guardOpen, setGuardOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const keyboardOpenRef = useRef(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [channel, setChannel] = useState(SAVED.channel);
  const [threshold, setThreshold] = useState(SAVED.threshold);
  const [enabled, setEnabled] = useState(SAVED.enabled);
  const [note, setNote] = useState(SAVED.note);

  const dirty =
    channel !== SAVED.channel ||
    threshold !== SAVED.threshold ||
    enabled !== SAVED.enabled ||
    note !== SAVED.note;

  const drawerRef = useRef<HTMLDivElement>(null);
  const guardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(open);

  const requestClose = useCallback(() => {
    if (dirty) {
      setGuardOpen(true);
      return;
    }
    setOpen(false);
  }, [dirty]);

  const discardAndClose = () => {
    setGuardOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const surface = guardOpen ? guardRef.current : drawerRef.current;
    const doc = surface?.ownerDocument ?? document;

    (getFocusable(surface)[0] ?? surface)?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (guardOpen) setGuardOpen(false);
        else requestClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable(surface);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = doc.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [open, guardOpen, requestClose]);

  useEffect(() => {
    if (wasOpenRef.current && !open)
      triggerRef.current?.focus({ preventScroll: true });
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(id);
  }, [saved]);

  const openDrawer = () => {
    setChannel(SAVED.channel);
    setThreshold(SAVED.threshold);
    setEnabled(SAVED.enabled);
    setNote(SAVED.note);
    setGuardOpen(false);
    setSaved(false);
    setKeyboardOpen(keyboardOpenRef.current);
    setOpen(true);
  };

  const save = () => {
    setSaved(true);
    setOpen(false);
  };

  const drawerMotion =
    prefersReducedMotion || keyboardOpen
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.15 },
        }
      : {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: {
            x: "100%",
            transition: {
              duration: 0.22,
              ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
            },
          },
          transition: {
            duration: 0.32,
            ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
          },
        };

  return (
    <div className="relative flex h-full min-h-[640px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <button
        ref={triggerRef}
        type="button"
        onPointerDown={() => {
          keyboardOpenRef.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ")
            keyboardOpenRef.current = true;
        }}
        onClick={openDrawer}
        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
      >
        Edit alert rule
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="absolute inset-0 z-30 bg-neutral-950/40 backdrop-blur-[2px] dark:bg-neutral-950/60"
              onClick={requestClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="app-dialog-5-title"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 z-40 flex w-full max-w-md flex-col overflow-hidden rounded-l-[var(--rb-r-4xl,18px)] border-l border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
              {...drawerMotion}
            >
              <header className="flex h-14 shrink-0 items-center gap-3 bg-neutral-50 px-5 sm:px-6 dark:bg-neutral-900/60">
                <h2
                  id="app-dialog-5-title"
                  className="min-w-0 flex-1 truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100"
                >
                  Edit alert rule
                </h2>
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={requestClose}
                  className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-500 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                >
                  <X aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
              </header>

              <div className="relative min-h-0 flex-1">
                <div
                  ref={body.ref}
                  onScroll={body.onScroll}
                  className="h-full space-y-5 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
                >
                  <div className="space-y-1.5">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Rule name
                    </span>
                    <div className="flex h-9 items-center rounded-[var(--rb-r-md,8px)] bg-neutral-50 px-3 text-sm font-medium text-neutral-900 dark:bg-neutral-800/50 dark:text-neutral-100">
                      Error rate spike
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="app-dialog-5-channel"
                      className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
                    >
                      Deliver to
                    </label>
                    <div className="relative">
                      <select
                        id="app-dialog-5-channel"
                        value={channel}
                        onChange={(event) => setChannel(event.target.value)}
                        className="h-9 w-full appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                      >
                        {CHANNELS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="app-dialog-5-threshold"
                      className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
                    >
                      Trigger threshold
                    </label>
                    <input
                      id="app-dialog-5-threshold"
                      value={threshold}
                      onChange={(event) => setThreshold(event.target.value)}
                      className="h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="app-dialog-5-note"
                      className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
                    >
                      Note
                    </label>
                    <textarea
                      id="app-dialog-5-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      className="min-h-20 w-full resize-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Rule enabled
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
                        Turn off to pause without deleting.
                      </span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label="Rule enabled"
                      onClick={() => setEnabled((value) => !value)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))] ${
                        enabled
                          ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900 ${
                          enabled ? "translate-x-[18px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </label>
                </div>

                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900 ${
                    body.edges.start ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900 ${
                    body.edges.end ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              <footer className="flex shrink-0 flex-col-reverse gap-2 bg-neutral-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5 dark:bg-neutral-900/60">
                <button
                  type="button"
                  onClick={requestClose}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                >
                  Save changes
                </button>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guardOpen && (
          <>
            <motion.div
              className="absolute inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] dark:bg-neutral-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            />
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                ref={guardRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="app-dialog-5-guard-title"
                aria-describedby="app-dialog-5-guard-desc"
                tabIndex={-1}
                className="pointer-events-auto flex w-full max-w-sm origin-center flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.97 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1 }
                }
                exit={{
                  ...(prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.97 }),
                  transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
                }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                  <h2
                    id="app-dialog-5-guard-title"
                    className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100"
                  >
                    Discard your changes?
                  </h2>
                  <p
                    id="app-dialog-5-guard-desc"
                    className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400"
                  >
                    You&apos;ve edited this rule. Closing now loses what you
                    changed.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col-reverse gap-2 bg-neutral-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5 dark:bg-neutral-900/60">
                  <button
                    type="button"
                    onClick={() => setGuardOpen(false)}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    onClick={discardAndClose}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-red-600 px-4 text-sm font-medium text-white transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-red-700 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:w-auto dark:hover:bg-red-500"
                  >
                    Discard changes
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div
        aria-live="polite"
        className="pointer-events-none absolute bottom-4 left-4 right-4 z-[60] flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm"
      >
        {saved && (
          <div className="pointer-events-auto rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Rule updated
            </p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              Changes apply to the next alert.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
