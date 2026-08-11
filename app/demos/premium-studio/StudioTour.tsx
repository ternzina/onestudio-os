"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./PremiumInteractions.module.css";
import type { PremiumStudioContent } from "@/lib/public-site/premium-studio-content";
import PublicRichHeading from "@/components/public/PublicRichHeading";

const DynamicStudioTour = dynamic(() => import("./StudioTourScene"), {
  ssr: false,
  loading: () => null,
});

function TourFallback({ status, content }: { status: string; content: PremiumStudioContent["tour"] }) {
  return (
    <div className={styles.tourFallback} data-tour-fallback>
      <Image src={content.image} alt={content.imageAlt} fill sizes="(max-width: 760px) 100vw, 72vw" quality={84} />
      <div><span>{status}</span><p>{content.fallbackCaption}</p></div>
    </div>
  );
}

export default function StudioTour({ content, headingStyle }: { content: PremiumStudioContent["tour"]; headingStyle?: CSSProperties }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const updateFallback = () => setFallback(reduced.matches || coarse.matches || (typeof memory === "number" && memory <= 4));
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      updateFallback();
      setNear(true);
      observer.disconnect();
    }, { rootMargin: "420px 0px", threshold: 0.01 });
    observer.observe(section);
    reduced.addEventListener("change", updateFallback);
    coarse.addEventListener("change", updateFallback);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", updateFallback);
      coarse.removeEventListener("change", updateFallback);
    };
  }, []);

  return (
    <section className={styles.tour} id="tour" ref={sectionRef} aria-labelledby="tour-title">
      <div className={styles.tourIntro}>
        <p>{content.eyebrow}</p>
        <h2 id="tour-title" style={headingStyle}><PublicRichHeading value={content.title} accentAfterFirst /></h2>
        <span>{content.text}</span>
      </div>
      {near && !fallback ? <DynamicStudioTour zones={content.zones} /> : <TourFallback content={content} status={near ? content.loadingText : content.deferredText} />}
    </section>
  );
}
