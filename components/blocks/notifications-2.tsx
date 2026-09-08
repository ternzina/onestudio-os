"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  Undo2,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

type Variant = "success" | "error" | "info" | "loading";

type Toast = {
  id: string;
  variant: Variant;
  title: string;
  body: string;
  undo?: boolean;
};

const PRESETS: {
  variant: Variant;
  label: string;
  title: string;
  body: string;
  undo?: boolean;
}[] = [
  {
    variant: "success",
    label: "Success",
    title: "Deployment live",
    body: "halcyon-web · production · 42s",
    undo: true,
  },
  {
    variant: "error",
    label: "Error",
    title: "Import failed",
    body: "Row 118 has an unmapped column.",
  },
  {
    variant: "info",
    label: "Info",
    title: "Wei Chen shared a board",
    body: "Q3 rollout · you have edit access.",
  },
  {
    variant: "loading",
    label: "Progress",
    title: "Uploading contacts",
    body: "2,480 records from Northwind.",
  },
];

const ICONS: Record<Variant, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
  loading: LoaderCircle,
};

const TONE: Record<Variant, string> = {
  success: "text-emerald-600 dark:text-emerald-500",
  error: "text-red-600 dark:text-red-400",
  info: "text-neutral-500 dark:text-neutral-400",
  loading: "text-neutral-500 dark:text-neutral-400",
};

const ROW = 76;
const DURATION = 6000;
const MAX_VISIBLE = 3;

export default function Notifications2() {
  const reduce = useReducedMotion();
  const seq = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expanded, setExpanded] = useState(false);

  const dismiss = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const push = (preset: (typeof PRESETS)[number]) => {
    seq.current += 1;
    const id = `t${seq.current}`;
    setToasts((prev) => [
      { id, ...preset, title: preset.title, body: preset.body },
      ...prev,
    ]);
  };

  const settle = useCallback(
    (id: string) =>
      setToasts((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                variant: "success",
                title: "Contacts imported",
                body: "2,480 records added to Northwind.",
              }
            : t,
        ),
      ),
    [],
  );

  const stack = toasts.slice(0, 5);

  return (
    <div className="relative flex h-full min-h-[620px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <div className="flex flex-1 items-center justify-center p-5">
        <div className="w-full max-w-[420px] rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-[15px] font-medium text-neutral-900 dark:text-white">
              Toast notifications
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
              Transient messages stack in the corner, collapse when idle and
              expand on hover.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.variant}
                  type="button"
                  onClick={() => push(p)}
                  className={cx(
                    "inline-flex h-9 items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
                    "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  <span className={TONE[p.variant]}>
                    {p.variant === "loading" ? (
                      <LoaderCircle
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                    ) : (
                      (() => {
                        const I = ICONS[p.variant];
                        return <I className="h-3.5 w-3.5" strokeWidth={1.75} />;
                      })()
                    )}
                  </span>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
              <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                {toasts.length === 0
                  ? "No active toasts"
                  : `${toasts.length} active`}
              </span>
              <button
                type="button"
                onClick={() => setToasts([])}
                disabled={toasts.length === 0}
                className={cx(
                  "text-[13px] text-neutral-700 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-300",
                  "hover:text-neutral-900 dark:hover:text-white",
                  transition,
                  focus,
                )}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-label="Notifications"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setExpanded(false);
        }}
        style={{ height: ROW }}
        className="pointer-events-none absolute right-5 bottom-5 left-5 sm:left-auto sm:w-[360px]"
      >
        <AnimatePresence initial={false}>
          {stack.map((t, i) => {
            const Icon = ICONS[t.variant];
            const depth = Math.min(i, MAX_VISIBLE);
            return (
              <motion.div
                key={t.id}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
                animate={{
                  opacity: i > MAX_VISIBLE ? 0 : 1,
                  y: expanded ? -i * (ROW + 8) : -depth * 10,
                  scale: expanded ? 1 : 1 - depth * 0.04,
                }}
                exit={
                  reduce
                    ? undefined
                    : {
                        opacity: 0,
                        y: 16,
                        scale: 0.96,
                        transition: { duration: 0.16 },
                      }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 34 }
                }
                style={{ zIndex: 50 - i, height: ROW }}
                className="pointer-events-auto absolute inset-x-0 bottom-0 origin-bottom"
              >
                <ToastRow
                  toast={t}
                  paused={expanded}
                  onDismiss={dismiss}
                  onSettle={settle}
                >
                  <span
                    className={cx(
                      "mt-0.5 shrink-0",
                      TONE[t.variant],
                      t.variant === "loading" && "animate-spin",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </ToastRow>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToastRow({
  toast,
  paused,
  onDismiss,
  onSettle,
  children,
}: {
  toast: Toast;
  paused: boolean;
  onDismiss: (id: string) => void;
  onSettle: (id: string) => void;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const { id, variant } = toast;

  useEffect(() => {
    if (variant !== "loading") return;
    const timer = window.setTimeout(() => onSettle(id), 2200);
    return () => window.clearTimeout(timer);
  }, [id, variant, onSettle]);

  useEffect(() => {
    if (paused || variant === "loading") return;
    const timer = window.setTimeout(() => onDismiss(id), DURATION);
    return () => window.clearTimeout(timer);
  }, [id, paused, variant, onDismiss]);

  return (
    <div className="relative flex h-full items-start gap-3 overflow-hidden rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.24)] dark:border-neutral-800 dark:bg-neutral-900">
      {children}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-white">
          {toast.title}
        </p>
        <p className="truncate text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
          {toast.body}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {toast.undo && (
          <button
            type="button"
            onClick={() => onDismiss(id)}
            className={cx(
              "inline-flex h-7 items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] border border-neutral-200 bg-white px-2 text-[12px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
              "hover:bg-neutral-50 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            <Undo2 className="h-3 w-3" strokeWidth={1.75} />
            Undo
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss"
          className={cx(
            "inline-flex h-7 w-7 items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-400 dark:text-neutral-500",
            "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white",
            transition,
            focus,
          )}
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {variant !== "loading" && !reduce && (
        <motion.span
          key={paused ? "paused" : "running"}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: paused ? 1 : 0 }}
          transition={{
            duration: paused ? 0 : DURATION / 1000,
            ease: "linear",
          }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-neutral-300 dark:bg-neutral-700"
        />
      )}
    </div>
  );
}
