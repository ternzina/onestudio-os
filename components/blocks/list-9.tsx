"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mail, Users } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

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

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Kind = "customer" | "prospect";

type Contact = {
  first: string;
  last: string;
  role: string;
  company: string;
  kind: Kind;
};

const CONTACTS: Contact[] = [
  {
    first: "Amara",
    last: "Adeyemi",
    role: "VP Operations",
    company: "Northwind Trading",
    kind: "customer",
  },
  {
    first: "Priya",
    last: "Anand",
    role: "Head of Procurement",
    company: "Kestrel Labs",
    kind: "prospect",
  },
  {
    first: "Marcus",
    last: "Bello",
    role: "Finance Director",
    company: "Atlas Freight",
    kind: "customer",
  },
  {
    first: "Elena",
    last: "Brandt",
    role: "Account Owner",
    company: "Bright Harbor",
    kind: "customer",
  },
  {
    first: "Sofia",
    last: "Cardenas",
    role: "IT Manager",
    company: "Cedar & Vale",
    kind: "prospect",
  },
  {
    first: "Daniel",
    last: "Cho",
    role: "Ops Lead",
    company: "Meridian Health",
    kind: "customer",
  },
  {
    first: "Nadia",
    last: "Duarte",
    role: "Head of Sales",
    company: "Pinewood Foods",
    kind: "customer",
  },
  {
    first: "Grace",
    last: "Fenwick",
    role: "CFO",
    company: "Riverbank Capital",
    kind: "customer",
  },
  {
    first: "Oscar",
    last: "Fontaine",
    role: "Procurement Lead",
    company: "Solstice Energy",
    kind: "prospect",
  },
  {
    first: "Leah",
    last: "Granger",
    role: "VP Operations",
    company: "Tidewater Logistics",
    kind: "customer",
  },
  {
    first: "Tomas",
    last: "Guerra",
    role: "Founder",
    company: "Umbra Studio",
    kind: "prospect",
  },
  {
    first: "Ravi",
    last: "Hemani",
    role: "IT Director",
    company: "Vantage Aero",
    kind: "customer",
  },
  {
    first: "Imani",
    last: "Hollis",
    role: "Head of Finance",
    company: "Wexford Group",
    kind: "customer",
  },
  {
    first: "Yusuf",
    last: "Kaya",
    role: "Ops Manager",
    company: "Ovato Retail",
    kind: "prospect",
  },
  {
    first: "Wren",
    last: "Kowalski",
    role: "Account Owner",
    company: "Quill Media",
    kind: "customer",
  },
  {
    first: "Bianca",
    last: "Lindqvist",
    role: "VP Finance",
    company: "Lumen Robotics",
    kind: "customer",
  },
  {
    first: "Aaron",
    last: "Mbeki",
    role: "Head of Procurement",
    company: "Northwind Trading",
    kind: "customer",
  },
  {
    first: "Chloe",
    last: "Marchetti",
    role: "Buyer",
    company: "Cedar & Vale",
    kind: "prospect",
  },
  {
    first: "Felix",
    last: "Moreau",
    role: "Operations Lead",
    company: "Atlas Freight",
    kind: "customer",
  },
  {
    first: "Sasha",
    last: "Novak",
    role: "Head of IT",
    company: "Kestrel Labs",
    kind: "prospect",
  },
  {
    first: "Dana",
    last: "Okonkwo",
    role: "CFO",
    company: "Bright Harbor",
    kind: "customer",
  },
  {
    first: "Julian",
    last: "Pereira",
    role: "Account Owner",
    company: "Meridian Health",
    kind: "customer",
  },
  {
    first: "Nora",
    last: "Pashkov",
    role: "VP Growth",
    company: "Pinewood Foods",
    kind: "prospect",
  },
  {
    first: "Idris",
    last: "Rahman",
    role: "Finance Director",
    company: "Riverbank Capital",
    kind: "customer",
  },
  {
    first: "Camila",
    last: "Rossi",
    role: "Procurement Lead",
    company: "Solstice Energy",
    kind: "customer",
  },
  {
    first: "Hana",
    last: "Sato",
    role: "Head of Operations",
    company: "Tidewater Logistics",
    kind: "prospect",
  },
  {
    first: "Victor",
    last: "Salgado",
    role: "IT Manager",
    company: "Umbra Studio",
    kind: "customer",
  },
  {
    first: "Marta",
    last: "Toledo",
    role: "Account Owner",
    company: "Vantage Aero",
    kind: "customer",
  },
  {
    first: "Leon",
    last: "Vasquez",
    role: "Founder",
    company: "Wexford Group",
    kind: "prospect",
  },
  {
    first: "Greta",
    last: "Wallace",
    role: "VP Operations",
    company: "Ovato Retail",
    kind: "customer",
  },
  {
    first: "Owen",
    last: "Whitfield",
    role: "Head of Sales",
    company: "Quill Media",
    kind: "customer",
  },
];

const FILTERS: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "customer", label: "Customers" },
  { id: "prospect", label: "Prospects" },
];

const initials = (c: Contact) => `${c.first[0]}${c.last[0]}`;

export default function List9() {
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [activeLetter, setActiveLetter] = useState<string>("A");
  const [mounted, setMounted] = useState(false);

  const {
    ref: scrollRef,
    edges,
    onScroll: onFadeScroll,
  } = useScrollFade<HTMLDivElement>();
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const railRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => setMounted(true), []);

  const groups = useMemo(() => {
    const pool =
      filter === "all" ? CONTACTS : CONTACTS.filter((c) => c.kind === filter);
    const byLetter = new Map<string, Contact[]>();
    for (const c of pool) {
      const l = c.last[0].toUpperCase();
      (byLetter.get(l) ?? byLetter.set(l, []).get(l)!).push(c);
    }
    return [...byLetter.entries()]
      .map(([letter, people]) => ({
        letter,
        people: people.sort((a, b) => a.last.localeCompare(b.last)),
      }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  }, [filter]);

  const present = useMemo(() => new Set(groups.map((g) => g.letter)), [groups]);
  const total = useMemo(
    () => groups.reduce((n, g) => n + g.people.length, 0),
    [groups],
  );

  const scrollToLetter = useCallback(
    (letter: string) => {
      const scroller = scrollRef.current;
      const group = groupRefs.current[letter];
      if (!scroller || !group) return;
      scroller.scrollTop =
        group.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
    },
    [scrollRef],
  );

  const updateActive = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const top = scroller.getBoundingClientRect().top;
    let current = groups[0]?.letter ?? "A";
    for (const g of groups) {
      const el = groupRefs.current[g.letter];
      if (!el) continue;
      if (el.getBoundingClientRect().top - top <= 12) current = g.letter;
      else break;
    }
    setActiveLetter(current);
  }, [groups, scrollRef]);

  useEffect(() => {
    updateActive();
  }, [updateActive]);

  const letterFromPointer = useCallback((clientY: number) => {
    const rail = railRef.current;
    if (!rail) return null;
    const rect = rail.getBoundingClientRect();
    const ratio = (clientY - rect.top) / rect.height;
    const idx = Math.max(
      0,
      Math.min(ALPHABET.length - 1, Math.floor(ratio * ALPHABET.length)),
    );
    return ALPHABET[idx];
  }, []);

  const jumpTo = useCallback(
    (clientY: number) => {
      const letter = letterFromPointer(clientY);
      if (letter && present.has(letter)) scrollToLetter(letter);
    },
    [letterFromPointer, present, scrollToLetter],
  );

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-[720px] flex-col">
        <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Account contacts
            </h2>
            <p className="mt-0.5 text-[12px] tabular-nums text-neutral-500">
              {total} {total === 1 ? "person" : "people"} across your book
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter by relationship"
            className="flex shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {FILTERS.map((f) => {
              const on = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(f.id)}
                  className={cx(
                    "h-7 rounded-[var(--rb-r-md,8px)] px-2.5 text-[12px]",
                    transition,
                    focus,
                    on
                      ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          {groups.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <Users className="h-5 w-5 text-neutral-500" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                No contacts in this view
              </p>
              <p className="mt-1 max-w-xs text-xs text-neutral-500">
                Nobody in your book matches this relationship yet.
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cx(
                  "mt-4 inline-flex h-8 items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                Show everyone
              </button>
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={() => {
                onFadeScroll();
                updateActive();
              }}
              style={{ touchAction: "pan-y", scrollbarWidth: "none" }}
              className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-7 [&::-webkit-scrollbar]:hidden"
            >
              {groups.map((g, gi) => (
                <div
                  key={g.letter}
                  ref={(el) => {
                    groupRefs.current[g.letter] = el;
                  }}
                >
                  <div className="sticky top-0 z-10 bg-neutral-50 px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                    {g.letter}
                  </div>
                  <div className="space-y-1">
                    {g.people.map((c, pi) => {
                      const order = Math.min(gi * 3 + pi, 8);
                      return (
                        <div
                          key={`${c.first}-${c.last}`}
                          className={cx(
                            panel,
                            "flex h-14 items-center gap-3 px-3",
                            "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                            "motion-reduce:transition-none",
                          )}
                          style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? undefined : "translateY(4px)",
                            transition:
                              "opacity 300ms ease-out, transform 300ms ease-out, background-color 150ms ease-out",
                            transitionDelay: `${order * 20}ms`,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {initials(c)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                              {c.first} {c.last}
                            </p>
                            <p className="truncate text-[12px] text-neutral-500">
                              {c.role} · {c.company}
                            </p>
                          </div>

                          <button
                            type="button"
                            aria-label={`Email ${c.first} ${c.last}`}
                            className={cx(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950",
                              "hover:text-neutral-900 dark:hover:text-neutral-100",
                              transition,
                              focus,
                            )}
                          >
                            <Mail
                              className="h-3.5 w-3.5"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-1 top-1 z-10 h-8 rounded-t-[var(--rb-r-lg,10px)] bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-1 bottom-1 z-10 h-8 rounded-b-[var(--rb-r-lg,10px)] bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              edges.end ? "opacity-100" : "opacity-0",
            )}
          />

          {groups.length > 0 && (
            <div
              ref={railRef}
              role="navigation"
              aria-label="Jump to letter"
              onPointerDown={(e) => {
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                jumpTo(e.clientY);
              }}
              onPointerMove={(e) => {
                if (dragging.current) jumpTo(e.clientY);
              }}
              onPointerUp={(e) => {
                dragging.current = false;
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              style={{ touchAction: "none" }}
              className="absolute inset-y-2 right-1.5 z-20 flex w-4 select-none flex-col items-center justify-between"
            >
              {ALPHABET.map((letter) => {
                const populated = present.has(letter);
                const on = letter === activeLetter && populated;
                if (!populated) {
                  return (
                    <span
                      key={letter}
                      aria-hidden="true"
                      className="text-[10px] leading-none text-neutral-300 tabular-nums dark:text-neutral-700"
                    >
                      {letter}
                    </span>
                  );
                }
                return (
                  <button
                    key={letter}
                    type="button"
                    aria-label={`Jump to ${letter}`}
                    onClick={() => scrollToLetter(letter)}
                    className={cx(
                      "rounded-[var(--rb-r-xs,4px)] text-[10px] leading-none tabular-nums",
                      transition,
                      focus,
                      on
                        ? "font-medium text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
