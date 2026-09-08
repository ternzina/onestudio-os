"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  Check,
  Download,
  FileVideo,
  FolderInput,
  Image as ImageIcon,
  Minus,
  Trash2,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,box-shadow,opacity] duration-150 ease-out";

const checkbox =
  "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[var(--rb-r-xs,4px)] border border-neutral-300 bg-white transition-colors duration-150 checked:border-neutral-900 checked:bg-neutral-900 indeterminate:border-neutral-900 indeterminate:bg-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:checked:bg-white dark:indeterminate:border-white dark:indeterminate:bg-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxBox =
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center";

const checkboxMark =
  "pointer-events-none absolute h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]";

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

type Status = "review" | "approved";

type Asset = {
  id: string;
  name: string;
  kind: "video" | "image";
  spec: string;
  size: string;
  uploader: string;
  initials: string;
  date: string;
  status: Status;
};

const ASSETS: Asset[] = [
  {
    id: "hero-loop",
    name: "hero-launch-loop.mp4",
    kind: "video",
    spec: "1920 × 1080 · 1:12",
    size: "142 MB",
    uploader: "Nadia Whitfield",
    initials: "NW",
    date: "Feb 6, 2026",
    status: "review",
  },
  {
    id: "pricing-dark",
    name: "pricing-table-dark.png",
    kind: "image",
    spec: "2560 × 1440",
    size: "1.8 MB",
    uploader: "Owen Castellano",
    initials: "OC",
    date: "Feb 6, 2026",
    status: "approved",
  },
  {
    id: "onboard-3",
    name: "onboarding-step-3.png",
    kind: "image",
    spec: "1440 × 900",
    size: "820 KB",
    uploader: "Priya Raman",
    initials: "PR",
    date: "Feb 5, 2026",
    status: "approved",
  },
  {
    id: "tour-full",
    name: "product-tour-full.mp4",
    kind: "video",
    spec: "3840 × 2160 · 3:48",
    size: "512 MB",
    uploader: "Theo Marsh",
    initials: "TM",
    date: "Feb 5, 2026",
    status: "review",
  },
  {
    id: "testimonial",
    name: "testimonial-mara-lindqvist.mp4",
    kind: "video",
    spec: "1920 × 1080 · 0:42",
    size: "88 MB",
    uploader: "Sasha Bloom",
    initials: "SB",
    date: "Feb 4, 2026",
    status: "approved",
  },
  {
    id: "og-spring",
    name: "og-card-spring.png",
    kind: "image",
    spec: "1200 × 630",
    size: "340 KB",
    uploader: "Devon Ashby",
    initials: "DA",
    date: "Feb 4, 2026",
    status: "approved",
  },
  {
    id: "changelog-hd",
    name: "changelog-header.png",
    kind: "image",
    spec: "2880 × 1620",
    size: "2.4 MB",
    uploader: "Nadia Whitfield",
    initials: "NW",
    date: "Feb 3, 2026",
    status: "approved",
  },
  {
    id: "feature-grid",
    name: "feature-grid-anim.mp4",
    kind: "video",
    spec: "2560 × 1440 · 1:56",
    size: "268 MB",
    uploader: "Owen Castellano",
    initials: "OC",
    date: "Feb 3, 2026",
    status: "review",
  },
  {
    id: "avatars",
    name: "avatar-set-neutral.png",
    kind: "image",
    spec: "512 × 512",
    size: "96 KB",
    uploader: "Priya Raman",
    initials: "PR",
    date: "Feb 2, 2026",
    status: "approved",
  },
  {
    id: "docs-auth",
    name: "docs-diagram-auth.png",
    kind: "image",
    spec: "2048 × 1536",
    size: "1.1 MB",
    uploader: "Theo Marsh",
    initials: "TM",
    date: "Feb 2, 2026",
    status: "approved",
  },
  {
    id: "recap-q1",
    name: "release-recap-q1.mp4",
    kind: "video",
    spec: "1920 × 1080 · 4:20",
    size: "356 MB",
    uploader: "Sasha Bloom",
    initials: "SB",
    date: "Jan 30, 2026",
    status: "approved",
  },
];

const KIND_ICON: Record<
  Asset["kind"],
  ComponentType<{ className?: string }>
> = {
  video: FileVideo,
  image: ImageIcon,
};

type Filter = "all" | "review" | "approved";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "review", label: "Needs review" },
  { id: "approved", label: "Approved" },
];

const matches = (asset: Asset, filter: Filter) =>
  filter === "all" || asset.status === filter;

const visibleFor = (assets: Asset[], filter: Filter) =>
  assets.filter((a) => matches(a, filter));

export default function List5() {
  const [assets, setAssets] = useState<Asset[]>(ASSETS);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [mounted, setMounted] = useState(false);

  const anchorRef = useRef<number | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const fade = useScrollFade<HTMLDivElement>();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const visible = useMemo(() => visibleFor(assets, filter), [assets, filter]);

  useEffect(() => {
    const ids = new Set(visible.map((a) => a.id));
    setSelected((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
    anchorRef.current = null;
  }, [visible]);

  const selCount = selected.size;
  const allSelected =
    visible.length > 0 && visible.every((a) => selected.has(a.id));
  const someSelected = selCount > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggle = (index: number, shiftKey: boolean) => {
    const id = visible[index]?.id;
    if (!id) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const anchor = anchorRef.current;
      if (shiftKey && anchor !== null) {
        const lo = Math.min(anchor, index);
        const hi = Math.max(anchor, index);
        const target = !next.has(id);
        for (let i = lo; i <= hi; i += 1) {
          const vid = visible[i].id;
          if (target) next.add(vid);
          else next.delete(vid);
        }
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    anchorRef.current = index;
  };

  const toggleAll = () => {
    setSelected(() =>
      allSelected ? new Set() : new Set(visible.map((a) => a.id)),
    );
    anchorRef.current = null;
  };

  const clear = () => {
    setSelected(new Set());
    anchorRef.current = null;
  };

  const removeSelected = () => {
    setAssets((prev) => prev.filter((a) => !selected.has(a.id)));
    setSelected(new Set());
    anchorRef.current = null;
  };

  const restore = () => {
    setAssets(ASSETS);
    setFilter("all");
    setSelected(new Set());
    anchorRef.current = null;
  };

  const bulkBtn =
    "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] px-2 text-[13px] font-medium active:scale-[0.97]";

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
              Asset library
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-500">
              Uploaded media awaiting review before it ships to production.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex h-9 shrink-0 items-center gap-1 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={cx(
                    "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px] active:scale-[0.97]",
                    active
                      ? "bg-white font-medium text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex h-9 items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13px] text-neutral-600 select-none dark:text-neutral-400">
            <span className={checkboxBox}>
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all assets"
                className={checkbox}
              />
              {allSelected ? (
                <Check
                  aria-hidden="true"
                  strokeWidth={3}
                  className={checkboxMark}
                />
              ) : someSelected ? (
                <Minus
                  aria-hidden="true"
                  strokeWidth={3}
                  className={checkboxMark}
                />
              ) : null}
            </span>
            Select all
          </label>

          <div className="relative flex items-center">
            <span
              aria-hidden={selCount > 0}
              className={cx(
                "text-[12px] tabular-nums text-neutral-500 transition-opacity duration-150 ease-out dark:text-neutral-500",
                selCount > 0 ? "opacity-0" : "opacity-100",
              )}
            >
              {visible.length} {visible.length === 1 ? "asset" : "assets"}
            </span>

            <div
              aria-hidden={selCount === 0}
              className={cx(
                "absolute right-0 flex items-center gap-1 transition-[opacity,transform] duration-150 ease-out",
                selCount > 0
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-1 opacity-0",
              )}
            >
              <span className="mr-1 whitespace-nowrap text-[13px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {selCount} selected
              </span>
              <button
                type="button"
                tabIndex={selCount > 0 ? 0 : -1}
                className={cx(
                  bulkBtn,
                  "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                <Download aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                Download
              </button>
              <button
                type="button"
                tabIndex={selCount > 0 ? 0 : -1}
                className={cx(
                  bulkBtn,
                  "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                <FolderInput
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                />
                Move
              </button>
              <button
                type="button"
                onClick={removeSelected}
                tabIndex={selCount > 0 ? 0 : -1}
                className={cx(
                  bulkBtn,
                  "text-red-600 hover:bg-neutral-100 dark:text-red-500 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                Delete
              </button>
              <button
                type="button"
                onClick={clear}
                tabIndex={selCount > 0 ? 0 : -1}
                aria-label="Clear selection"
                className={cx(
                  "ml-0.5 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <X aria-hidden="true" className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-1 overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <div
            ref={fade.ref}
            onScroll={fade.onScroll}
            className="h-[444px] overflow-y-auto"
          >
            {visible.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                  <ImageIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-neutral-400 dark:text-neutral-600"
                  />
                </span>
                <p className="mt-3 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {assets.length === 0
                    ? "The library is empty"
                    : "No assets in this view"}
                </p>
                <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-500">
                  {assets.length === 0
                    ? "Every asset has been deleted."
                    : "Nothing matches this status right now."}
                </p>
                <button
                  type="button"
                  onClick={restore}
                  className={cx(
                    "mt-3 inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  Restore library
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {visible.map((asset, index) => {
                  const isSelected = selected.has(asset.id);
                  const Icon = KIND_ICON[asset.kind];
                  const delay = `${Math.min(index, 7) * 20}ms`;
                  return (
                    <li
                      key={asset.id}
                      style={{ transitionDelay: mounted ? "0ms" : delay }}
                      className={cx(
                        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
                        mounted ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <label
                        className={cx(
                          "flex h-16 cursor-pointer items-center gap-3 rounded-[var(--rb-r-lg,10px)] border px-3 select-none",
                          isSelected
                            ? "border-transparent bg-neutral-50 ring-1 ring-neutral-900 dark:bg-neutral-900 dark:ring-white"
                            : "border-neutral-200/70 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900",
                          transition,
                        )}
                      >
                        <span className={checkboxBox}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggle(index, false)}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                e.preventDefault();
                                toggle(index, true);
                              }
                            }}
                            aria-label={`Select ${asset.name}`}
                            className={checkbox}
                          />
                          <Check
                            aria-hidden="true"
                            strokeWidth={3}
                            className={cx(
                              checkboxMark,
                              "opacity-0 transition-opacity duration-150 peer-checked:opacity-100 motion-reduce:transition-none",
                            )}
                          />
                        </span>

                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 dark:bg-neutral-800">
                          <Icon
                            aria-hidden="true"
                            className="h-[18px] w-[18px] text-neutral-500 dark:text-neutral-400"
                          />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                            {asset.name}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] tabular-nums text-neutral-500 dark:text-neutral-500">
                            {asset.spec} · {asset.size}
                          </p>
                        </div>

                        <div className="hidden w-40 shrink-0 items-center gap-2 lg:flex">
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {asset.initials}
                          </span>
                          <span className="min-w-0 truncate text-[12px] text-neutral-600 dark:text-neutral-400">
                            {asset.uploader}
                          </span>
                        </div>

                        <time className="hidden w-24 shrink-0 text-[12px] tabular-nums text-neutral-500 sm:block dark:text-neutral-500">
                          {asset.date}
                        </time>

                        <span className="flex w-32 shrink-0 items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
                          <span
                            className={cx(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              asset.status === "review"
                                ? "bg-amber-500"
                                : "bg-neutral-300 dark:bg-neutral-600",
                            )}
                          />
                          {asset.status === "review"
                            ? "Needs review"
                            : "Approved"}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-1 top-1 z-10 h-8 rounded-t-[var(--rb-r-lg,10px)] bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              fade.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-1 bottom-1 z-10 h-8 rounded-b-[var(--rb-r-lg,10px)] bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              fade.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </div>
  );
}
