"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ElementType,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { CircleGalleryProps } from "./source/circle-gallery";
import type { TiltedTilesProps } from "@/components/react-bits/tilted-tiles";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioMotionShowcase.module.css";

type EffectProps = CircleGalleryProps | TiltedTilesProps | Record<string, never>;

export type ComponentCategory = "hero" | "galleries" | "social-proof" | "forms" | "motion";

export type ComponentCatalogItemId = "gallery" | "motion" | "waitlist" | "hero" | "social-proof";

export type ComponentCatalogItem = {
  id: ComponentCatalogItemId;
  slug: string;
  name: string;
  categories: readonly ComponentCategory[];
  adapterClass: string;
  poster: string;
  preload: () => Promise<unknown>;
  component: ElementType;
  getProps: (reducedMotion: boolean) => EffectProps;
};

const SHOWCASE_ROOT_MARGIN = "720px 0px";

function EffectLoading() {
  return (
    <div className={styles.effectLoading} role="status" aria-live="polite">
      <span className="os-type-micro">LIVE PREVIEW</span>
    </div>
  );
}

const loadCircleGallery = () => import("./source/circle-gallery");
const loadTiltedTiles = () => import("@/components/react-bits/tilted-tiles");
const loadWaitlist1 = () => import("./motion-showcase/source/waitlist-1");
const loadHero7 = () => import("./motion-showcase/source/hero-7");
const loadSocialProof4 = () => import("./motion-showcase/source/social-proof-4");

const DynamicCircleGallery = dynamic(
  loadCircleGallery,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicTiltedTiles = dynamic(
  loadTiltedTiles,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicWaitlist1 = dynamic(
  loadWaitlist1,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicHero7 = dynamic(
  loadHero7,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicSocialProof4 = dynamic(
  loadSocialProof4,
  { ssr: false, loading: () => <EffectLoading /> },
);

const circleGalleryImages = [
  "/images/demos/premium-studio/bright/portfolio-01.webp",
  "/images/demos/premium-studio/bright/portfolio-02.webp",
  "/images/demos/premium-studio/bright/portfolio-03.webp",
  "/images/demos/premium-studio/bright/portfolio-04.webp",
  "/images/demos/premium-studio/bright/portfolio-05.webp",
  "/images/demos/premium-studio/bright/portfolio-06.webp",
  "/images/demos/premium-studio/bright/portfolio-07.webp",
  "/images/demos/premium-studio/bright/portfolio-08.webp",
  "/images/demos/premium-studio/bright/portfolio-09.webp",
  "/images/demos/premium-studio/bright/portfolio-10.webp",
];

const tiltedTilesImages = [
  "/images/demos/premium-studio/bright/scene-morning.webp",
  "/images/demos/premium-studio/bright/scene-noon.webp",
  "/images/demos/premium-studio/bright/scene-dusk.webp",
  "/images/demos/premium-studio/bright/scene-night.webp",
  "/images/demos/premium-studio/bright/equipment.webp",
  "/images/demos/premium-studio/bright/team-group.webp",
  "/images/demos/premium-studio/bright/booking.webp",
  "/images/demos/premium-studio/bright/emotional.webp",
  "/images/demos/premium-studio/bright/hero.webp",
];

export const componentCatalogItems: readonly ComponentCatalogItem[] = [
  {
    id: "gallery",
    slug: "circle-gallery",
    name: "Circle Gallery",
    categories: ["galleries"],
    adapterClass: "galleryAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-01.webp",
    preload: loadCircleGallery,
    component: DynamicCircleGallery,
    getProps: (reducedMotion) => ({
      images: circleGalleryImages,
      radiusPercent: 24,
      itemWidth: 190,
      itemHeight: 260,
      itemScale: 0.72,
      borderRadius: 5,
      enableDrag: !reducedMotion,
      animationDuration: reducedMotion ? 0 : 0.9,
      autoSpin: 0,
      showNumbers: false,
      className: styles.galleryEffect,
      itemClassName: styles.galleryCard,
    }),
  },
  {
    id: "motion",
    slug: "tilted-tiles",
    name: "Tilted Tiles",
    categories: ["galleries", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadTiltedTiles,
    component: DynamicTiltedTiles,
    getProps: (reducedMotion) => ({
      images: tiltedTilesImages,
      columns: 8,
      tilesPerColumn: 4,
      tileAspect: 1.15,
      rowGap: 10,
      columnGap: 10,
      borderRadius: 4,
      perspective: 1450,
      rotateX: 34,
      rotateY: 13,
      rotateZ: -17,
      offsetX: -18,
      offsetY: 0,
      offsetZ: 0,
      planeWidth: 208,
      planeHeight: 246,
      stagger: 16,
      duration: 32,
      alternate: true,
      fadeTop: 18,
      fadeBottom: 8,
      parallax: !reducedMotion,
      parallaxStrength: 5,
      pauseOnHover: false,
      saturation: 0.96,
      width: "100%",
      height: "100%",
      className: styles.tiltedEffect,
    }),
  },
  {
    id: "waitlist",
    slug: "waitlist-1",
    name: "Waitlist 1",
    categories: ["forms"],
    adapterClass: "waitlistAdapter",
    poster: "/images/demos/premium-studio/bright/booking.webp",
    preload: loadWaitlist1,
    component: DynamicWaitlist1,
    getProps: () => ({}),
  },
  {
    id: "hero",
    slug: "hero-7",
    name: "Hero 7",
    categories: ["hero"],
    adapterClass: "heroAdapter",
    poster: "/images/demos/premium-studio/bright/hero.webp",
    preload: loadHero7,
    component: DynamicHero7,
    getProps: () => ({}),
  },
  {
    id: "social-proof",
    slug: "social-proof-4",
    name: "Social Proof 4",
    categories: ["social-proof"],
    adapterClass: "socialProofAdapter",
    poster: "/images/demos/premium-studio/bright/team-group.webp",
    preload: loadSocialProof4,
    component: DynamicSocialProof4,
    getProps: () => ({}),
  },
];

const showcaseItems = componentCatalogItems;

function itemLabel(item: ComponentCatalogItem, lang: Locale) {
  return getTranslations(lang).components.items[item.id].label;
}

export function ComponentCatalogPreview({
  item,
  loadingLabel = "LIVE PREVIEW",
}: {
  item: ComponentCatalogItem;
  loadingLabel?: string;
}) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const hasPreloadedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const Preview = item.component as ComponentType<EffectProps>;

  useEffect(() => {
    const preview = previewRef.current;

    if (!preview) return;

    const preload = () => {
      if (hasPreloadedRef.current) return;

      hasPreloadedRef.current = true;
      void item.preload().catch(() => undefined);
    };

    if (!("IntersectionObserver" in window)) {
      preload();
      setIsVisible(true);
      return;
    }

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        preload();
        preloadObserver.disconnect();
      },
      {
        rootMargin: "320px 0px",
        threshold: 0,
      },
    );

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(Boolean(
          entry?.isIntersecting
          && entry.intersectionRatio >= 0.12
        ));
      },
      {
        rootMargin: "0px",
        threshold: [0, 0.12, 0.35],
      },
    );

    preloadObserver.observe(preview);
    visibilityObserver.observe(preview);

    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [item]);

  return (
    <div ref={previewRef} className={styles.catalogPreviewStage}>
      <img
        src={item.poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          filter: "saturate(.78) brightness(.7)",
          opacity: isVisible ? 0.18 : 0.58,
          transform: "scale(1.015)",
          transition: reducedMotion ? "none" : "opacity 220ms ease",
        }}
      />

      {isVisible ? (
        <motion.div
          className={`${styles.effectStage} ${styles[item.adapterClass as keyof typeof styles]}`}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Preview {...item.getProps(reducedMotion)} />
        </motion.div>
      ) : (
        <div className={styles.catalogPreviewPlaceholder} aria-label={loadingLabel}>
          <span className="os-type-micro">{loadingLabel}</span>
        </div>
      )}
    </div>
  );
}

export function OneStudioMotionShowcase({
  id = "design-motion",
  lang,
}: {
  id?: string;
  lang: Locale;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasActivatedRef = useRef(false);
  const [activeId, setActiveId] = useState(showcaseItems[0].id);
  const [isActivated, setIsActivated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const t = getTranslations(lang).home.motion;
  const activeItem = showcaseItems.find((item) => item.id === activeId) ?? showcaseItems[0];
  const ActiveEffect = activeItem.component as ComponentType<EffectProps>;
  const previewId = `${id}-motion-preview`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      hasActivatedRef.current = true;
      setIsActivated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasActivatedRef.current) return;

        hasActivatedRef.current = true;
        setIsActivated(true);
        observer.disconnect();
      },
      {
        rootMargin: SHOWCASE_ROOT_MARGIN,
        threshold: 0,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + showcaseItems.length) % showcaseItems.length;
    const nextItem = showcaseItems[nextIndex];
    setActiveId(nextItem.id);
    document.getElementById(`${id}-tab-${nextItem.id}`)?.focus();
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={styles.section}
      aria-labelledby={`${id}-title`}
    >
      <div className="os-public-content-guide-wide">
        <SectionReveal>
          <div className={styles.composition}>
            <div className={styles.infoColumn}>
              <div className={styles.intro}>
                <p className={`${styles.eyebrow} os-type-eyebrow`}>
                  <span />
                  {t.eyebrow}
                </p>
                <h2 id={`${id}-title`} className={`${styles.title} os-type-h2`}>
                  {t.titleBefore}
                  <span className={styles.titleAccent}>{t.titleAccent}</span>
                </h2>
                <p className={`${styles.supporting} os-type-supporting`}>{t.supporting}</p>
              </div>

              <div className={styles.controls}>
                <span className={`${styles.selectorLabel} os-type-micro`}>{t.tabsLabel}</span>
                <div className={styles.tabs} role="tablist" aria-label={t.tabsLabel}>
                  {showcaseItems.map((item, index) => {
                    const selected = item.id === activeItem.id;

                    return (
                      <button
                        key={item.id}
                        id={`${id}-tab-${item.id}`}
                        className={`${styles.tab} os-type-action${selected ? ` ${styles.tabActive}` : ""}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={previewId}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActiveId(item.id)}
                        onKeyDown={(event) => handleTabKeyDown(event, index)}
                      >
                        <span className={styles.tabNumber}>{String(index + 1).padStart(2, "0")}</span>
                        <span>{itemLabel(item, lang)}</span>
                        <span className={styles.tabArrow} aria-hidden="true">↗</span>
                      </button>
                    );
                  })}
                </div>
                <Link className={`${styles.moreLink} os-type-action`} href="/components">
                  <span>{t.moreLink}</span>
                  <b aria-hidden="true">↗</b>
                </Link>
              </div>
            </div>

            <div className={styles.previewColumn}>
              <div className={styles.showcaseFrame}>
                <div className={styles.frameBar}>
                  <span className={`${styles.frameLabel} os-type-micro`}>{t.frameLabel}</span>
                  <span className={`${styles.activeLabel} os-type-micro`} aria-live="polite">
                    <i />
                    {itemLabel(activeItem, lang)}
                  </span>
                </div>
                <div
                  id={previewId}
                  className={styles.effectViewport}
                  role="tabpanel"
                  aria-labelledby={`${id}-tab-${activeItem.id}`}
                >
                  {isActivated ? (
                    <motion.div
                      key={`${activeItem.id}-${reducedMotion ? "reduced" : "normal"}`}
                      className={`${styles.effectStage} ${styles[activeItem.adapterClass as keyof typeof styles]}`}
                      initial={isMounted && !reducedMotion ? { opacity: 0, y: 5 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={!isMounted || reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ActiveEffect {...activeItem.getProps(reducedMotion)} />
                    </motion.div>
                  ) : (
                    <div className={styles.effectPlaceholder} aria-hidden="true" />
                  )}
                </div>
              </div>
              <p className={`${styles.note} os-type-action`}>{t.note}</p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
