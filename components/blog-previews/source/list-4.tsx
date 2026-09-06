"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical, RotateCcw } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const ROW = 60;

type Article = {
  id: string;
  title: string;
  author: string;
  words: string;
};

const ARTICLES: Article[] = [
  {
    id: "a-ssr",
    title: "The quiet return of server-side rendering",
    author: "Nadia Whitfield",
    words: "2,140 words",
  },
  {
    id: "a-a11y",
    title: "What our 2026 accessibility audit actually changed",
    author: "Theo Marsh",
    words: "1,780 words",
  },
  {
    id: "a-layers",
    title: "Migrating the design system to CSS cascade layers",
    author: "Priya Raman",
    words: "3,020 words",
  },
  {
    id: "a-pool",
    title: "A field guide to database connection pooling",
    author: "Owen Castellano",
    words: "2,460 words",
  },
  {
    id: "a-flags",
    title: "Why we deleted forty percent of our feature flags",
    author: "Mara Lindqvist",
    words: "1,520 words",
  },
  {
    id: "a-hire",
    title: "Interviewing engineers without a take-home",
    author: "Devon Ashby",
    words: "2,890 words",
  },
  {
    id: "a-oncall",
    title: "The economics of on-call, three years in",
    author: "Priya Raman",
    words: "1,960 words",
  },
  {
    id: "a-onboard",
    title: "Rewriting our onboarding for the fifth time",
    author: "Sasha Bloom",
    words: "2,310 words",
  },
];

const SLOTS = [
  "Today 09:00",
  "Today 13:00",
  "Today 17:00",
  "Tue 09:00",
  "Tue 13:00",
  "Wed 09:00",
  "Wed 15:00",
  "Thu 10:00",
];

const idsOf = (list: Article[]) => list.map((a) => a.id).join("|");
const ORIGINAL = idsOf(ARTICLES);

type PointerDrag = { id: string; from: number; dy: number };

export default function List4() {
  const [items, setItems] = useState<Article[]>(ARTICLES);
  const [drag, setDrag] = useState<PointerDrag | null>(null);
  const [settling, setSettling] = useState(false);
  const [kbdId, setKbdId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const startYRef = useRef(0);
  const snapshotRef = useRef<Article[]>(ARTICLES);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!settling) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setSettling(false));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [settling]);

  const n = items.length;
  const isOriginal = useMemo(() => idsOf(items) === ORIGINAL, [items]);

  const targetIndex = drag
    ? clamp(drag.from + Math.round(drag.dy / ROW), 0, n - 1)
    : -1;

  const move = (from: number, to: number) => {
    setItems((prev) => {
      if (to === from) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;
    const rowEl = target.closest<HTMLElement>("[data-row-id]");
    const id = rowEl?.dataset.rowId;
    if (!id) return;
    const from = items.findIndex((a) => a.id === id);
    if (from < 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    setSettling(false);
    setKbdId(null);
    startYRef.current = e.clientY;
    setDrag({ id, from, dy: 0 });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    setDrag((prev) =>
      prev ? { ...prev, dy: e.clientY - startYRef.current } : prev,
    );
  };

  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const to = clamp(drag.from + Math.round(drag.dy / ROW), 0, n - 1);
    if (to !== drag.from) {
      move(drag.from, to);
      setMessage(`Moved to position ${to + 1} of ${n}.`);
      setSettling(true);
    }
    setDrag(null);
  };

  const onHandleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const item = items[index];
    if (!item) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (kbdId === item.id) {
        setKbdId(null);
        setMessage(`${item.title} dropped at position ${index + 1} of ${n}.`);
      } else {
        snapshotRef.current = items;
        setKbdId(item.id);
        setMessage(
          `${item.title} grabbed, position ${index + 1} of ${n}. Use the arrow keys to move, space to drop, escape to cancel.`,
        );
      }
      return;
    }

    if (kbdId !== item.id) return;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const to = clamp(index + (e.key === "ArrowUp" ? -1 : 1), 0, n - 1);
      if (to !== index) {
        move(index, to);
        setMessage(`Moved to position ${to + 1} of ${n}.`);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setItems(snapshotRef.current);
      setKbdId(null);
      setMessage("Reorder cancelled.");
    }
  };

  const reset = () => {
    setItems(ARTICLES);
    setKbdId(null);
    setMessage("Order reset to the original schedule.");
  };

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-[720px] flex-col">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
              Publishing queue
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-500">
              Drag a handle to change the order these {n} drafts go live.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            disabled={isOriginal}
            className={cx(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-3 text-[13px] font-medium text-neutral-900 transition-[background-color,border-color,color,opacity] duration-150 ease-out hover:bg-neutral-50 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
              focus,
            )}
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Reset order
          </button>
        </div>

        <div className="mt-4 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <ul
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ touchAction: "pan-y" }}
            className={cx("flex flex-col gap-1", drag && "select-none")}
          >
            {items.map((item, index) => {
              const dragging = drag?.id === item.id;
              const grabbed = kbdId === item.id;
              const lifted = dragging || grabbed;

              let shift = 0;
              if (drag && !dragging) {
                const { from } = drag;
                const to = targetIndex;
                if (from < to && index > from && index <= to) shift = -ROW;
                else if (to < from && index >= to && index < from) shift = ROW;
              }

              const translate = dragging ? drag!.dy : shift;
              const delay = `${Math.min(index, 7) * 20}ms`;

              return (
                <li
                  key={item.id}
                  data-row-id={item.id}
                  style={{
                    transform: translate
                      ? `translateY(${translate}px)`
                      : undefined,
                    zIndex: lifted ? 10 : undefined,
                    transitionDelay: mounted ? "0ms" : delay,
                  }}
                  className={cx(
                    "relative",
                    settling
                      ? "transition-none"
                      : dragging
                        ? "transition-[opacity] duration-200 ease-out motion-reduce:transition-none"
                        : "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
                    mounted ? "opacity-100" : "opacity-0",
                  )}
                >
                  <div
                    className={cx(
                      "flex h-14 items-center gap-3 rounded-[var(--rb-r-lg,10px)] border bg-white pr-3 dark:bg-neutral-950",
                      lifted
                        ? "border-neutral-300 shadow-lg ring-1 ring-neutral-900/10 dark:border-neutral-700 dark:ring-white/10"
                        : "border-neutral-200/70 dark:border-neutral-800",
                    )}
                  >
                    <button
                      type="button"
                      data-drag-handle
                      aria-label={
                        grabbed
                          ? `${item.title}, grabbed, position ${index + 1} of ${n}. Use the arrow keys to move, space to drop, escape to cancel.`
                          : `Reorder ${item.title}. Position ${index + 1} of ${n}. Press space or enter to pick up.`
                      }
                      onKeyDown={(e) => onHandleKeyDown(e, index)}
                      className={cx(
                        "flex h-14 shrink-0 touch-none items-center rounded-l-[var(--rb-r-lg,10px)] pl-2.5 pr-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-300",
                        drag ? "cursor-grabbing" : "cursor-grab",
                        focus,
                      )}
                    >
                      <GripVertical
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                      />
                    </button>

                    <span className="w-4 shrink-0 text-center text-[12px] tabular-nums text-neutral-400 dark:text-neutral-600">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-neutral-500 dark:text-neutral-500">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {item.author}
                        </span>{" "}
                        · <span className="tabular-nums">{item.words}</span>
                      </p>
                    </div>

                    <time className="shrink-0 text-[12px] tabular-nums text-neutral-500 dark:text-neutral-500">
                      {SLOTS[index]}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p aria-live="polite" className="sr-only">
          {message}
        </p>
      </div>
    </div>
  );
}
