"use client";

import { useEffect, useRef } from "react";
import styles from "./Platform.module.css";

const magneticSelector = `.${styles.primaryButton}, .${styles.secondaryButton}, .${styles.sectionLink} a, .${styles.rebuildButton}`;

export default function PlatformMotionRuntime() {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = markerRef.current?.parentElement;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const precise = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;

    const reset = (element: HTMLElement) => {
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    };
    const magneticElements = [...root.querySelectorAll<HTMLElement>(magneticSelector)];
    const onPointerMove = (event: PointerEvent) => {
      if (reduced.matches || !precise.matches) return;
      const target = event.currentTarget as HTMLElement;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const x = Math.max(-3, Math.min(3, (event.clientX - rect.left - rect.width / 2) * .035));
        const y = Math.max(-2, Math.min(2, (event.clientY - rect.top - rect.height / 2) * .035));
        target.style.setProperty("--magnetic-x", `${x}px`);
        target.style.setProperty("--magnetic-y", `${y}px`);
      });
    };
    const onPointerLeave = (event: PointerEvent) => reset(event.currentTarget as HTMLElement);
    magneticElements.forEach(element => {
      element.addEventListener("pointermove", onPointerMove, { passive: true });
      element.addEventListener("pointerleave", onPointerLeave, { passive: true });
    });

    const article = root.querySelector(`.${styles.articleProse}`);
    const tocLinks = [...root.querySelectorAll<HTMLAnchorElement>(`.${styles.articleContent} aside a`)];
    const headings = article ? [...article.querySelectorAll<HTMLElement>("h2[id]")] : [];
    const observer = headings.length ? new IntersectionObserver((entries) => {
      const visible = entries.find(entry => entry.isIntersecting)?.target as HTMLElement | undefined;
      if (!visible) return;
      tocLinks.forEach(link => link.toggleAttribute("aria-current", link.hash === `#${visible.id}`));
    }, { rootMargin: "-18% 0px -68%", threshold: 0 }) : null;
    headings.forEach(heading => observer?.observe(heading));

    return () => {
      window.cancelAnimationFrame(frame);
      magneticElements.forEach(element => {
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerleave", onPointerLeave);
      });
      observer?.disconnect();
      magneticElements.forEach(reset);
    };
  }, []);

  return <div ref={markerRef} className={styles.motionRuntime} aria-hidden="true" />;
}
