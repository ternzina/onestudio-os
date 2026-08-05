"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./PremiumInteractions.module.css";

const DynamicStudioTour = dynamic(() => import("./StudioTourScene"), {
  ssr: false,
  loading: () => <TourFallback status="Готовим интерактивную сцену…" />,
});

function TourFallback({ status = "Облегчённый режим для этого устройства" }: { status?: string }) {
  return (
    <div className={styles.tourFallback} data-tour-fallback>
      <Image src="/images/demos/premium-studio/bright/equipment.webp" alt="Светлая студия NOIR FRAME с циклорамой и оборудованием" fill sizes="(max-width: 760px) 100vw, 72vw" quality={84} />
      <div><span>{status}</span><p>Циклорама · съёмочная зона · гримёрная · lounge</p></div>
    </div>
  );
}

export default function StudioTour() {
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
        <p>Пространство / интерактив</p>
        <h2 id="tour-title">Интерактивный<br /><i>тур по студии.</i></h2>
        <span>Поверните макет и выберите активную точку. На мобильных показываем облегчённый обзор без тяжёлой графики.</span>
      </div>
      {near && !fallback ? <DynamicStudioTour /> : <TourFallback status={near ? undefined : "Интерактив загрузится при приближении"} />}
    </section>
  );
}
