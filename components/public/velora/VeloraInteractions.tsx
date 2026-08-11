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

function splitHeroTitle(title: string) {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 4) return [title, ""] as const;
  const splitAt = Math.max(2, Math.ceil(words.length * 0.56));
  return [
    words.slice(0, splitAt).join(" "),
    words.slice(splitAt).join(" "),
  ] as const;
}

export function VeloraPageEntrance() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <motion.div
      aria-hidden="true"
      className={styles.pageEntrance}
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.i
        initial={{ opacity: 0.9, scaleX: 0.18 }}
        animate={{ opacity: 0, scaleX: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}

export function VeloraStickyHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 36);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header
      className={`${className ?? ""} ${scrolled ? styles.headerScrolled : ""}`}
    >
      {children}
    </header>
  );
}

export function VeloraCursorTrail() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-120);
  const y = useMotionValue(-120);
  const trailX = useSpring(x, { stiffness: 115, damping: 19, mass: 0.55 });
  const trailY = useSpring(y, { stiffness: 115, damping: 19, mass: 0.55 });
  const auraX = useSpring(x, { stiffness: 58, damping: 18, mass: 0.85 });
  const auraY = useSpring(y, { stiffness: 58, damping: 18, mass: 0.85 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (event: PointerEvent) => {
      if (!pointer.matches) return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [reduced, x, y]);

  if (reduced) return null;
  return (
    <div
      aria-hidden="true"
      className={`${styles.cursorLayer} ${visible ? styles.cursorVisible : ""}`}
    >
      <motion.i className={styles.cursorAura} style={{ x: auraX, y: auraY }} />
      <motion.i
        className={styles.cursorTrail}
        style={{ x: trailX, y: trailY }}
      />
      <motion.i className={styles.cursorCore} style={{ x, y }} />
    </div>
  );
}

export function VeloraHeroTitle({ title }: { title: string }) {
  const reduced = useReducedMotion();
  const [firstLine, secondLine] = splitHeroTitle(title);
  return (
    <h1 className={styles.heroTitle} aria-label={title}>
      {[firstLine, secondLine].filter(Boolean).map((line, index) => (
        <span className={index === 1 ? styles.heroTitleAccent : ""} key={line}>
          <motion.i
            aria-hidden="true"
            initial={reduced ? false : { y: "115%", rotate: index ? 2 : -1 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{
              duration: 1.05,
              delay: 0.25 + index * 0.16,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.i>
        </span>
      ))}
    </h1>
  );
}

export function VeloraVenueReveal({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const reduced = useReducedMotion();
  const entrances = [
    { x: -90, y: 55, rotate: -2.5 },
    { x: 75, y: 125, rotate: 2.5 },
    { x: 120, y: 70, rotate: 1.5 },
  ];
  return (
    <motion.div
      className={styles.venueReveal}
      initial={
        reduced
          ? false
          : { opacity: 0, ...entrances[index % entrances.length] }
      }
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{
        duration: 1.05,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

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
  const reduced = useReducedMotion();
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
  const galleryItem = (item: VeloraItem, index: number) => (
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
        sizes="(max-width: 768px) 78vw, 38vw"
      />
      <span aria-hidden="true">0{index + 1}</span>
    </button>
  );
  return (
    <>
      <div className={styles.galleryViewport}>
        <div className={styles.galleryRail}>
          <div className={styles.galleryGrid}>
            {items.map(galleryItem)}
          </div>
          <div className={styles.galleryGhostSet} aria-hidden="true">
            {items.map((item, index) => (
              <div key={`ghost-${item.image}-${index}`}>
                <Image
                  src={item.image}
                  alt=""
                  width={1200}
                  height={900}
                  sizes="38vw"
                />
                <span>0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {active !== null && items[active] ? (
          <motion.div
            initial={
              reduced
                ? false
                : { opacity: 0, backdropFilter: "blur(0px)" }
            }
            animate={{ opacity: 1, backdropFilter: "blur(18px)" }}
            exit={
              reduced
                ? undefined
                : { opacity: 0, backdropFilter: "blur(0px)" }
            }
            transition={{ duration: 0.35 }}
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
            <motion.div
              className={styles.lightboxImage}
              initial={reduced ? false : { scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={reduced ? undefined : { scale: 0.96, y: 12 }}
              transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={items[active].image}
                alt={items[active].alt}
                width={1600}
                height={1100}
                sizes="90vw"
              />
            </motion.div>
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
