"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { getTranslations } from "@/lib/i18n";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import styles from "./FeatureMediaFrame.module.css";

export type FeatureMediaFrameProps = {
  src?: string | null;
  alt: string;
  label: string;
  aspectRatio?: string;
  caption?: string;
  plannedPath?: string;
  priority?: boolean;
  openLabel?: string;
  closeLabel?: string;
  lang?: Locale;
};

export function FeatureMediaFrame({
  src,
  alt,
  label,
  aspectRatio = "16 / 10",
  caption,
  plannedPath,
  priority = false,
  openLabel = "Open preview",
  closeLabel = "Close screenshot",
  lang = defaultLocale,
}: FeatureMediaFrameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const frameStyle = { "--feature-media-aspect": aspectRatio } as CSSProperties;
  const accessibility = getTranslations(lang).common.accessibility;

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const openPreview = () => {
    if (src) setIsOpen(true);
  };

  const closePreview = () => setIsOpen(false);

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();

  return (
    <figure className={styles.figure}>
      {src ? (
        <button
          type="button"
          className={styles.imageButton}
          style={frameStyle}
          onClick={openPreview}
          aria-label={`${alt}. ${accessibility.openLargerPreview}`}
        >
          <Image
            className={styles.image}
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 880px) calc(100vw - 36px), 60vw"
            priority={priority}
          />
          <span className={styles.zoomHint}>{openLabel} ↗</span>
        </button>
      ) : (
        <div
          className={styles.placeholder}
          style={frameStyle}
          role="img"
          aria-label={`${label}. ${accessibility.productScreenshot}`}
          data-planned-path={plannedPath}
        >
          <span className={styles.placeholderFrame} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.placeholderLabel}>{label}</span>
          <span className={styles.placeholderMeta}>{accessibility.productScreenshot}</span>
        </div>
      )}
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}

      {isOpen && src ? (
        <div className={styles.modalBackdrop} onMouseDown={closePreview}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={stopPropagation}
          >
            <div className={styles.modalTopline}>
              <p id={titleId}>{label}</p>
              <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={closePreview}>
                {closeLabel}
              </button>
            </div>
            <div className={styles.modalImage}>
              <Image className={styles.image} src={src} alt={alt} fill sizes="96vw" />
            </div>
          </div>
        </div>
      ) : null}
    </figure>
  );
}

export default FeatureMediaFrame;
