"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { VeloraItem } from "@/lib/public-site/velora-premium-template-content";
import {
  parseVeloraAvailabilitySelection,
  type VeloraAvailabilitySelection,
} from "@/lib/public-site/velora-availability-selection";
import styles from "./Velora.module.css";

type Selection = VeloraAvailabilitySelection;
const SelectionContext = createContext<{
  selection: Selection;
  choose(kind: keyof Selection, value: string): void;
} | null>(null);

export function VeloraInteractiveShell({
  children,
  venues,
  packages,
}: {
  children: React.ReactNode;
  venues: VeloraItem[];
  packages: VeloraItem[];
}) {
  const [selection, setSelection] = useState<Selection>({
    venue: "",
    packageName: "",
  });
  const choose = useCallback((kind: keyof Selection, value: string) => {
    setSelection((current) => ({ ...current, [kind]: value }));
    requestAnimationFrame(() => {
      document
        .getElementById("availability")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            `#availability [name="${kind === "packageName" ? "package" : kind}"]`,
          )
          ?.focus(),
      );
    });
  }, []);
  useEffect(() => {
    setSelection(
      parseVeloraAvailabilitySelection(
        window.location.search,
        venues.map((item) => item.name),
        packages.map((item) => item.name),
      ),
    );
  }, [packages, venues]);
  return (
    <SelectionContext.Provider value={{ selection, choose }}>
      {children}
    </SelectionContext.Provider>
  );
}

function SelectionButton({
  kind,
  value,
  label,
}: {
  kind: keyof Selection;
  value: string;
  label: string;
}) {
  const context = useContext(SelectionContext);
  return (
    <button
      className={styles.selectionCta}
      type="button"
      onClick={() => context?.choose(kind, value)}
    >
      {label}
    </button>
  );
}

export const VeloraVenueCta = ({
  venue,
  label,
}: {
  venue: string;
  label: string;
}) => <SelectionButton kind="venue" value={venue} label={label} />;
export const VeloraPackageCta = ({
  packageName,
  label,
}: {
  packageName: string;
  label: string;
}) => <SelectionButton kind="packageName" value={packageName} label={label} />;

export function VeloraAvailability({
  businessSlug,
  venues,
  packages,
  formats,
  copy,
}: {
  businessSlug: string;
  venues: VeloraItem[];
  packages: VeloraItem[];
  formats: VeloraItem[];
  copy: VeloraItem;
}) {
  const context = useContext(SelectionContext);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const today = new Date();
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const data = new FormData(event.currentTarget);
    const message = `Дата: ${data.get("date")}. Формат: ${data.get("eventType")}. Гостей: ${data.get("guests")}. Зал: ${data.get("venue")}. Пакет: ${data.get("package")}.`;
    try {
      const { error } = await getSupabaseBrowserClient().rpc(
        "create_public_request",
        {
          p_business_slug: businessSlug,
          p_client_name: String(data.get("name") ?? ""),
          p_client_email: String(data.get("email") ?? ""),
          p_client_phone: String(data.get("phone") ?? ""),
          p_client_locale: "ru",
          p_business_type: "event_venue",
          p_subject: copy.subject,
          p_message: message,
          p_request_key: crypto.randomUUID(),
        },
      );
      setStatus(error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      className={styles.availabilityForm}
      onSubmit={submit}
      aria-label={copy.ariaLabel}
    >
      <label>
        {copy.dateLabel}
        <input name="date" type="date" min={minimumDate} required />
      </label>
      <label>
        {copy.formatLabel}
        <select name="eventType" required defaultValue="">
          <option value="" disabled>
            {copy.formatPlaceholder}
          </option>
          {formats.map((item) => (
            <option key={item.title} value={item.title}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        {copy.guestsLabel}
        <input
          name="guests"
          type="number"
          min="2"
          max="220"
          inputMode="numeric"
          required
          placeholder={copy.guestsPlaceholder}
        />
      </label>
      <label>
        {copy.venueLabel}
        <select
          name="venue"
          required
          value={context?.selection.venue ?? ""}
          onChange={(event) => context?.choose("venue", event.target.value)}
        >
          <option value="" disabled>
            {copy.venuePlaceholder}
          </option>
          {venues.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {copy.packageLabel}
        <select
          name="package"
          required
          value={context?.selection.packageName ?? ""}
          onChange={(event) =>
            context?.choose("packageName", event.target.value)
          }
        >
          <option value="" disabled>
            {copy.packagePlaceholder}
          </option>
          {packages.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {copy.nameLabel}
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        {copy.emailLabel}
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        {copy.phoneLabel}
        <input name="phone" type="tel" autoComplete="tel" required />
      </label>
      <button disabled={status === "sending"} type="submit">
        {status === "sending" ? copy.pending : copy.submit}
      </button>
      <p className={styles.formStatus} role="status" aria-live="polite">
        {status === "sent"
          ? copy.success
          : status === "error"
            ? copy.error
            : copy.idle}
      </p>
    </form>
  );
}

export function VeloraGallery({
  items,
  copy,
}: {
  items: VeloraItem[];
  copy: VeloraItem;
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (active === null || !items.length) return;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight")
        setActive((value) =>
          value === null ? null : (value + 1) % items.length,
        );
      if (event.key === "ArrowLeft")
        setActive((value) =>
          value === null ? null : (value - 1 + items.length) % items.length,
        );
      if (event.key === "Tab") {
        const focusable = [
          ...(dialogRef.current?.querySelectorAll<HTMLElement>(
            "button, [href], [tabindex]:not([tabindex='-1'])",
          ) ?? []),
        ];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1)!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, items.length]);

  useEffect(() => {
    if (active === null) openerRef.current?.focus();
  }, [active]);

  if (!items.length) return null;
  return (
    <>
      <div className={styles.galleryGrid}>
        {items.map((item, index) => (
          <button
            type="button"
            onClick={(event) => {
              openerRef.current = event.currentTarget;
              setActive(index);
            }}
            key={`${item.image}-${index}`}
            aria-label={`${copy.openLabel}: ${item.alt}`}
          >
            <Image
              src={item.image}
              alt={item.alt}
              width={1200}
              height={900}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </button>
        ))}
      </div>
      {active !== null && items[active] ? (
        <div
          ref={dialogRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={copy.dialogLabel}
          onMouseDown={(event) =>
            event.currentTarget === event.target && close()
          }
        >
          <button type="button" onClick={close} aria-label={copy.closeLabel}>
            ×
          </button>
          <Image
            src={items[active].image}
            alt={items[active].alt}
            width={1600}
            height={1100}
            sizes="90vw"
          />
          <p>
            {items[active].alt} · {active + 1}/{items.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
