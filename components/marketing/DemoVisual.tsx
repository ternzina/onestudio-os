import type { CSSProperties } from "react";
import Image from "next/image";
import type { DemoDefinition, DemoPalette } from "@/lib/demo-catalog";
import styles from "./DemoVisual.module.css";

type DemoVisualProps = {
  demo: DemoDefinition;
  palette?: DemoPalette;
  lang?: "ru" | "en";
  compact?: boolean;
  phone?: boolean;
  businessName?: string;
};

const DEMO_IMAGES: Record<string, string> = {
  "frame-house": "/images/demos/frame-house.webp",
  lumiere: "/images/demos/lumiere.webp",
  "north-flow": "/images/demos/north-flow.webp",
  "bloom-room": "/images/demos/bloom-room.webp",
  "little-orbit": "/images/demos/little-orbit.webp",
  "black-ink": "/images/demos/black-ink.webp",
  "vow-films": "/images/demos/vow-films.webp",
  "paw-club": "/images/demos/paw-club.webp",
};

export default function DemoVisual({
  demo,
  palette = demo.palettes[0],
  lang = "ru",
  compact = false,
  phone = false,
  businessName,
}: DemoVisualProps) {
  const visualStyle = {
    "--demo-accent": palette.accent,
    "--demo-dark": palette.dark,
    "--demo-surface": palette.surface,
  } as CSSProperties;

  return (
    <div
      className={`${styles.canvas} ${compact ? styles.compact : ""} ${phone ? styles.phone : ""}`}
      style={visualStyle}
    >
      <div className={styles.top}>
        <span className={styles.brand}>{businessName || demo.businessName}</span>
        <span className={styles.nav}>
          <span>{lang === "ru" ? "О нас" : "About"}</span>
          <span>{lang === "ru" ? "Услуги" : "Services"}</span>
          <span>{lang === "ru" ? "Контакты" : "Contact"}</span>
        </span>
      </div>
      <div className={styles.body}>
        <div>
          <span className={styles.eyebrow}>{demo.title[lang]}</span>
          <h3 className={styles.title}>{demo.promise[lang]}</h3>
          <span className={styles.button}>{demo.action[lang]}</span>
        </div>
        <div className={styles.art}>
          <Image
            className={styles.image}
            src={DEMO_IMAGES[demo.slug]}
            alt=""
            fill
            sizes={phone ? "(max-width: 620px) 84vw, 360px" : "(max-width: 620px) 38vw, 260px"}
          />
          <span className={styles.imageWash} aria-hidden="true" />
          <span className={styles.imageCaption}>
            <span>{demo.title[lang]}</span>
            <strong>{demo.name}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
