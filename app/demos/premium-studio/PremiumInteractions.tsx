"use client";

import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./PremiumInteractions.module.css";
import type { PremiumStudioContent } from "@/lib/public-site/premium-studio-content";
import PublicRichHeading from "@/components/public/PublicRichHeading";

type OpenProject = (index: number) => void;

const filmFrames = [0, 1, 5, 3, 7, 9, 4];

export function usePointerGlow() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || !finePointer.matches || reduce.matches) return;

    let frame = 0;
    let target: HTMLElement | null = null;
    let magnetic: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    let clientX = 0;
    let clientY = 0;
    const move = (event: PointerEvent) => {
      const nextMagnetic = (event.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (magnetic && magnetic !== nextMagnetic) magnetic.style.transform = "";
      magnetic = nextMagnetic && root.contains(nextMagnetic) ? nextMagnetic : null;
      target = (event.target as HTMLElement).closest<HTMLElement>("[data-glow]");
      if (!target || !root.contains(target)) return;
      const rect = target.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      clientX = event.clientX;
      clientY = event.clientY;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        target?.style.setProperty("--glow-x", `${x}px`);
        target?.style.setProperty("--glow-y", `${y}px`);
        if (magnetic) {
          const magneticRect = magnetic.getBoundingClientRect();
          const mx = (clientX - magneticRect.left - magneticRect.width / 2) * .045;
          const my = (clientY - magneticRect.top - magneticRect.height / 2) * .07;
          magnetic.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        }
      });
    };
    const leave = () => {
      if (magnetic) magnetic.style.transform = "";
      magnetic = null;
    };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      leave();
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

export function BeforeAfter({ content, headingStyle }: { content: PremiumStudioContent["retouch"]; headingStyle?: CSSProperties }) {
  const [value, setValue] = useState(50);
  return (
    <section className={styles.beforeAfter} id="retouch" aria-labelledby="retouch-title">
      <div className={styles.interactionIntro}>
        <p>{content.eyebrow}</p>
        <h2 id="retouch-title" style={headingStyle}><PublicRichHeading value={content.title} accentAfterFirst /></h2>
        <span>{content.text}</span>
      </div>
      <div className={styles.compare} style={{ "--position": `${value}%` } as CSSProperties}>
        <div className={styles.compareImage}>
          <Image src={content.image} alt={`${content.imageAlt}. ${content.beforeLabel}`} fill sizes="(max-width: 760px) 100vw, 74vw" quality={88} />
        </div>
        <div className={`${styles.compareImage} ${styles.afterImage}`}>
          <Image src={content.image} alt={`${content.imageAlt}. ${content.afterLabel}`} fill sizes="(max-width: 760px) 100vw, 74vw" quality={88} />
        </div>
        <span className={styles.beforeLabel}>{content.beforeLabel}</span>
        <span className={styles.afterLabel}>{content.afterLabel}</span>
        <div className={styles.compareLine} aria-hidden="true"><i>↔</i></div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          aria-label="Сравнение фотографии до и после обработки"
          aria-valuetext={`${value}% финальной обработки`}
          onChange={(event) => setValue(Number(event.currentTarget.value))}
        />
      </div>
      <button className={styles.resetCompare} type="button" onClick={() => setValue(50)}>
        {content.resetLabel} <span aria-hidden="true">↺</span>
      </button>
    </section>
  );
}

export function FilmStrip({ onOpen, portfolio, content, headingStyle }: { onOpen: OpenProject; portfolio: PremiumStudioContent["portfolio"]; content: PremiumStudioContent["film"]; headingStyle?: CSSProperties }) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const paused = useRef(false);
  const lastX = useRef(0);
  const startX = useRef(0);
  const velocity = useRef(0);
  const animation = useRef(0);
  const inertia = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let inView = false;
    const wheel = (event: globalThis.WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const max = rail.scrollWidth - rail.clientWidth;
      const next = rail.scrollLeft + delta;
      if (next >= 0 && next <= max) {
        event.preventDefault();
        rail.scrollLeft = next;
      }
    };
    const tick = () => {
      if (!paused.current && !dragging.current && rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1) {
        rail.scrollLeft += 0.28;
      }
      animation.current = requestAnimationFrame(tick);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(animation.current);
      animation.current = 0;
      if (inView && !reduce.matches && !coarse.matches) animation.current = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    }, { threshold: 0.12 });
    observer.observe(rail);
    rail.addEventListener("wheel", wheel, { passive: false });
    reduce.addEventListener("change", syncAnimation);
    coarse.addEventListener("change", syncAnimation);
    return () => {
      observer.disconnect();
      rail.removeEventListener("wheel", wheel);
      reduce.removeEventListener("change", syncAnimation);
      coarse.removeEventListener("change", syncAnimation);
      cancelAnimationFrame(animation.current);
      cancelAnimationFrame(inertia.current);
    };
  }, []);

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    moved.current = false;
    velocity.current = 0;
    lastX.current = event.clientX;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const delta = event.clientX - lastX.current;
    if (Math.abs(event.clientX - startX.current) > 5) moved.current = true;
    lastX.current = event.clientX;
    velocity.current = delta;
    event.currentTarget.scrollLeft -= delta;
  };
  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const rail = event.currentTarget;
    let speed = velocity.current;
    const coast = () => {
      speed *= 0.92;
      rail.scrollLeft -= speed;
      if (Math.abs(speed) > 0.35) inertia.current = requestAnimationFrame(coast);
    };
    inertia.current = requestAnimationFrame(coast);
  };
  const moveRail = (direction: number) => railRef.current?.scrollBy({ left: direction * Math.min(520, window.innerWidth * 0.72), behavior: "smooth" });
  const openFrame = (index: number) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    onOpen(index);
  };

  return (
    <section className={styles.film} id="film" aria-labelledby="film-title">
      <div className={styles.filmHeader}>
        <div><p>{content.eyebrow}</p><h2 id="film-title" style={headingStyle}><PublicRichHeading value={content.title} accentAfterFirst /></h2></div>
        <div className={styles.filmControls} aria-label="Управление галереей">
          <button type="button" onClick={() => moveRail(-1)} aria-label="Предыдущие фотографии">←</button>
          <button type="button" onClick={() => moveRail(1)} aria-label="Следующие фотографии">→</button>
        </div>
      </div>
      <div
        className={styles.filmRail}
        ref={railRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
        aria-label="Горизонтальная галерея портретов"
      >
        <div className={styles.filmTrack}>
          {filmFrames.flatMap((portfolioIndex, index) => {
            const frame = portfolio[portfolioIndex];
            if (!frame) return [];
            return (
              <button key={frame.title} type="button" className={styles.filmFrame} onClick={() => openFrame(portfolioIndex)} aria-label={`Открыть «${frame.title}»`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><Image src={frame.image} alt={frame.alt} fill sizes="(max-width: 680px) 68vw, 27vw" quality={84} /></div>
                <small>{frame.title}</small>
              </button>
            );
          })}
        </div>
      </div>
      <p className={styles.filmHint}>{content.hint}</p>
    </section>
  );
}

export function ProjectViewer({ active, onClose, onChange, portfolio }: { active: number | null; onClose: () => void; onChange: (index: number) => void; portfolio: PremiumStudioContent["portfolio"] }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef(active);
  const isOpen = active !== null;
  const project = active === null ? null : portfolio[active];
  const portfolioLength = portfolio.length;

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    if (!isOpen) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && !viewerRef.current?.contains(focused)) openerRef.current = focused;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      const current = activeRef.current;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (current !== null && event.key === "ArrowLeft") onChange((current - 1 + portfolioLength) % portfolioLength);
      if (current !== null && event.key === "ArrowRight") onChange((current + 1) % portfolioLength);
      if (event.key === "Tab") {
        const focusable = viewerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keydown);
      openerRef.current?.focus({ preventScroll: true });
      openerRef.current = null;
    };
  }, [isOpen, onChange, onClose, portfolioLength]);

  return (
    <AnimatePresence>
      {project ? (
        <m.div ref={viewerRef} className={styles.viewer} role="dialog" aria-modal="true" aria-label={`Проект «${project.title}»`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <m.div className={styles.viewerCurtain} initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(100% 0 0 0)" }} transition={{ duration: .65, ease: [0.16, 1, 0.3, 1] }} />
          <button ref={closeRef} type="button" className={styles.viewerClose} onClick={onClose}>Закрыть <span aria-hidden="true">×</span></button>
          <div className={styles.viewerStage}>
            <AnimatePresence mode="wait">
              <m.div key={project.title} className={styles.viewerImage} initial={{ clipPath: "inset(0 100% 0 0)", scale: 1.03 }} animate={{ clipPath: "inset(0 0% 0 0)", scale: 1 }} exit={{ clipPath: "inset(0 0 0 100%)", scale: .98 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}>
                <Image src={project.image} alt={project.alt} fill sizes="(max-width: 760px) 100vw, 70vw" quality={90} priority />
              </m.div>
            </AnimatePresence>
            <div className={styles.viewerMeta}><span>{project.category} · {project.year}</span><h2>{project.title}</h2><p>{String(active! + 1).padStart(2, "0")} / {portfolioLength}</p></div>
          </div>
          <div className={styles.viewerControls}>
            <button type="button" onClick={() => onChange((active! - 1 + portfolioLength) % portfolioLength)}>← Предыдущий</button>
            <button type="button" onClick={() => onChange((active! + 1) % portfolioLength)}>Следующий →</button>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
