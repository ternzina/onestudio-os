"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
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

export function VeloraReveal({
  children,
  className,
  as = "div",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article";
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const reduced = useReducedMotion();
  const Component = as === "article" ? motion.article : motion.div;
  const offset =
    direction === "left"
      ? { x: -54, y: 0 }
      : direction === "right"
        ? { x: 54, y: 0 }
        : { x: 0, y: 42 };
  return (
    <Component
      className={className}
      initial={reduced ? false : { opacity: 0, ...offset }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}

export function VeloraScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  return reduced ? null : (
    <motion.div
      aria-hidden="true"
      className={styles.scrollProgress}
      style={{ scaleX: scrollYProgress }}
    />
  );
}

export function VeloraHeroMedia({
  image,
  alt,
}: {
  image: string;
  alt: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.01, 1.1]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["4%", "24%"]);
  return (
    <div ref={target} className={styles.heroMedia}>
      <motion.div
        className={styles.heroMediaInner}
        style={reduced ? undefined : { y, scale }}
      >
        <Image src={image} alt={alt} fill priority sizes="100vw" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className={styles.heroGlow}
        style={reduced ? undefined : { left: glowX }}
      />
      <div className={styles.heroShade} />
      <div aria-hidden="true" className={styles.heroGrain} />
    </div>
  );
}

export function VeloraTiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 170, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 170, damping: 20 });
  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 6);
    rotateX.set(((event.clientY - rect.top) / rect.height - 0.5) * -6);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  return (
    <motion.article
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={
        reduced
          ? undefined
          : { rotateX: springX, rotateY: springY, transformPerspective: 1100 }
      }
    >
      {children}
    </motion.article>
  );
}

export function VeloraStoryFilm({
  items,
  images,
}: {
  items: VeloraItem[];
  images: Array<{ image: string; alt: string }>;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = images[active % images.length];
  return (
    <div className={styles.storyFilm}>
      <div className={styles.storyVisual}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.image}
            initial={reduced ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={current.image}
              alt={current.alt}
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </motion.div>
        </AnimatePresence>
        <span aria-hidden="true">0{active + 1}</span>
      </div>
      <div className={styles.storyChapters}>
        {items.map((item, index) => (
          <motion.article
            key={item.number}
            className={index === active ? styles.storyChapterActive : ""}
            onViewportEnter={() => setActive(index)}
            viewport={{ amount: 0.65 }}
            initial={reduced ? false : { opacity: 0.35 }}
            whileInView={{ opacity: 1 }}
          >
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function VeloraTransformation({ copy }: { copy: VeloraItem }) {
  const [position, setPosition] = useState(56);
  return (
    <div
      className={styles.transformation}
      style={{ "--reveal": `${position}%` } as React.CSSProperties}
    >
      <Image
        src={copy.beforeImage}
        alt={copy.beforeAlt}
        fill
        sizes="(max-width: 768px) 94vw, 86vw"
      />
      <div className={styles.afterImage}>
        <Image
          src={copy.afterImage}
          alt={copy.afterAlt}
          fill
          sizes="(max-width: 768px) 94vw, 86vw"
        />
      </div>
      <span className={styles.beforeLabel}>{copy.beforeLabel}</span>
      <span className={styles.afterLabel}>{copy.afterLabel}</span>
      <label>
        <span className="sr-only">{copy.title}</span>
        <input
          aria-label={copy.title}
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

export function VeloraMobileCta({ label }: { label: string }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const targets = [document.getElementById("availability"), document.querySelector("footer")].filter(Boolean) as Element[];
    const observer = new IntersectionObserver((entries) => setHidden(entries.some((entry) => entry.isIntersecting)), { threshold: 0.05 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return <a className={`${styles.mobileCta} ${hidden ? styles.mobileCtaHidden : ""}`} href="#availability" aria-hidden={hidden ? "true" : undefined} tabIndex={hidden ? -1 : undefined}>{label}</a>;
}

export function VeloraInteractiveShell({
  children,
  venues,
  packages,
}: {
  children: React.ReactNode;
  venues: VeloraItem[];
  packages: VeloraItem[];
}) {
  const reduced = useReducedMotion();
  const [selection, setSelection] = useState<Selection>({
    venue: "",
    packageName: "",
  });
  const choose = useCallback((kind: keyof Selection, value: string) => {
    setSelection((current) => ({ ...current, [kind]: value }));
    requestAnimationFrame(() => {
      document
        .getElementById("availability")
        ?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            `#availability [name="${kind === "packageName" ? "package" : kind}"]`,
          )
          ?.focus(),
      );
    });
  }, [reduced]);
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
  locale,
}: {
  businessSlug: string;
  venues: VeloraItem[];
  packages: VeloraItem[];
  formats: VeloraItem[];
  copy: VeloraItem;
  locale: string;
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
    const message =
      locale === "en"
        ? `Date: ${data.get("date")}. Format: ${data.get("eventType")}. Guests: ${data.get("guests")}. Space: ${data.get("venue")}. Package: ${data.get("package")}.`
        : `Дата: ${data.get("date")}. Формат: ${data.get("eventType")}. Гостей: ${data.get("guests")}. Зал: ${data.get("venue")}. Пакет: ${data.get("package")}.`;
    try {
      const { error } = await getSupabaseBrowserClient().rpc(
        "create_public_request",
        {
          p_business_slug: businessSlug,
          p_client_name: String(data.get("name") ?? ""),
          p_client_email: String(data.get("email") ?? ""),
          p_client_phone: String(data.get("phone") ?? ""),
          p_client_locale: locale,
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
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
          <button
            className={styles.lightboxPrevious}
            type="button"
            onClick={() =>
              setActive((active - 1 + items.length) % items.length)
            }
            aria-label={copy.previousLabel}
          >
            ←
          </button>
          <Image
            src={items[active].image}
            alt={items[active].alt}
            width={1600}
            height={1100}
            sizes="90vw"
          />
          <button
            className={styles.lightboxNext}
            type="button"
            onClick={() => setActive((active + 1) % items.length)}
            aria-label={copy.nextLabel}
          >
            →
          </button>
          <p>
            {items[active].alt} · {active + 1}/{items.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
