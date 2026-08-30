"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileText,
  Globe,
  History,
  LayoutTemplate,
  ListChecks,
  Mail,
  MapPin,
  Menu,
  Mic,
  PanelLeft,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

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

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const focusInset =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

type Model = {
  id: string;
  name: string;
  note: string;
  icon: LucideIcon;
};

const MODELS: Model[] = [
  {
    id: "atlas",
    name: "Atlas 4",
    note: "Best for hard reasoning",
    icon: Sparkles,
  },
  { id: "wren", name: "Wren", note: "Fast, good for drafts", icon: Globe },
  { id: "orbit", name: "Orbit", note: "Long documents", icon: Database },
];

type Prompt = { label: string; icon: LucideIcon };

const PROMPTS: Prompt[] = [
  { label: "Draft an email", icon: Mail },
  { label: "Summarise a file", icon: FileText },
  { label: "Write a function", icon: Code2 },
  { label: "Plan a trip", icon: MapPin },
];

type Turn = { role: "user" | "assistant"; text: string };

type Chat = {
  id: string;
  title: string;
  icon: LucideIcon;
  model: string;
  count: number;
  turns: Turn[];
};

const CHATS: Chat[] = [
  {
    id: "revenue",
    title: "Quarterly revenue summary",
    icon: FileText,
    model: "Atlas 4",
    count: 12,
    turns: [
      {
        role: "user",
        text: "Pull the headline numbers out of the Q3 close and tell me what actually moved.",
      },
      {
        role: "assistant",
        text: "Revenue landed at 4.62m, up 8.4% on Q2. Almost all of the gain is expansion inside existing accounts rather than new logos, which came in flat at 41. Net retention is 114%, the best of the last four quarters.",
      },
      {
        role: "user",
        text: "What is the risk in that number?",
      },
      {
        role: "assistant",
        text: "Concentration. The top six accounts now sit at 38% of ARR, up from 31% a year ago. Two of them renew in the same month, so a single bad renewal window would take more off the top line than the whole quarter's growth put back.",
      },
    ],
  },
  {
    id: "auth",
    title: "Refactor auth middleware",
    icon: Code2,
    model: "Atlas 4",
    count: 24,
    turns: [
      {
        role: "user",
        text: "The session refresh runs on every request. Can it be cheaper?",
      },
      {
        role: "assistant",
        text: "Yes. Refresh only when the token is inside its last five minutes, and keep the decoded claims on the request so downstream handlers stop re-parsing. That takes the common path from one network call to none.",
      },
    ],
  },
  {
    id: "lisbon",
    title: "Lisbon trip itinerary",
    icon: MapPin,
    model: "Wren",
    count: 8,
    turns: [
      { role: "user", text: "Four days in Lisbon in October, no rental car." },
      {
        role: "assistant",
        text: "Base yourself in Príncipe Real so most of it is walkable. Day one Alfama and the viewpoints, day two Belém by tram, day three a train out to Sintra, day four the Time Out market and the riverside before your flight.",
      },
    ],
  },
  {
    id: "launch",
    title: "Launch checklist draft",
    icon: ListChecks,
    model: "Atlas 4",
    count: 5,
    turns: [
      { role: "user", text: "What is still open before Thursday?" },
      {
        role: "assistant",
        text: "Three things: the pricing page copy is unreviewed, the status page has no incident template, and nobody owns the first-hour inbox. The rest is either done or does not block the announcement.",
      },
    ],
  },
  {
    id: "vector",
    title: "Explain vector search",
    icon: Search,
    model: "Orbit",
    count: 9,
    turns: [
      {
        role: "user",
        text: "Explain vector search without the marketing words.",
      },
      {
        role: "assistant",
        text: "You turn each document into a list of numbers that encodes its meaning, then store them. A query becomes the same kind of list, and you return the documents whose lists point in a similar direction. It finds things that mean the same rather than things that spell the same.",
      },
    ],
  },
  {
    id: "sql",
    title: "Optimise a slow SQL query",
    icon: Database,
    model: "Orbit",
    count: 16,
    turns: [
      {
        role: "user",
        text: "This join takes eleven seconds. Where do I start?",
      },
      {
        role: "assistant",
        text: "Read the plan first. An eleven second join on this row count is almost always a sequential scan on the right-hand table because the join column is not indexed, or is indexed with a different collation than the one you are comparing against.",
      },
    ],
  },
];

const QUICK_ACTIONS: { label: string; icon: LucideIcon; count?: number }[] = [
  { label: "Favourites", icon: Star, count: 2 },
  { label: "Templates", icon: LayoutTemplate, count: 5 },
  { label: "History", icon: History },
  { label: "Clear history", icon: Trash2 },
];

const navRow =
  "group flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-md,8px)] px-2 text-left text-[13px]";

const navIdle =
  "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

const navOn =
  "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100";

const overline =
  "px-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500";

function Overline({ children }: { children: React.ReactNode }) {
  return <p className={cx(overline, "mb-1.5")}>{children}</p>;
}

function ModelMenu({
  value,
  onChange,
}: {
  value: Model;
  onChange: (model: Model) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const close = useCallback((restore: boolean) => {
    setOpen(false);
    if (restore) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const doc = triggerRef.current?.ownerDocument ?? document;

    const onPointerDown = (event: Event) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };

    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    const frame = requestAnimationFrame(() =>
      itemRefs.current[active]?.focus({ preventScroll: true }),
    );
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [open, active, close]);

  const move = (next: number) => {
    const wrapped = (next + MODELS.length) % MODELS.length;
    setActive(wrapped);
    itemRefs.current[wrapped]?.focus({ preventScroll: true });
  };

  const onItemKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    i: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(i + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(i - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(0);
    } else if (event.key === "End") {
      event.preventDefault();
      move(MODELS.length - 1);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const Icon = value.icon;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setActive(MODELS.findIndex((m) => m.id === value.id));
          setOpen((v) => !v);
        }}
        className={cx(
          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-2.5 pr-2 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
          transition,
          focus,
        )}
      >
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        {value.name}
        <ChevronDown
          aria-hidden="true"
          className={cx(
            "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-150 ease-out",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Choose a model"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.14)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)]"
        >
          {MODELS.map((model, i) => {
            const ItemIcon = model.icon;
            const selected = model.id === value.id;
            return (
              <button
                key={model.id}
                ref={(node) => {
                  itemRefs.current[i] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                tabIndex={i === active ? 0 : -1}
                onKeyDown={(event) => onItemKeyDown(event, i)}
                onClick={() => {
                  onChange(model);
                  close(true);
                }}
                className={cx(
                  "flex w-full cursor-pointer items-start gap-2.5 rounded-[var(--rb-r-md,8px)] px-2 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  transition,
                  focusInset,
                )}
              >
                <ItemIcon
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                    {model.name}
                  </span>
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                    {model.note}
                  </span>
                </span>
                {selected && (
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-100"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Composer({
  draft,
  onDraft,
  model,
  inputRef,
}: {
  draft: string;
  onDraft: (value: string) => void;
  model: Model;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="rounded-[var(--rb-r-3xl,16px)] border border-neutral-200 bg-white transition-colors duration-150 ease-out focus-within:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus-within:border-neutral-600">
      <label htmlFor="halden-composer" className="sr-only">
        Message Halden
      </label>
      <textarea
        id="halden-composer"
        ref={inputRef}
        rows={1}
        value={draft}
        onChange={(event) => {
          onDraft(event.target.value);
          const el = event.target;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        }}
        placeholder="Message Halden"
        className="block max-h-40 w-full resize-none bg-transparent px-3.5 pt-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-100"
      />
      <div className="flex items-center gap-1 px-2 pb-2 pt-1">
        <button
          type="button"
          aria-label="Add an attachment"
          className={cx(
            "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
            transition,
            focus,
          )}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-pressed="false"
          className={cx(
            "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] px-2 text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
            transition,
            focus,
          )}
        >
          <Globe aria-hidden="true" className="h-4 w-4 shrink-0" />
          Search
        </button>

        <div className="ml-auto flex items-center gap-1">
          <span className="hidden shrink-0 pr-1 text-xs text-neutral-500 sm:block dark:text-neutral-500">
            {model.name}
          </span>
          <button
            type="button"
            aria-label="Dictate"
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Mic aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Send message"
            disabled={draft.trim().length === 0}
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-95 disabled:pointer-events-none disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600",
              transition,
              focus,
            )}
          >
            <ArrowUp aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarBody({
  model,
  onModel,
  chatId,
  onChat,
  onNew,
  onClose,
  onCollapse,
  collapseRef,
}: {
  model: Model;
  onModel: (model: Model) => void;
  chatId: string | null;
  onChat: (id: string) => void;
  onNew: () => void;
  onClose?: () => void;
  onCollapse?: () => void;
  collapseRef?: React.Ref<HTMLButtonElement>;
}) {
  const pinned = CHATS[0];
  const PinnedIcon = pinned.icon;
  const nav = useScrollFade<HTMLDivElement>();

  return (
    <>
      <div className="flex h-[60px] shrink-0 items-center gap-2.5 px-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
        >
          H
        </span>
        <p className="min-w-0 flex-1 truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
          Halden
        </p>
        {onClose ? (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <button
            ref={collapseRef}
            type="button"
            aria-label="Collapse sidebar"
            aria-expanded={true}
            onClick={onCollapse}
            className={cx(
              "hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] lg:inline-flex dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <PanelLeft aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <button
          type="button"
          onClick={onNew}
          className={cx(
            "inline-flex h-9 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.98] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
            transition,
            focus,
          )}
        >
          <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
          New chat
          <Sparkles aria-hidden="true" className="ml-auto h-4 w-4 shrink-0" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={nav.ref}
          onScroll={nav.onScroll}
          className="h-full overflow-y-auto px-3 pb-3"
        >
          <div className="pb-4">
            <Overline>Model</Overline>
            <div
              role="radiogroup"
              aria-label="Model"
              className="grid grid-cols-3 gap-1.5"
            >
              {MODELS.map((option) => {
                const OptionIcon = option.icon;
                const selected = option.id === model.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onModel(option)}
                    className={cx(
                      "flex cursor-pointer flex-col items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border px-1 py-2.5 active:scale-[0.98]",
                      selected
                        ? "border-neutral-900 bg-neutral-50 text-neutral-900 dark:border-white dark:bg-neutral-800 dark:text-neutral-100"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    <OptionIcon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="w-full truncate text-center text-[11px] font-medium">
                      {option.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pb-4">
            <Overline>Pinned</Overline>
            <button
              type="button"
              onClick={() => onChat(pinned.id)}
              className={cx(
                "w-full cursor-pointer rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-2.5 py-2 text-left hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-800 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              <span className="flex items-center gap-2">
                <PinnedIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-neutral-500"
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                  {pinned.title}
                </span>
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 pl-6">
                <span className="rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {pinned.model}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-500">
                  <span className="tabular-nums">{pinned.count}</span> messages
                </span>
              </span>
            </button>
          </div>

          <div className="pb-4">
            <Overline>Recent</Overline>
            <ul className="space-y-0.5">
              {CHATS.map((chat) => {
                const ChatIcon = chat.icon;
                const selected = chat.id === chatId;
                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      aria-current={selected ? "page" : undefined}
                      onClick={() => onChat(chat.id)}
                      className={cx(
                        navRow,
                        selected ? navOn : navIdle,
                        transition,
                        focus,
                      )}
                    >
                      <ChatIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-neutral-500"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {chat.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <Overline>Quick actions</Overline>
            <ul className="space-y-0.5">
              {QUICK_ACTIONS.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <li key={action.label}>
                    <button
                      type="button"
                      className={cx(navRow, navIdle, transition, focus)}
                    >
                      <ActionIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-neutral-500"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {action.label}
                      </span>
                      {action.count !== undefined && (
                        <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                          {action.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
            nav.edges.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
            nav.edges.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <div className="flex h-[72px] shrink-0 items-center gap-2.5 px-3">
        <span className="relative shrink-0">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          >
            HA
          </span>
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-neutral-900 dark:text-neutral-100">
            Assistant
          </span>
          <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
            Online, replies instantly
          </span>
        </span>
      </div>
    </>
  );
}

export default function AppShell9() {
  const [model, setModel] = useState(MODELS[0]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [navShown, setNavShown] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const railFocusRef = useRef(false);
  const drawerRef = useRef<HTMLElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const thread = useScrollFade<HTMLDivElement>();
  const empty = useScrollFade<HTMLDivElement>();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!railFocusRef.current) return;
    railFocusRef.current = false;
    const target = sidebarOpen ? collapseRef.current : expandRef.current;
    target?.focus({ preventScroll: true });
  }, [sidebarOpen]);

  const chat = useMemo(
    () => CHATS.find((c) => c.id === chatId) ?? null,
    [chatId],
  );

  const closeNav = useCallback(() => {
    setNavShown(false);
    setNavOpen(false);
    if (shouldFocusRef.current) {
      menuTriggerRef.current?.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const drawer = drawerRef.current;
    const doc = drawer?.ownerDocument ?? document;
    const frame = requestAnimationFrame(() => setNavShown(true));

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNav();
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const nodes = drawer.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    doc.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen, closeNav]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = 0;
  }, [chatId]);

  const openChat = (id: string) => {
    setChatId(id);
    closeNav();
  };

  const startNew = () => {
    setChatId(null);
    setDraft("");
    closeNav();
    composerRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[720px] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950"
    >
      <div className="flex w-full min-w-0 p-3">
        <aside
          inert={!sidebarOpen}
          className={cx(
            "hidden shrink-0 overflow-hidden lg:block",
            "transition-[width,margin-right] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            sidebarOpen
              ? "mr-3 w-72 duration-[240ms]"
              : "mr-0 w-0 duration-200",
          )}
        >
          <div className="flex h-full w-72 flex-col rounded-[var(--rb-r-4xl,18px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <SidebarBody
              model={model}
              onModel={setModel}
              chatId={chatId}
              onChat={openChat}
              onNew={startNew}
              collapseRef={collapseRef}
              onCollapse={() => {
                railFocusRef.current = true;
                setSidebarOpen(false);
              }}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex h-[60px] shrink-0 items-center px-3">
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label="Open navigation"
              aria-expanded={navOpen}
              onClick={() => {
                shouldFocusRef.current = true;
                setNavOpen(true);
              }}
              className={cx(
                "mr-2 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              <Menu aria-hidden="true" className="h-4 w-4" />
            </button>

            <div
              className={cx(
                "hidden shrink-0 overflow-hidden lg:block",
                "transition-[width,margin-right] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                sidebarOpen
                  ? "mr-0 w-0 duration-200"
                  : "mr-2 w-9 duration-[240ms]",
              )}
            >
              <button
                ref={expandRef}
                type="button"
                aria-label="Expand sidebar"
                aria-expanded={sidebarOpen}
                tabIndex={sidebarOpen ? -1 : undefined}
                onClick={() => {
                  railFocusRef.current = true;
                  setSidebarOpen(true);
                }}
                className={cx(
                  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <PanelLeft aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <ModelMenu value={model} onChange={setModel} />

            <h1 className="ml-2 hidden min-w-0 flex-1 truncate text-[13px] text-neutral-500 sm:block dark:text-neutral-500">
              {chat ? chat.title : "New chat"}
            </h1>
            <span className="flex-1 sm:hidden" />

            <button
              type="button"
              className={cx(
                "ml-2 inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              <Share2 aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Share chat</span>
            </button>
          </header>

          {chat ? (
            <>
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div
                  ref={(el) => {
                    threadRef.current = el;
                    thread.ref.current = el;
                  }}
                  onScroll={thread.onScroll}
                  className="h-full overflow-y-auto px-4 sm:px-6"
                >
                  <div className="mx-auto flex max-w-2xl flex-col gap-5 py-6">
                    {chat.turns.map((turn, i) =>
                      turn.role === "user" ? (
                        <div key={i} className="flex justify-end">
                          <p className="max-w-[85%] rounded-[var(--rb-r-2xl,14px)] bg-neutral-100 px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                            {turn.text}
                          </p>
                        </div>
                      ) : (
                        <p
                          key={i}
                          className="max-w-[95%] text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
                        >
                          {turn.text}
                        </p>
                      ),
                    )}
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    thread.edges.start ? "opacity-100" : "opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    thread.edges.end ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>

              <div className="shrink-0 px-4 pt-2 sm:px-6">
                <div className="mx-auto max-w-2xl">
                  <Composer
                    draft={draft}
                    onDraft={setDraft}
                    model={model}
                    inputRef={composerRef}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                className="flex h-full flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-6"
                ref={empty.ref}
                onScroll={empty.onScroll}
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--rb-r-xl,12px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-base font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                >
                  H
                </span>
                <h2 className="mt-4 text-xl font-medium tracking-[-0.015em] text-neutral-900 sm:text-2xl sm:tracking-[-0.02em] dark:text-neutral-100">
                  How can I help?
                </h2>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-500">
                  Start typing, or pick one of these to get going.
                </p>

                <div className="mt-6 w-full max-w-2xl">
                  <Composer
                    draft={draft}
                    onDraft={setDraft}
                    model={model}
                    inputRef={composerRef}
                  />
                </div>

                <div className="mt-3 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {PROMPTS.map((prompt) => {
                    const PromptIcon = prompt.icon;
                    return (
                      <button
                        key={prompt.label}
                        type="button"
                        onClick={() => {
                          setDraft(prompt.label);
                          composerRef.current?.focus({ preventScroll: true });
                        }}
                        className={cx(
                          "group flex h-12 cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-3 text-left hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-800 dark:hover:bg-neutral-800",
                          transition,
                          focus,
                        )}
                      >
                        <PromptIcon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-neutral-500"
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                          {prompt.label}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-neutral-400 transition-colors duration-150 ease-out group-hover:text-neutral-900 dark:text-neutral-600 dark:group-hover:text-neutral-100"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                  empty.edges.start ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                  empty.edges.end ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          )}

          <p className="shrink-0 px-4 pb-3 pt-2 text-center text-xs text-neutral-500 sm:px-6 dark:text-neutral-500">
            Halden can make mistakes. Check anything important.
          </p>
        </div>
      </div>

      {navOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={closeNav}
            tabIndex={-1}
            className={cx(
              "absolute inset-0 z-30 cursor-pointer bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out dark:bg-neutral-950/60",
              navShown ? "opacity-100" : "opacity-0",
            )}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col rounded-r-[var(--rb-r-4xl,18px)] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-neutral-900 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]",
              navShown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarBody
              model={model}
              onModel={setModel}
              chatId={chatId}
              onChat={openChat}
              onNew={startNew}
              onClose={closeNav}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
