"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useReducedMotion } from "motion/react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const RO = el.ownerDocument.defaultView?.ResizeObserver;
    const ro = RO ? new RO(update) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [update]);
  return { ref, edges, onScroll: update };
}

const selectClass =
  "h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const radioClass =
  "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-neutral-300 bg-white transition-colors duration-150 checked:border-[5px] checked:border-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxClass =
  "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[var(--rb-r-xs,4px)] border border-neutral-300 bg-white transition-colors duration-150 checked:border-neutral-900 checked:bg-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:checked:bg-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxBox =
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center";

const checkboxMark =
  "pointer-events-none absolute h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] opacity-0 transition-opacity duration-150 peer-checked:opacity-100 motion-reduce:transition-none dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]";

const secondaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const primaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const badgeNeutral =
  "inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

const rowLabelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

const densityOptions = [
  { value: "comfortable", label: "Comfortable" },
  { value: "cozy", label: "Cozy" },
  { value: "compact", label: "Compact" },
] as const;

const languageOptions = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "ja", label: "Japanese" },
] as const;

function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelledBy: string;
  describedBy: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
        "disabled:pointer-events-none disabled:opacity-50",
        checked
          ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
          : "bg-neutral-200 dark:bg-neutral-700",
      )}
    >
      <span
        className={cx(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SettingsRow({
  id,
  label,
  description,
  badge,
  changed,
  native,
  inline,
  children,
}: {
  id: string;
  label: string;
  description: string;
  badge?: ReactNode;
  changed?: boolean;
  native?: boolean;
  inline?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50",
        inline
          ? "flex items-center justify-between gap-4"
          : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {native ? (
            <label htmlFor={id} className={rowLabelClass}>
              {label}
            </label>
          ) : (
            <span id={`${id}-label`} className={rowLabelClass}>
              {label}
            </span>
          )}
          {badge}
          {changed ? (
            <span className="rounded-[var(--rb-r-xs,4px)] bg-amber-100 px-1.5 py-0.5 text-[11px] leading-none font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              Changed
            </span>
          ) : null}
        </div>
        <p id={`${id}-hint`} className="mt-0.5 text-[13px] text-neutral-500">
          {description}
        </p>
      </div>
      <div className={inline ? "shrink-0" : "w-full sm:w-80 sm:shrink-0"}>
        {children}
      </div>
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}

const savedPrefs = {
  theme: "system",
  density: "cozy",
  language: "en",
  weekly: true,
  mentions: true,
  comments: false,
  sounds: false,
};

type Prefs = typeof savedPrefs;

export default function SettingsForm3() {
  const body = useScrollFade<HTMLDivElement>();
  const reduce = useReducedMotion();
  const [prefs, setPrefs] = useState<Prefs>({
    ...savedPrefs,
    theme: "dark",
    comments: true,
  });
  const [baseline, setBaseline] = useState<Prefs>(savedPrefs);
  const [saving, setSaving] = useState(false);

  const set =
    <K extends keyof Prefs>(key: K) =>
    (v: Prefs[K]) =>
      setPrefs((prev) => ({ ...prev, [key]: v }));

  const dirtyKeys = useMemo(
    () =>
      (Object.keys(prefs) as (keyof Prefs)[]).filter(
        (k) => prefs[k] !== baseline[k],
      ),
    [prefs, baseline],
  );
  const dirty = dirtyKeys.length > 0;
  const isChanged = (k: keyof Prefs) => dirtyKeys.includes(k);

  const save = () => {
    if (!dirty || saving) return;
    setSaving(true);
    window.setTimeout(
      () => {
        setBaseline(prefs);
        setSaving(false);
      },
      reduce ? 0 : 700,
    );
  };

  return (
    <div className="relative flex h-full min-h-[800px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="shrink-0 px-4 sm:px-6">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center">
          <h2 className="truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Preferences
          </h2>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={body.ref}
          onScroll={body.onScroll}
          className="h-full overflow-y-auto px-4 sm:px-6"
        >
          <div className="mx-auto w-full max-w-2xl pb-4 sm:pb-6">
            <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Workspace preferences
                </h3>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  Defaults for appearance, editing, and notifications.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 p-1.5">
                <SettingsRow
                  id="pref-theme"
                  changed={isChanged("theme")}
                  label="Theme"
                  description="Choose how this device renders the interface."
                  badge={<span className={badgeNeutral}>This device</span>}
                >
                  <div
                    role="radiogroup"
                    aria-labelledby="pref-theme-label"
                    aria-describedby="pref-theme-hint"
                    className="grid grid-cols-3 gap-1.5"
                  >
                    {themeOptions.map((o) => (
                      <label
                        key={o.value}
                        className="flex h-9 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-white px-2.5 text-[13px] font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={o.value}
                          checked={prefs.theme === o.value}
                          onChange={(e) => {
                            if (!e.target.checked) return;
                            set("theme")(o.value);
                          }}
                          className={radioClass}
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </SettingsRow>

                <SettingsRow
                  id="pref-density"
                  changed={isChanged("density")}
                  label="Density"
                  description="Set the default spacing for tables and panels."
                  badge={<span className={badgeNeutral}>Recommended</span>}
                  native
                >
                  <Select
                    id="pref-density"
                    value={prefs.density}
                    onChange={set("density")}
                    options={densityOptions}
                  />
                </SettingsRow>

                <SettingsRow
                  id="pref-language"
                  changed={isChanged("language")}
                  label="Language"
                  description="Use this language for shared workspace screens."
                  native
                >
                  <Select
                    id="pref-language"
                    value={prefs.language}
                    onChange={set("language")}
                    options={languageOptions}
                  />
                </SettingsRow>

                <SettingsRow
                  id="pref-weekly"
                  changed={isChanged("weekly")}
                  label="Weekly summary"
                  description="A digest of activity every Monday morning."
                  badge={<span className={badgeNeutral}>Recommended</span>}
                  inline
                >
                  <Switch
                    checked={prefs.weekly}
                    onChange={set("weekly")}
                    labelledBy="pref-weekly-label"
                    describedBy="pref-weekly-hint"
                  />
                </SettingsRow>

                <SettingsRow
                  id="pref-mentions"
                  changed={isChanged("mentions")}
                  label="Mentions"
                  description="Notify me when someone mentions my name."
                  inline
                >
                  <Switch
                    checked={prefs.mentions}
                    onChange={set("mentions")}
                    labelledBy="pref-mentions-label"
                    describedBy="pref-mentions-hint"
                  />
                </SettingsRow>

                <SettingsRow
                  id="pref-comments"
                  changed={isChanged("comments")}
                  label="Comment replies"
                  description="Replies to threads I have posted in."
                  inline
                >
                  <Switch
                    checked={prefs.comments}
                    onChange={set("comments")}
                    labelledBy="pref-comments-label"
                    describedBy="pref-comments-hint"
                  />
                </SettingsRow>

                <div className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50">
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <span className={cx(checkboxBox, "mt-0.5")}>
                      <input
                        type="checkbox"
                        checked={prefs.sounds}
                        aria-describedby="pref-sounds-hint"
                        onChange={(e) => set("sounds")(e.target.checked)}
                        className={checkboxClass}
                      />
                      <Check
                        aria-hidden="true"
                        strokeWidth={3}
                        className={checkboxMark}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className={cx(rowLabelClass, "block")}>
                        Play notification sounds
                      </span>
                      <span
                        id="pref-sounds-hint"
                        className="mt-0.5 block text-[13px] text-neutral-500"
                      >
                        A short chime when something needs your attention.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900/60">
                <p
                  aria-live="polite"
                  className="flex min-w-0 items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-400"
                >
                  {dirty ? (
                    <>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span className="truncate">Unsaved preferences</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 shrink-0 text-neutral-500" />
                      <span className="truncate">Preferences saved</span>
                    </>
                  )}
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setPrefs(baseline)}
                    disabled={!dirty || saving}
                    className={cx(secondaryButton, "w-full sm:w-auto")}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={!dirty || saving}
                    className={cx(
                      primaryButton,
                      "w-full min-w-[7.5rem] sm:w-auto",
                    )}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                        Saving
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
            body.edges.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
            body.edges.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}
