"use client";

import { useMemo, useRef, useState } from "react";
import { AtSign, Bold, Italic, Link2, Paperclip, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

type Person = { name: string; handle: string; team: string };

const PEOPLE: Person[] = [
  { name: "Priya Nandakumar", handle: "priya", team: "Platform" },
  { name: "Marcus Bell", handle: "marcus", team: "Infrastructure" },
  { name: "Sofia Alvarez", handle: "sofia", team: "Platform" },
  { name: "Wei Chen", handle: "wei", team: "Data" },
  { name: "Tomás Guerrero", handle: "tomas", team: "Reliability" },
];

const ATTACHMENTS = ["pool-saturation.png", "backfill-plan.md"];

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";
const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const THREAD = [
  {
    author: "Wei Chen",
    time: "4h ago",
    body: "Hard-coding eight workers will bite us when the pool size changes. Read it from the pool config so the two never drift apart.",
  },
  {
    author: "Marcus Bell",
    time: "2h ago",
    body: "Agreed, and the same argument applies to the timeout. A slow region should not silently inherit the default.",
  },
  {
    author: "Sofia Alvarez",
    time: "38m ago",
    body: "I pulled both values into the region config so there is one place to change them. Screenshot of the saturation graph is attached.",
  },
];

export default function Comments4() {
  const [draft, setDraft] = useState("Nice catch on the pool cap. @");
  const [attached, setAttached] = useState(ATTACHMENTS);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const query = useMemo(() => {
    const at = draft.lastIndexOf("@");
    if (at === -1) return null;
    const rest = draft.slice(at + 1);
    return /\s/.test(rest) ? null : rest.toLowerCase();
  }, [draft]);

  const matches = useMemo(
    () =>
      query === null
        ? []
        : PEOPLE.filter(
            (p) =>
              p.handle.startsWith(query) ||
              p.name.toLowerCase().includes(query),
          ),
    [query],
  );

  const pick = (person: Person) => {
    const at = draft.lastIndexOf("@");
    setDraft(`${draft.slice(0, at)}@${person.handle} `);
    setHighlight(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      pick(matches[highlight]);
    }
  };

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[620px]">
        <div className="mb-3">
          <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Leave a comment
          </h2>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            Type @ to mention a teammate. They are notified once you post.
          </p>
        </div>

        <div className="relative z-10 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex gap-3">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[12px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              AW
            </span>

            <div className="min-w-0 flex-1">
              <label htmlFor="comments-4-draft" className="sr-only">
                Write a comment
              </label>
              <textarea
                id="comments-4-draft"
                ref={inputRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setHighlight(0);
                }}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Write a comment"
                className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
              />

              {attached.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {attached.map((file) => (
                    <span
                      key={file}
                      className="inline-flex h-7 items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 pr-1 pl-2 text-[12px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
                    >
                      <Paperclip className="h-3 w-3 shrink-0" aria-hidden />
                      <span className="max-w-[140px] truncate">{file}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${file}`}
                        onClick={() =>
                          setAttached((a) => a.filter((f) => f !== file))
                        }
                        className={cx(
                          "inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[var(--rb-r-xs,4px)] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
                          transition,
                          focus,
                        )}
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-0.5">
              {(
                [
                  [Bold, "Bold"],
                  [Italic, "Italic"],
                  [Link2, "Add link"],
                  [AtSign, "Mention someone"],
                  [Paperclip, "Attach a file"],
                ] as const
              ).map(([Icon, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[12px] text-neutral-500 sm:inline">
                Enter to post
              </span>
              <button
                type="button"
                disabled={draft.trim().length === 0}
                className={cx(
                  "inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] bg-neutral-900 px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-neutral-100 dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
                  "hover:bg-neutral-800 dark:hover:bg-white",
                  "disabled:pointer-events-none disabled:opacity-40",
                  transition,
                  focus,
                )}
              >
                Comment
              </button>
            </div>
          </div>

          {matches.length > 0 && (
            <div
              role="listbox"
              aria-label="Mention suggestions"
              className="absolute top-[calc(100%-6px)] left-[52px] z-20 max-h-[200px] w-[260px] max-w-[calc(100%-52px)] overflow-y-auto rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white p-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900"
            >
              {matches.map((person, i) => (
                <button
                  key={person.handle}
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(person)}
                  className={cx(
                    "flex w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-sm,6px)] px-2 py-1.5 text-left",
                    i === highlight
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {initials(person.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                      {person.name}
                    </span>
                    <span className="block truncate text-[12px] text-neutral-500">
                      @{person.handle} · {person.team}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 mb-2 px-1 text-[12px] text-neutral-500">
          Earlier in this thread
        </p>

        <div className={frame}>
          <div
            className={cx(panel, "max-h-[200px] overflow-y-auto sm:max-h-none")}
          >
            {THREAD.map((note) => (
              <article key={note.author} className="flex gap-3 px-4 py-3.5">
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {initials(note.author)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {note.author}
                    <span className="ml-2 font-normal text-neutral-500">
                      {note.time}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {note.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
