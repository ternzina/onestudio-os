"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { AlertCircle, Check, Loader2, Upload, User } from "lucide-react";

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

const inputClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const textareaClass =
  "min-h-20 w-full resize-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const errorBox =
  "border-red-500 hover:border-red-500 focus:border-red-500 focus-visible:outline-red-500 focus-within:border-red-500 focus-within:outline-red-500 dark:border-red-500 dark:hover:border-red-500 dark:focus:border-red-500 dark:focus-visible:outline-red-500 dark:focus-within:border-red-500 dark:focus-within:outline-red-500";

const prefixedInputBox =
  "flex h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:outline-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus-within:border-white dark:focus-within:outline-white";

const prefixedInput =
  "min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-100 dark:placeholder:text-neutral-500";

const secondaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const tertiaryButton =
  "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-700 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const primaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const rowLabelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const rowDescriptionClass = "mt-0.5 text-[13px] text-neutral-500";

const helpTextClass = "text-xs text-neutral-500";

const BIO_LIMIT = 160;

const savedValues = {
  name: "Mara Whitfield",
  username: "mara.whitfield",
  email: "mara.whitfield@northwind.co",
  role: "Product designer",
  bio: "Designing the tools our operations team uses every day. Previously at Fieldbase.",
};

type Values = typeof savedValues;

function SettingsRow({
  id,
  label,
  description,
  native,
  changed,
  children,
}: {
  id: string;
  label: string;
  description: string;
  native: boolean;
  changed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:bg-neutral-800/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {native ? (
            <label htmlFor={id} className={rowLabelClass}>
              {label}
            </label>
          ) : (
            <span id={`${id}-label`} className={rowLabelClass}>
              {label}
            </span>
          )}
          {changed ? (
            <span className="rounded-[var(--rb-r-xs,4px)] bg-amber-100 px-1.5 py-0.5 text-[11px] leading-none font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              Changed
            </span>
          ) : null}
        </div>
        <p id={`${id}-hint`} className={rowDescriptionClass}>
          {description}
        </p>
      </div>
      <div className="w-full sm:w-80 sm:shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsForm2() {
  const body = useScrollFade<HTMLDivElement>();
  const reduce = useReducedMotion();
  const [values, setValues] = useState<Values>({
    ...savedValues,
    username: "mara",
  });
  const [baseline, setBaseline] = useState<Values>(savedValues);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo);
  }, [photo]);

  const set = (key: keyof Values) => (v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const usernameError = useMemo(() => {
    const u = values.username.trim();
    if (u.length < 3) return "Use at least 3 characters.";
    if (!/^[a-z0-9-]+$/.test(u))
      return "Use lowercase letters, numbers, and hyphens only.";
    if (u === "mara") return "mara is taken. Try another handle.";
    return undefined;
  }, [values.username]);

  const bioError =
    values.bio.length > BIO_LIMIT
      ? `Remove ${values.bio.length - BIO_LIMIT} characters to fit the limit.`
      : undefined;

  const dirtyKeys = useMemo(
    () =>
      (Object.keys(values) as (keyof Values)[]).filter(
        (k) => values[k] !== baseline[k],
      ),
    [values, baseline],
  );
  const dirty = dirtyKeys.length > 0;
  const isChanged = (k: keyof Values) => dirtyKeys.includes(k);

  const canSave = dirty && !usernameError && !bioError && !saving;

  const save = () => {
    if (!canSave) return;
    setSaving(true);
    window.setTimeout(
      () => {
        setBaseline(values);
        setSaving(false);
      },
      reduce ? 0 : 700,
    );
  };

  const cancel = () => setValues(baseline);

  return (
    <div className="relative flex h-full min-h-[800px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="shrink-0 px-4 sm:px-6">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center">
          <h2 className="truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Public profile
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
                  Account
                </h3>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  The profile other people see when you collaborate.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 p-1.5">
                <div className="flex flex-col gap-3 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:bg-neutral-800/50">
                  <div className="min-w-0 flex-1">
                    <p className={rowLabelClass}>Profile photo</p>
                    <p className={rowDescriptionClass}>
                      JPG, PNG, or GIF up to 2 MB.
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-3 sm:w-80 sm:shrink-0 sm:justify-end">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      className="sr-only"
                      aria-label="Upload a profile photo"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPhoto(URL.createObjectURL(file));
                        e.target.value = "";
                      }}
                    />
                    {photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photo}
                        alt="Your profile photo"
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        MW
                      </span>
                    )}
                    <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-2 sm:flex-none">
                      <button
                        type="button"
                        className={tertiaryButton}
                        onClick={() => fileInput.current?.click()}
                      >
                        <Upload
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        Change
                      </button>
                      {photo ? (
                        <button
                          type="button"
                          className={tertiaryButton}
                          onClick={() => setPhoto(null)}
                        >
                          <User
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <SettingsRow
                  id="pf-name"
                  changed={isChanged("name")}
                  label="Full name"
                  description="Shown with comments, edits, and shared documents."
                  native
                >
                  <input
                    id="pf-name"
                    value={values.name}
                    aria-describedby="pf-name-hint"
                    onChange={(e) => set("name")(e.target.value)}
                    className={inputClass}
                  />
                </SettingsRow>

                <SettingsRow
                  id="pf-role"
                  changed={isChanged("role")}
                  label="Title"
                  description="A short role that appears beneath your name."
                  native
                >
                  <input
                    id="pf-role"
                    value={values.role}
                    aria-describedby="pf-role-hint"
                    onChange={(e) => set("role")(e.target.value)}
                    className={inputClass}
                  />
                </SettingsRow>

                <SettingsRow
                  id="pf-username"
                  changed={isChanged("username")}
                  label="Username"
                  description="This is the address of your public profile."
                  native
                >
                  <div
                    className={cx(prefixedInputBox, usernameError && errorBox)}
                  >
                    <span className="mr-1.5 inline-flex items-center text-neutral-400 dark:text-neutral-500">
                      northwind.co/
                    </span>
                    <input
                      id="pf-username"
                      value={values.username}
                      aria-invalid={usernameError ? true : undefined}
                      aria-describedby={
                        usernameError
                          ? "pf-username-error pf-username-hint"
                          : "pf-username-hint"
                      }
                      onChange={(e) => set("username")(e.target.value)}
                      className={prefixedInput}
                    />
                  </div>
                  {usernameError ? (
                    <p
                      id="pf-username-error"
                      role="alert"
                      className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      <AlertCircle
                        aria-hidden="true"
                        className="mt-px h-3.5 w-3.5 shrink-0"
                      />
                      {usernameError}
                    </p>
                  ) : null}
                </SettingsRow>

                <SettingsRow
                  id="pf-email"
                  changed={isChanged("email")}
                  label="Email"
                  description="Used for sign-in and account notices."
                  native
                >
                  <input
                    id="pf-email"
                    type="email"
                    value={values.email}
                    aria-describedby="pf-email-hint pf-email-help"
                    onChange={(e) => set("email")(e.target.value)}
                    className={inputClass}
                  />
                  <p id="pf-email-help" className={cx(helpTextClass, "mt-1.5")}>
                    Never shown publicly.
                  </p>
                </SettingsRow>

                <SettingsRow
                  id="pf-bio"
                  changed={isChanged("bio")}
                  label="Bio"
                  description="A short line under your name."
                  native
                >
                  <textarea
                    id="pf-bio"
                    rows={3}
                    value={values.bio}
                    aria-invalid={bioError ? true : undefined}
                    aria-describedby={
                      bioError
                        ? "pf-bio-error pf-bio-hint"
                        : "pf-bio-hint pf-bio-count"
                    }
                    onChange={(e) => set("bio")(e.target.value)}
                    className={cx(textareaClass, bioError && errorBox)}
                  />
                  {bioError ? (
                    <p
                      id="pf-bio-error"
                      role="alert"
                      className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      <AlertCircle
                        aria-hidden="true"
                        className="mt-px h-3.5 w-3.5 shrink-0"
                      />
                      {bioError}
                    </p>
                  ) : (
                    <p
                      id="pf-bio-count"
                      className={cx(helpTextClass, "mt-1.5 text-right")}
                    >
                      <span className="tabular-nums">{values.bio.length}</span>{" "}
                      of <span className="tabular-nums">{BIO_LIMIT}</span>{" "}
                      characters
                    </p>
                  )}
                </SettingsRow>
              </div>

              <div className="flex flex-col gap-3 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900/60">
                <p
                  aria-live="polite"
                  className="flex min-w-0 items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-400"
                >
                  {dirty ? (
                    <>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span className="truncate">Unsaved profile changes</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 shrink-0 text-neutral-500" />
                      <span className="truncate">Profile up to date</span>
                    </>
                  )}
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancel}
                    disabled={!dirty || saving}
                    className={cx(secondaryButton, "w-full sm:w-auto")}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={!canSave}
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
                      "Save profile"
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
