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
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioMotionShowcase.module.css";

type EffectProps = Record<string, unknown>;

export type ComponentCategory =
  | "hero"
  | "galleries"
  | "social-proof"
  | "forms"
  | "typography"
  | "backgrounds"
  | "motion"
  | "interactive";

export type ComponentCatalogItemId =
  | "gallery"
  | "motion"
  | "waitlist"
  | "hero"
  | "social-proof"
  | "floating-lines"
  | "magic-rings"
  | "strands"
  | "glow-cursor"
  | "particle-text"
  | "card-spread"
  | "bending-marquee"
  | "blur-highlight"
  | "circle-stack"
  | "click-stack"
  | "text-cube";

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
  return null;
}

const loadCircleGallery = () => import("./source/circle-gallery");
const loadTiltedTiles = () => import("@/components/react-bits/tilted-tiles");
const loadWaitlist1 = () => import("./motion-showcase/source/waitlist-1");
const loadHero7 = () => import("./motion-showcase/source/hero-7");
const loadSocialProof4 = () => import("./motion-showcase/source/social-proof-4");
const loadFloatingLines = () => import("@/components/react-bits/FloatingLines");
const loadMagicRings = () => import("@/components/react-bits/MagicRings");
const loadStrands = () => import("@/components/react-bits/Strands");
const loadGlowCursor = () => import("@/components/react-bits/GlowCursor");
const loadParticleText = () => import("@/components/react-bits/ParticleText");
const loadCardSpread = () => import("@/components/react-bits/card-spread");
const loadBendingMarquee = () => import("@/components/react-bits/bending-marquee");
const loadBlurHighlight = () => import("@/components/react-bits/blur-highlight");
const loadCircleStack = () => import("@/components/react-bits/circle-stack");
const loadClickStack = () => import("@/components/react-bits/click-stack");
const loadTextCube = () => import("@/components/react-bits/text-cube");

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

const DynamicFloatingLines = dynamic(
  loadFloatingLines,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicMagicRings = dynamic(
  loadMagicRings,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicStrands = dynamic(
  loadStrands,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicGlowCursor = dynamic(
  loadGlowCursor,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicParticleText = dynamic(
  loadParticleText,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicCardSpread = dynamic(
  loadCardSpread,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicBendingMarquee = dynamic(
  loadBendingMarquee,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicBlurHighlight = dynamic(
  loadBlurHighlight,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicCircleStack = dynamic(
  loadCircleStack,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicClickStack = dynamic(
  loadClickStack,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicTextCube = dynamic(
  loadTextCube,
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

const cardSpreadCards = circleGalleryImages.slice(0, 7).map((src, index) => ({
  id: `spread-${index + 1}`,
  src,
  alt: "",
}));

const circleStackItems = circleGalleryImages.slice(1, 5).map((image, index) => ({
  id: `circle-stack-${index + 1}`,
  image,
  alt: "",
}));

const clickStackItems = circleGalleryImages.slice(4, 10).map((src, index) => (
  <img
    key={`click-stack-${index + 1}`}
    src={src}
    alt=""
    draggable={false}
    className="h-full w-full select-none object-cover"
  />
));

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
  {
    id: "floating-lines",
    slug: "floating-lines",
    name: "Floating Lines",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-night.webp",
    preload: loadFloatingLines,
    component: DynamicFloatingLines,
    getProps: (reducedMotion) => ({
      linesGradient: ["#ff814a", "#ffd3bd", "#8f5bff"],
      enabledWaves: ["top", "middle", "bottom"],
      lineCount: [5, 4, 3],
      lineDistance: [5, 7, 8],
      animationSpeed: reducedMotion ? 0 : 0.7,
      interactive: !reducedMotion,
      bendStrength: -0.35,
      parallax: !reducedMotion,
      parallaxStrength: 0.16,
      backgroundColor: "#17100c",
    }),
  },
  {
    id: "magic-rings",
    slug: "magic-rings",
    name: "Magic Rings",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/emotional.webp",
    preload: loadMagicRings,
    component: DynamicMagicRings,
    getProps: (reducedMotion) => ({
      color: "#ff814a",
      colorTwo: "#ffd3bd",
      speed: reducedMotion ? 0 : 0.8,
      ringCount: 7,
      attenuation: 10,
      lineThickness: 2.2,
      opacity: 0.95,
      noiseAmount: 0.045,
      followMouse: !reducedMotion,
      mouseInfluence: 0.12,
      hoverScale: 1.08,
      parallax: 0.04,
      clickBurst: !reducedMotion,
      alphaMode: "coverage",
    }),
  },
  {
    id: "strands",
    slug: "strands",
    name: "Strands",
    categories: ["backgrounds", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadStrands,
    component: DynamicStrands,
    getProps: (reducedMotion) => ({
      colors: ["#ff814a", "#ffd3bd", "#8f5bff", "#45c7ff"],
      count: 5,
      speed: reducedMotion ? 0 : 0.35,
      amplitude: 1,
      waviness: 1.2,
      thickness: 0.75,
      glow: 2.2,
      taper: 3,
      spread: 1.05,
      intensity: 0.7,
      saturation: 1.3,
      opacity: 1,
      scale: 1.3,
      glass: true,
      refraction: 0.8,
      dispersion: 0.8,
      glassSize: 0.72,
    }),
  },
  {
    id: "glow-cursor",
    slug: "glow-cursor",
    name: "Glow Cursor",
    categories: ["motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/hero.webp",
    preload: loadGlowCursor,
    component: DynamicGlowCursor,
    getProps: (reducedMotion) => ({
      color: "#ff9a6d",
      secondaryColor: "#9f70ff",
      trailLength: 36,
      trailWidth: 9,
      trailTaper: 0.82,
      followSpeed: reducedMotion ? 0.95 : 0.18,
      glowIntensity: 2.1,
      glowSpread: 1.25,
      brightness: 1.3,
      opacity: 1,
      pulseSpeed: reducedMotion ? 0 : 0.8,
      noiseStrength: 0.02,
      idleFade: true,
      children: (
        <div
          style={{
            display: "grid",
            height: "100%",
            placeItems: "center",
            color: "rgba(255, 244, 236, .72)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".18em",
            pointerEvents: "none",
          }}
        >
          MOVE CURSOR
        </div>
      ),
    }),
  },
  {
    id: "particle-text",
    slug: "particle-text",
    name: "Particle Text",
    categories: ["typography", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-morning.webp",
    preload: loadParticleText,
    component: DynamicParticleText,
    getProps: (reducedMotion) => ({
      text: "OneStudio",
      particleSize: 1.7,
      density: 4,
      color: "#fff5ee",
      highlightColor: "#ff814a",
      scatter: reducedMotion ? 0 : 120,
      gatherDuration: reducedMotion ? 0 : 1200,
      stagger: reducedMotion ? 0 : 260,
      pointerRepel: reducedMotion ? 0 : 34,
      repelRadius: 110,
      idleDrift: reducedMotion ? 0 : 0.35,
      trigger: "mount",
      fontSize: "clamp(42px, 7vw, 80px)",
      fontWeight: 720,
      glow: true,
    }),
  },
  {
    id: "card-spread",
    slug: "card-spread",
    name: "Card Spread",
    categories: ["galleries", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-04.webp",
    preload: loadCardSpread,
    component: DynamicCardSpread,
    getProps: (reducedMotion) => ({
      cards: cardSpreadCards,
      cardWidth: 160,
      cardHeight: 215,
      cardRadius: 8,
      radius: 380,
      arc: 66,
      shadow: 0.34,
      lift: 20,
      push: 3,
      pushReach: 2,
      stagger: reducedMotion ? 0 : 0.04,
      fit: true,
      maxScale: 0.88,
      interactive: !reducedMotion,
    }),
  },
  {
    id: "bending-marquee",
    slug: "bending-marquee",
    name: "Bending Marquee",
    categories: ["typography", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/equipment.webp",
    preload: loadBendingMarquee,
    component: DynamicBendingMarquee,
    getProps: (reducedMotion) => ({
      items: ["CREATE", "BOOK", "GROW"],
      separator: "✦",
      panelWidth: 300,
      panelHeight: 300,
      bend: 48,
      depth: -170,
      perspective: 760,
      speed: reducedMotion ? 100000 : 14,
      rows: 3,
      rowGap: 14,
      itemGap: 22,
      bandPadding: 13,
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 1.4,
      color: "#fff5ee",
      bandColor: "#24140d",
      markSway: reducedMotion ? 0 : 10,
      pauseOnHover: !reducedMotion,
      fit: true,
      maxScale: 0.94,
    }),
  },
  {
    id: "blur-highlight",
    slug: "blur-highlight",
    name: "Blur Highlight",
    categories: ["typography", "motion"],
    adapterClass: "textAdapter",
    poster: "/images/demos/premium-studio/bright/emotional.webp",
    preload: loadBlurHighlight,
    component: DynamicBlurHighlight,
    getProps: (reducedMotion) => ({
      children: "Turn attention into action.",
      highlightedBits: ["attention", "action"],
      highlightColor: "#ff814a",
      blurAmount: reducedMotion ? 0 : 9,
      inactiveOpacity: 0.24,
      blurDelay: 0,
      blurDuration: reducedMotion ? 0 : 0.7,
      highlightDelay: reducedMotion ? 0 : 0.25,
      highlightDuration: reducedMotion ? 0 : 0.8,
      highlightDirection: "left",
      viewportOptions: { once: false, amount: 0.3 },
    }),
  },
  {
    id: "circle-stack",
    slug: "circle-stack",
    name: "Circle Stack",
    categories: ["galleries", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-03.webp",
    preload: loadCircleStack,
    component: DynamicCircleStack,
    getProps: (reducedMotion) => ({
      items: circleStackItems,
      size: 210,
      tilt: 62,
      stackGap: 24,
      interval: 2.4,
      transitionDuration: reducedMotion ? 0 : 0.72,
      paused: reducedMotion,
      surfaceColor: "#fff5ee",
      borderColor: "rgba(255, 129, 74, .62)",
      borderWidth: 1,
    }),
  },
  {
    id: "click-stack",
    slug: "click-stack",
    name: "Click Stack",
    categories: ["galleries", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-06.webp",
    preload: loadClickStack,
    component: DynamicClickStack,
    getProps: (reducedMotion) => ({
      items: clickStackItems,
      cardWidth: 178,
      cardHeight: 232,
      spreadX: 16,
      spreadY: -14,
      duration: reducedMotion ? 0.01 : 0.32,
      borderRadius: 12,
      shadowBlur: 28,
      shadowOpacity: 0.28,
      visibleCount: 5,
      depthScale: 0.055,
      depthOpacity: 0.08,
    }),
  },
  {
    id: "text-cube",
    slug: "text-cube",
    name: "Text Cube",
    categories: ["typography", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadTextCube,
    component: DynamicTextCube,
    getProps: (reducedMotion) => ({
      word: "OS",
      cubeSize: 150,
      rotationSpeed: reducedMotion ? 0 : 0.72,
      followSpeed: reducedMotion ? 0.18 : 0.08,
      density: 16,
      fontSize: 17,
      fontWeight: 650,
      color: "#ffb38f",
      backgroundColor: "#160f0c",
      breathe: reducedMotion ? 0 : 0.055,
      breatheSpeed: 1.6,
      depthFade: 0.48,
      perspective: 540,
      autoRotateX: reducedMotion ? 0 : 0.24,
      autoRotateY: reducedMotion ? 0 : 0.32,
      opacity: 0.95,
    }),
  },
];

const HOME_SHOWCASE_IDS = [
  "gallery",
  "motion",
  "waitlist",
  "hero",
  "social-proof",
] as const satisfies readonly ComponentCatalogItemId[];

const showcaseItems = HOME_SHOWCASE_IDS
  .map((id) => componentCatalogItems.find((item) => item.id === id))
  .filter((item): item is ComponentCatalogItem => item !== undefined);

function itemLabel(item: ComponentCatalogItem, lang: Locale) {
  return getTranslations(lang).components.items[item.id].label;
}

export function ComponentCatalogPreview({
  item,
}: {
  item: ComponentCatalogItem;
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
        setIsVisible(Boolean(entry?.isIntersecting));
      },
      {
        rootMargin: "140px 0px",
        threshold: 0,
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
      {isVisible ? (
        <motion.div
          className={`${styles.effectStage} ${styles[item.adapterClass as keyof typeof styles]}`}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Preview {...item.getProps(reducedMotion)} />
        </motion.div>
      ) : null}
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
