"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type AdaptedCta8Props = {
  buttonLabel: string;
  trialLabel: string;
  word: string;
};

export function AdaptedCta8({ buttonLabel, trialLabel, word }: AdaptedCta8Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [mask, setMask] = useState({ x: -9999, y: -9999 });
  const targetRef = useRef({ x: -9999, y: -9999 });
  const currentRef = useRef({ x: -9999, y: -9999 });
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const lastMoveRef = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (event: MouseEvent) => {
      const heading = headingRef.current;
      if (!heading) return;
      const rect = heading.getBoundingClientRect();
      lastMoveRef.current = performance.now();
      cursorRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onLeave = () => { cursorRef.current = null; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 11000;
    const tick = (time: number) => {
      const heading = headingRef.current;
      if (heading) {
        const rect = heading.getBoundingClientRect();
        const idle = time - lastMoveRef.current > 700 || !cursorRef.current;
        if (idle) {
          const progress = ((time - start) % duration) / duration;
          const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);
          targetRef.current = { x: eased * rect.width, y: rect.height / 2 };
        } else if (cursorRef.current) {
          targetRef.current = cursorRef.current;
        }
        if (currentRef.current.x === -9999) currentRef.current = { ...targetRef.current };
        else {
          const lerp = 0.08;
          currentRef.current = {
            x: currentRef.current.x + (targetRef.current.x - currentRef.current.x) * lerp,
            y: currentRef.current.y + (targetRef.current.y - currentRef.current.y) * lerp,
          };
        }
        setMask({ ...currentRef.current });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const maskImage = `radial-gradient(circle 460px at ${mask.x}px ${mask.y}px, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.08) 80%, transparent 100%)`;

  return (
    <section ref={sectionRef} className="@container relative w-full min-h-[var(--rb-section-min-h,100vh)] flex flex-col items-center justify-start py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="relative flex flex-col items-center z-10">
        <motion.button initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="px-10 py-4 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-base font-medium cursor-pointer">{buttonLabel}</motion.button>
        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">{trialLabel}</motion.p>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-6 sm:inset-8 lg:inset-10 z-0">
        <span className="absolute -top-1.5 -left-1.5 w-3 h-px bg-neutral-300 dark:bg-neutral-700" /><span className="absolute -top-1.5 -left-1.5 h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
        <span className="absolute -top-1.5 -right-1.5 w-3 h-px bg-neutral-300 dark:bg-neutral-700" /><span className="absolute -top-1.5 -right-1.5 h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
        <span className="absolute -bottom-1.5 -left-1.5 w-3 h-px bg-neutral-300 dark:bg-neutral-700" /><span className="absolute -bottom-1.5 -left-1.5 h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
        <span className="absolute -bottom-1.5 -right-1.5 w-3 h-px bg-neutral-300 dark:bg-neutral-700" /><span className="absolute -bottom-1.5 -right-1.5 h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
      </div>
      <motion.h2 aria-hidden="true" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-0 right-0 text-center font-black leading-[0.85] select-none pointer-events-none dark:hidden" style={{ fontSize: "clamp(64px, 22cqw, 340px)", color: "transparent", WebkitTextStroke: "1px rgba(0,0,0,0.18)" }}>{word}</motion.h2>
      <motion.h2 aria-hidden="true" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-0 right-0 text-center font-black leading-[0.85] select-none pointer-events-none hidden dark:block" style={{ fontSize: "clamp(64px, 22cqw, 340px)", color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.16)" }}>{word}</motion.h2>
      <motion.h2 ref={headingRef} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-0 right-0 text-center font-black leading-[0.85] select-none pointer-events-none text-neutral-900 dark:text-white" style={{ fontSize: "clamp(64px, 22cqw, 340px)", WebkitMaskImage: maskImage, maskImage, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }}>{word}</motion.h2>
    </section>
  );
}
