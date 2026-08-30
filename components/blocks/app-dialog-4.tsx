"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const STEPS = [{ title: "Workspace" }, { title: "Region" }, { title: "Team" }];

const REGIONS = [
  "United States (iad1)",
  "Europe (fra1)",
  "Asia Pacific (syd1)",
  "South America (gru1)",
];

function getFocusable(container: HTMLElement | null) {
  return Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
}

function useDialogFocus(open: boolean, step: number, onClose: () => void) {
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
    return () => {
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [open, step, onClose]);

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

export default function AppDialog4() {
  const body = useScrollFade<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState(false);
  const [workspace, setWorkspace] = useState("Northwind");
  const [region, setRegion] = useState(REGIONS[0]);
  const [emails, setEmails] = useState("");
  const keyboardOpenRef = useRef(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const closeDialog = useCallback(() => setOpen(false), []);
  const { panelRef, triggerRef } = useDialogFocus(open, step, closeDialog);

  useEffect(() => {
    if (!created) return;
    const id = setTimeout(() => setCreated(false), 2000);
    return () => clearTimeout(id);
  }, [created]);

  const openDialog = () => {
    setStep(0);
    setCreated(false);
    setKeyboardOpen(keyboardOpenRef.current);
    setOpen(true);
  };

  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      setCreated(true);
      setOpen(false);
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const back = () => setStep((current) => Math.max(current - 1, 0));

  const slug =
    workspace.trim().toLowerCase().replace(/\s+/g, "-") || "workspace";
  const animatePosition = !prefersReducedMotion && !keyboardOpen;

  return (
    <div className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950">
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
        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
      >
        New workspace
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
                aria-labelledby="app-dialog-4-title"
                tabIndex={-1}
                className="pointer-events-auto flex max-h-full w-full max-w-md origin-center flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
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
                <header className="flex shrink-0 items-center gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tabular-nums text-neutral-500">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <h2
                      id="app-dialog-4-title"
                      className="mt-0.5 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100"
                    >
                      {STEPS[step].title}
                    </h2>
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

                <div
                  className="mt-4 flex items-center gap-1.5 px-5 sm:px-6"
                  aria-hidden="true"
                >
                  {STEPS.map((item, index) => (
                    <span
                      key={item.title}
                      className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                        index <= step
                          ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                          : "bg-neutral-200 dark:bg-neutral-800"
                      }`}
                    />
                  ))}
                </div>

                <div className="relative min-h-0 flex-1">
                  <div
                    ref={body.ref}
                    onScroll={body.onScroll}
                    className="h-full overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
                  >
                    {step === 0 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="app-dialog-4-name"
                            className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
                          >
                            Workspace name
                          </label>
                          <input
                            id="app-dialog-4-name"
                            value={workspace}
                            onChange={(event) =>
                              setWorkspace(event.target.value)
                            }
                            placeholder="Acme"
                            className="h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Workspace URL
                          </span>
                          <div className="flex h-9 items-center rounded-[var(--rb-r-md,8px)] bg-neutral-50 px-3 text-sm dark:bg-neutral-800/50">
                            <span className="text-neutral-500">
                              northwind.app/
                            </span>
                            <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                              {slug}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            You can change this later in settings.
                          </p>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-1.5">
                        <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Primary region
                        </span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Choose where your workspace data is stored.
                        </p>
                        <ul className="mt-2 space-y-2">
                          {REGIONS.map((option) => {
                            const active = option === region;
                            return (
                              <li key={option}>
                                <button
                                  type="button"
                                  onClick={() => setRegion(option)}
                                  aria-pressed={active}
                                  className={`flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--rb-r-lg,10px)] border px-3 text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))] ${
                                    active
                                      ? "border-neutral-200/70 bg-neutral-100 font-medium text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                                      : "border-neutral-200/70 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                  }`}
                                >
                                  <span className="truncate">{option}</span>
                                  {active && (
                                    <Check
                                      aria-hidden="true"
                                      className="h-4 w-4 shrink-0 text-neutral-900 dark:text-white"
                                    />
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="app-dialog-4-emails"
                            className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
                          >
                            Invite teammates
                          </label>
                          <textarea
                            id="app-dialog-4-emails"
                            value={emails}
                            onChange={(event) => setEmails(event.target.value)}
                            rows={3}
                            placeholder="priya@northwind.io, marcus@northwind.io"
                            className="min-h-20 w-full resize-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                          />
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            Separate addresses with a comma. You can skip this
                            and invite people later.
                          </p>
                        </div>
                        <dl className="space-y-2 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-4 py-3 text-[13px] dark:bg-neutral-800/50">
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-neutral-600 dark:text-neutral-400">
                              Workspace
                            </dt>
                            <dd className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                              {workspace.trim() || "Untitled"}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-neutral-600 dark:text-neutral-400">
                              Region
                            </dt>
                            <dd className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                              {region}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}
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
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    >
                      <ArrowLeft
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                      />
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={closeDialog}
                      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] sm:w-auto dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                  >
                    {isLast ? "Create workspace" : "Continue"}
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
        {created && (
          <div className="pointer-events-auto rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Workspace created
            </p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              Redirecting you to {slug}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
