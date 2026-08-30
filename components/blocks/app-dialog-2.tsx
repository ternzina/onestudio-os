"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PROJECT = "atlas-production";

const RESOURCES = [
  { label: "Deployments", value: "1,204" },
  { label: "Environment variables", value: "38" },
  { label: "Custom domains", value: "3" },
  { label: "Team members", value: "11" },
];

function getFocusable(container: HTMLElement | null) {
  return Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
}

function useDialogFocus(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const doc = panel?.ownerDocument ?? document;

    (getFocusable(panel)[0] ?? panel)?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable(panel);
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
  }, [open, onClose]);

  useEffect(() => {
    if (wasOpenRef.current && !open)
      triggerRef.current?.focus({ preventScroll: true });
    wasOpenRef.current = open;
  }, [open]);

  return { panelRef, triggerRef };
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

export default function AppDialog2() {
  const body = useScrollFade<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [confirmText, setConfirmText] = useState("");
  const keyboardOpenRef = useRef(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [deleted, setDeleted] = useState(false);

  const closeDialog = useCallback(() => setOpen(false), []);
  const { panelRef, triggerRef } = useDialogFocus(open, closeDialog);

  const openDialog = () => {
    setConfirmText("");
    setDeleted(false);
    setKeyboardOpen(keyboardOpenRef.current);
    setOpen(true);
  };

  const deleteProject = () => {
    setDeleted(true);
    setOpen(false);
  };

  useEffect(() => {
    if (!deleted) return;
    const id = setTimeout(() => setDeleted(false), 2600);
    return () => clearTimeout(id);
  }, [deleted]);

  const confirmed = confirmText.trim() === PROJECT;
  const animatePosition = !prefersReducedMotion && !keyboardOpen;

  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950">
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
        onClick={openDialog}
        className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
      >
        Delete project
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="absolute inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] dark:bg-neutral-950/60"
              onClick={closeDialog}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            />
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="app-dialog-2-title"
                aria-describedby="app-dialog-2-desc"
                tabIndex={-1}
                className="pointer-events-auto flex max-h-full w-full max-w-sm origin-center flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
                initial={
                  animatePosition ? { opacity: 0, scale: 0.97 } : { opacity: 0 }
                }
                animate={
                  animatePosition ? { opacity: 1, scale: 1 } : { opacity: 1 }
                }
                exit={{
                  ...(animatePosition
                    ? { opacity: 0, scale: 0.97 }
                    : { opacity: 0 }),
                  transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
                }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                <header className="flex shrink-0 items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
                  <div className="min-w-0 flex-1">
                    <h2
                      id="app-dialog-2-title"
                      className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100"
                    >
                      Delete atlas-production?
                    </h2>
                    <p
                      id="app-dialog-2-desc"
                      className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400"
                    >
                      This permanently removes the project and everything in it.
                      It can&apos;t be undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close dialog"
                    onClick={closeDialog}
                    className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-500 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                  >
                    <X aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </button>
                </header>

                <div className="relative min-h-0 flex-1">
                  <div
                    ref={body.ref}
                    onScroll={body.onScroll}
                    className="h-full overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
                  >
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-4 py-3.5 dark:bg-neutral-800/50">
                      {RESOURCES.map((item) => (
                        <div key={item.label} className="min-w-0">
                          <dd className="text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                            {item.value}
                          </dd>
                          <dt className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                            {item.label}
                          </dt>
                        </div>
                      ))}
                    </dl>

                    <label
                      htmlFor="app-dialog-2-confirm"
                      className="mt-4 block text-[13px] text-neutral-600 dark:text-neutral-400"
                    >
                      Type{" "}
                      <span className="font-mono text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                        atlas-production
                      </span>{" "}
                      to confirm
                    </label>
                    <input
                      id="app-dialog-2-confirm"
                      value={confirmText}
                      onChange={(event) => setConfirmText(event.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="atlas-production"
                      className="mt-1.5 h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    />
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
                    onClick={closeDialog}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!confirmed}
                    onClick={deleteProject}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-red-600 px-4 text-sm font-medium text-white transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-red-700 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:hover:bg-red-500"
                  >
                    Delete project
                  </button>
                </footer>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div
        aria-live="polite"
        className="pointer-events-none absolute bottom-4 left-4 right-4 z-[60] flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm"
      >
        {deleted && (
          <div className="pointer-events-auto rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Project deleted
            </p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              atlas-production and its 1,204 deployments were removed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
