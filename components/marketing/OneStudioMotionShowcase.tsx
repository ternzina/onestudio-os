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
  | "text-cube"
  | "vortex"
  | "flicker"
  | "page-flip"
  | "glitch-text"
  | "cursor-wave-neon"
  | "cursor-wave-circles"
  | "cursor-wave-squares"
  | "cursor-wave-triangles"
  | "cursor-wave-peach"
  | "cursor-wave-minimal"
  | "skewed-portrait"
  | "skewed-wide"
  | "skewed-loop"
  | "skewed-minimal"
  | "skewed-cinema"
  | "tumble-square"
  | "tumble-portrait"
  | "tumble-loop"
  | "tumble-soft"
  | "tumble-bold"
  | "rotating-orbit"
  | "rotating-gallery"
  | "rotating-compact"
  | "rotating-slow"
  | "credit-aurora"
  | "credit-midnight"
  | "credit-peach"
  | "credit-forest"
  | "vortex-gold"
  | "vortex-blue"
  | "flicker-mono"
  | "flicker-rainbow"
  | "page-flip-dark"
  | "glitch-text-soft";

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
const loadVortex = () => import("@/components/react-bits/vortex");
const loadFlicker = () => import("@/components/react-bits/flicker");
const loadPageFlip = () => import("@/components/react-bits/page-flip");
const loadGlitchText = () => import("@/components/react-bits/glitch-text");
const loadCursorWave = () => import("@/components/react-bits/cursor-wave");
const loadSkewedCarousel = () => import("@/components/react-bits/skewed-carousel");
const loadTumbleCarousel = () => import("@/components/react-bits/tumble-carousel");
const loadRotatingCards = () => import("@/components/react-bits/rotating-cards");
const loadCreditCard = () => import("@/components/react-bits/credit-card");

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

const DynamicVortex = dynamic(
  loadVortex,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicFlicker = dynamic(
  loadFlicker,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicPageFlip = dynamic(
  loadPageFlip,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicGlitchText = dynamic(
  loadGlitchText,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicCursorWave = dynamic(
  loadCursorWave,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicSkewedCarousel = dynamic(
  loadSkewedCarousel,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicTumbleCarousel = dynamic(
  loadTumbleCarousel,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicRotatingCards = dynamic(
  loadRotatingCards,
  { ssr: false, loading: () => <EffectLoading /> },
);

const DynamicCreditCard = dynamic(
  loadCreditCard,
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

const pageFlipPages = Array.from({ length: 4 }, (_, index) => ({
  id: `page-flip-${index + 1}`,
  front: circleGalleryImages[index * 2],
  back: circleGalleryImages[index * 2 + 1],
  frontAlt: "",
  backAlt: "",
}));

const libraryCarouselItems = circleGalleryImages.slice(0, 8).map((src, index) => ({
  src,
  title: `Studio frame ${String(index + 1).padStart(2, "0")}`,
  alt: "",
}));

const rotatingLibraryCards = circleGalleryImages.slice(0, 6).map((image, index) => ({
  id: `orbit-${index + 1}`,
  image,
  content: (
    <img
      src={image}
      alt=""
      draggable={false}
      className="h-full w-full rounded-lg object-cover"
    />
  ),
}));

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

  {
    id: "vortex",
    slug: "vortex",
    name: "Vortex",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-night.webp",
    preload: loadVortex,
    component: DynamicVortex,
    getProps: (reducedMotion) => ({
      discCount: 30,
      particleCount: 1400,
      particleColor: "#ffb38f",
      discColor: "rgba(255, 244, 236, .18)",
      discLineWidth: 1,
      particleSize: 0.8,
      depth: 1.35,
      spread: 1.05,
      speed: reducedMotion ? 0 : 0.18,
      rotationDirection: 1,
      centerX: 0.5,
      centerY: 0.06,
      fadeInThreshold: 0.025,
      fadeOutThreshold: 0.46,
      opacity: 0.92,
      enableCursorInteraction: !reducedMotion,
      cursorInfluence: 0.11,
    }),
  },
  {
    id: "flicker",
    slug: "flicker",
    name: "Flicker",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadFlicker,
    component: DynamicFlicker,
    getProps: (reducedMotion) => ({
      spacing: 20,
      particleSize: 1.35,
      colorPalette: ["#ff814a", "#ffd3bd", "#8f5bff", "#45c7ff"],
      glowColor: "#ffb38f",
      alpha: 0.94,
      overlay: 0.34,
      overlayColor: "#17100c",
      minFrequency: 0.18,
      maxFrequency: 0.72,
      rate: reducedMotion ? 0 : 0.82,
      shape: "circle",
      jitter: true,
      flickerChance: 0.68,
      mouseEffect: !reducedMotion,
    }),
  },
  {
    id: "page-flip",
    slug: "page-flip",
    name: "Page Flip",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-04.webp",
    preload: loadPageFlip,
    component: DynamicPageFlip,
    getProps: (reducedMotion) => ({
      pages: pageFlipPages,
      pageWidth: 150,
      pageHeight: 218,
      pageRadius: 8,
      pageColor: "#f6ede6",
      perspective: 1200,
      spineShift: 76,
      turnAngle: 180,
      peekAngle: reducedMotion ? 0 : 12,
      duration: reducedMotion ? 0.01 : 0.55,
      stagger: reducedMotion ? 0 : 0.05,
      ease: "easeInOut",
      shadow: 0.34,
      trigger: "click",
      closeOnLeave: false,
      interactive: true,
    }),
  },
  {
    id: "glitch-text",
    slug: "glitch-text",
    name: "Glitch Text",
    categories: ["typography", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/emotional.webp",
    preload: loadGlitchText,
    component: DynamicGlitchText,
    getProps: (reducedMotion) => ({
      text: "CREATE | DIFFERENT",
      colors: ["#ff814a", "#8f5bff", "#45c7ff"],
      textColor: "#fff6ef",
      fontSize: 70,
      fontWeight: "750",
      radius: reducedMotion ? 0 : 135,
      letterSpacing: -2,
      lineHeight: 1.05,
      textAlign: "center",
      fadeIn: !reducedMotion,
      autoFit: true,
    }),
  },


  {
    id: "cursor-wave-neon",
    slug: "cursor-wave/neon",
    name: "Cursor Wave Neon",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-night.webp",
    preload: loadCursorWave,
    component: DynamicCursorWave,
    getProps: (reducedMotion) => ({
      width: "100%",
      height: "100%",
      cellSize: 34,
      influenceRadiusVmin: 34,
      attackTime: 0.32,
      releaseTime: 0.52,
      idleScale: 0.08,
      minPeakScale: 0.9,
      maxPeakScale: reducedMotion ? 1 : 2.6,
      burstSpeed: reducedMotion ? 1 : 1050,
      burstThickness: 150,
      backgroundColor: "#100d17",
      shapes: ["circle", "triangle", "square"],
      colors: ["#ff814a", "#8f5bff", "#45c7ff", "#ffd3bd"],
      dpr: 1.5,
      opacity: 0.95,
    }),
  },
  {
    id: "cursor-wave-circles",
    slug: "cursor-wave/circles",
    name: "Cursor Wave Circles",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/emotional.webp",
    preload: loadCursorWave,
    component: DynamicCursorWave,
    getProps: (reducedMotion) => ({
      width: "100%",
      height: "100%",
      cellSize: 38,
      influenceRadiusVmin: 31,
      attackTime: 0.38,
      releaseTime: 0.7,
      idleScale: 0.07,
      minPeakScale: 1,
      maxPeakScale: reducedMotion ? 1 : 2.2,
      burstSpeed: reducedMotion ? 1 : 920,
      burstThickness: 120,
      backgroundColor: "#17100c",
      shapes: ["circle"],
      colors: ["#ff9a6d", "#ffd3bd", "#fff6ef"],
      dpr: 1.5,
      opacity: 0.9,
    }),
  },
  {
    id: "cursor-wave-squares",
    slug: "cursor-wave/squares",
    name: "Cursor Wave Squares",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadCursorWave,
    component: DynamicCursorWave,
    getProps: (reducedMotion) => ({
      width: "100%",
      height: "100%",
      cellSize: 32,
      influenceRadiusVmin: 29,
      attackTime: 0.26,
      releaseTime: 0.48,
      idleScale: 0.1,
      minPeakScale: 0.9,
      maxPeakScale: reducedMotion ? 1 : 2,
      burstSpeed: reducedMotion ? 1 : 1200,
      burstThickness: 130,
      backgroundColor: "#0d1117",
      shapes: ["square"],
      colors: ["#45c7ff", "#8f5bff", "#e6d8ff"],
      dpr: 1.5,
      opacity: 0.94,
    }),
  },
  {
    id: "cursor-wave-triangles",
    slug: "cursor-wave/triangles",
    name: "Cursor Wave Triangles",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/equipment.webp",
    preload: loadCursorWave,
    component: DynamicCursorWave,
    getProps: (reducedMotion) => ({
      width: "100%",
      height: "100%",
      cellSize: 42,
      influenceRadiusVmin: 36,
      attackTime: 0.42,
      releaseTime: 0.62,
      idleScale: 0.07,
      minPeakScale: 0.9,
      maxPeakScale: reducedMotion ? 1 : 2.4,
      burstSpeed: reducedMotion ? 1 : 860,
      burstThickness: 180,
      backgroundColor: "#201008",
      shapes: ["triangle"],
      colors: ["#ff6f36", "#ffb38f", "#fff0e8"],
      dpr: 1.5,
      opacity: 0.92,
    }),
  },
  {
    id: "cursor-wave-peach",
    slug: "cursor-wave/peach",
    name: "Cursor Wave Peach",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-morning.webp",
    preload: loadCursorWave,
    component: DynamicCursorWave,
    getProps: (reducedMotion) => ({
      width: "100%",
      height: "100%",
      cellSize: 36,
      influenceRadiusVmin: 32,
      attackTime: 0.4,
      releaseTime: 0.65,
      idleScale: 0.06,
      minPeakScale: 0.8,
      maxPeakScale: reducedMotion ? 1 : 1.9,
      burstSpeed: reducedMotion ? 1 : 780,
      burstThickness: 150,
      backgroundColor: "#2a160d",
      shapes: ["circle", "square"],
      colors: ["#ff814a", "#ffb38f", "#ffd9c7", "#fff6ef"],
      dpr: 1.5,
      opacity: 0.93,
    }),
  },
  {
    id: "cursor-wave-minimal",
    slug: "cursor-wave/minimal",
    name: "Cursor Wave Minimal",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-noon.webp",
    preload: loadCursorWave,
    component: DynamicCursorWave,
    getProps: (reducedMotion) => ({
      width: "100%",
      height: "100%",
      cellSize: 52,
      influenceRadiusVmin: 27,
      attackTime: 0.5,
      releaseTime: 0.9,
      idleScale: 0.04,
      minPeakScale: 0.65,
      maxPeakScale: reducedMotion ? 0.7 : 1.45,
      burstSpeed: reducedMotion ? 1 : 650,
      burstThickness: 100,
      backgroundColor: "#f1e9df",
      shapes: ["circle"],
      colors: ["#5f4c41", "#ff814a"],
      dpr: 1.25,
      opacity: 0.78,
    }),
  },
  {
    id: "skewed-portrait",
    slug: "skewed-carousel/portrait",
    name: "Skewed Portrait",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-01.webp",
    preload: loadSkewedCarousel,
    component: DynamicSkewedCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 3,
      cardWidth: 158,
      aspectRatio: "3 / 4",
      rotation: reducedMotion ? 0 : 56,
      inactiveScale: 0.82,
      perspective: 900,
      borderRadius: 10,
      titleBlur: reducedMotion ? 0 : 2,
      speed: reducedMotion ? 0.08 : 1,
      showTitles: true,
      showControls: true,
      showDots: true,
      loop: false,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "skewed-wide",
    slug: "skewed-carousel/wide",
    name: "Skewed Wide",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-02.webp",
    preload: loadSkewedCarousel,
    component: DynamicSkewedCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 2,
      cardWidth: 224,
      aspectRatio: "16 / 10",
      rotation: reducedMotion ? 0 : 34,
      inactiveScale: 0.86,
      perspective: 1100,
      borderRadius: 12,
      titleBlur: reducedMotion ? 0 : 1.5,
      speed: reducedMotion ? 0.08 : 0.9,
      showTitles: true,
      showControls: true,
      showDots: false,
      loop: false,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "skewed-loop",
    slug: "skewed-carousel/loop",
    name: "Skewed Loop",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-03.webp",
    preload: loadSkewedCarousel,
    component: DynamicSkewedCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 4,
      cardWidth: 164,
      aspectRatio: "4 / 5",
      rotation: reducedMotion ? 0 : 48,
      inactiveScale: 0.8,
      perspective: 950,
      borderRadius: 8,
      titleBlur: reducedMotion ? 0 : 2,
      speed: reducedMotion ? 0.08 : 1,
      showTitles: true,
      showControls: true,
      showDots: true,
      loop: true,
      autoplay: !reducedMotion,
      autoplayDelay: 2600,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "skewed-minimal",
    slug: "skewed-carousel/minimal",
    name: "Skewed Minimal",
    categories: ["galleries", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-04.webp",
    preload: loadSkewedCarousel,
    component: DynamicSkewedCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 3,
      cardWidth: 182,
      aspectRatio: "1 / 1",
      rotation: reducedMotion ? 0 : 42,
      inactiveScale: 0.88,
      perspective: 880,
      borderRadius: 2,
      titleBlur: 0,
      speed: reducedMotion ? 0.08 : 0.8,
      showTitles: false,
      showControls: false,
      showDots: true,
      loop: true,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "skewed-cinema",
    slug: "skewed-carousel/cinema",
    name: "Skewed Cinema",
    categories: ["galleries", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-05.webp",
    preload: loadSkewedCarousel,
    component: DynamicSkewedCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 1,
      cardWidth: 238,
      aspectRatio: "16 / 9",
      rotation: reducedMotion ? 0 : 28,
      inactiveScale: 0.9,
      perspective: 1200,
      borderRadius: 4,
      titleBlur: reducedMotion ? 0 : 1,
      speed: reducedMotion ? 0.08 : 0.78,
      showTitles: true,
      showControls: false,
      showDots: false,
      loop: true,
      autoplay: !reducedMotion,
      autoplayDelay: 3000,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "tumble-square",
    slug: "tumble-carousel/square",
    name: "Tumble Square",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-06.webp",
    preload: loadTumbleCarousel,
    component: DynamicTumbleCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 3,
      cardWidth: 148,
      aspectRatio: "1 / 1",
      frameHeight: 225,
      visibleRange: 2.3,
      rotation: reducedMotion ? 0 : 30,
      verticalOffset: reducedMotion ? 0 : 46,
      inactiveScale: 0.62,
      borderRadius: 14,
      titleBlur: reducedMotion ? 0 : 2,
      speed: reducedMotion ? 0.08 : 1,
      showTitles: true,
      showControls: true,
      showCounter: true,
      loop: false,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "tumble-portrait",
    slug: "tumble-carousel/portrait",
    name: "Tumble Portrait",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-07.webp",
    preload: loadTumbleCarousel,
    component: DynamicTumbleCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 2,
      cardWidth: 142,
      aspectRatio: "3 / 4",
      frameHeight: 238,
      visibleRange: 2.5,
      rotation: reducedMotion ? 0 : 24,
      verticalOffset: reducedMotion ? 0 : 42,
      inactiveScale: 0.68,
      borderRadius: 10,
      titleBlur: reducedMotion ? 0 : 1.5,
      speed: reducedMotion ? 0.08 : 0.92,
      showTitles: true,
      showControls: true,
      showCounter: false,
      loop: false,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "tumble-loop",
    slug: "tumble-carousel/loop",
    name: "Tumble Loop",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-08.webp",
    preload: loadTumbleCarousel,
    component: DynamicTumbleCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 4,
      cardWidth: 150,
      aspectRatio: "1 / 1",
      frameHeight: 230,
      visibleRange: 2.6,
      rotation: reducedMotion ? 0 : 34,
      verticalOffset: reducedMotion ? 0 : 50,
      inactiveScale: 0.58,
      borderRadius: 16,
      titleBlur: reducedMotion ? 0 : 2,
      speed: reducedMotion ? 0.08 : 1,
      showTitles: true,
      showControls: false,
      showCounter: true,
      loop: true,
      autoplay: !reducedMotion,
      autoplayDelay: 2600,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "tumble-soft",
    slug: "tumble-carousel/soft",
    name: "Tumble Soft",
    categories: ["galleries", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-09.webp",
    preload: loadTumbleCarousel,
    component: DynamicTumbleCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 3,
      cardWidth: 160,
      aspectRatio: "4 / 5",
      frameHeight: 240,
      visibleRange: 2.2,
      rotation: reducedMotion ? 0 : 14,
      verticalOffset: reducedMotion ? 0 : 28,
      inactiveScale: 0.76,
      borderRadius: 22,
      titleBlur: reducedMotion ? 0 : 1,
      speed: reducedMotion ? 0.08 : 0.72,
      showTitles: false,
      showControls: true,
      showCounter: true,
      loop: false,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "tumble-bold",
    slug: "tumble-carousel/bold",
    name: "Tumble Bold",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-10.webp",
    preload: loadTumbleCarousel,
    component: DynamicTumbleCarousel,
    getProps: (reducedMotion) => ({
      items: libraryCarouselItems,
      initialIndex: 2,
      cardWidth: 152,
      aspectRatio: "1 / 1",
      frameHeight: 236,
      visibleRange: 2.8,
      rotation: reducedMotion ? 0 : 48,
      verticalOffset: reducedMotion ? 0 : 62,
      inactiveScale: 0.48,
      borderRadius: 6,
      titleBlur: reducedMotion ? 0 : 3,
      speed: reducedMotion ? 0.08 : 1.15,
      showTitles: true,
      showControls: false,
      showCounter: false,
      loop: true,
      autoplay: false,
      enableDrag: !reducedMotion,
      enableKeyboard: true,
    }),
  },
  {
    id: "rotating-orbit",
    slug: "rotating-cards/orbit",
    name: "Rotating Orbit",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/hero.webp",
    preload: loadRotatingCards,
    component: DynamicRotatingCards,
    getProps: (reducedMotion) => ({
      cards: rotatingLibraryCards,
      radius: 72,
      duration: 13,
      cardWidth: 82,
      cardHeight: 108,
      pauseOnHover: true,
      reverse: false,
      draggable: !reducedMotion,
      autoPlay: !reducedMotion,
      mouseWheel: false,
      initialRotation: 0,
      className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    }),
  },
  {
    id: "rotating-gallery",
    slug: "rotating-cards/gallery",
    name: "Rotating Gallery",
    categories: ["galleries", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/team-group.webp",
    preload: loadRotatingCards,
    component: DynamicRotatingCards,
    getProps: (reducedMotion) => ({
      cards: rotatingLibraryCards,
      radius: 64,
      duration: 18,
      cardWidth: 96,
      cardHeight: 78,
      pauseOnHover: true,
      reverse: true,
      draggable: false,
      autoPlay: !reducedMotion,
      mouseWheel: false,
      initialRotation: 20,
      className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    }),
  },
  {
    id: "rotating-compact",
    slug: "rotating-cards/compact",
    name: "Rotating Compact",
    categories: ["galleries", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/booking.webp",
    preload: loadRotatingCards,
    component: DynamicRotatingCards,
    getProps: (reducedMotion) => ({
      cards: rotatingLibraryCards.slice(0, 5),
      radius: 56,
      duration: 11,
      cardWidth: 74,
      cardHeight: 96,
      pauseOnHover: true,
      reverse: false,
      draggable: !reducedMotion,
      autoPlay: !reducedMotion,
      mouseWheel: false,
      initialRotation: -18,
      className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    }),
  },
  {
    id: "rotating-slow",
    slug: "rotating-cards/slow",
    name: "Rotating Slow",
    categories: ["galleries", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/emotional.webp",
    preload: loadRotatingCards,
    component: DynamicRotatingCards,
    getProps: (reducedMotion) => ({
      cards: rotatingLibraryCards,
      radius: 74,
      duration: 28,
      cardWidth: 80,
      cardHeight: 104,
      pauseOnHover: false,
      reverse: false,
      draggable: false,
      autoPlay: !reducedMotion,
      mouseWheel: false,
      initialRotation: 8,
      className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    }),
  },
  {
    id: "credit-aurora",
    slug: "credit-card/aurora",
    name: "Credit Aurora",
    categories: ["interactive", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadCreditCard,
    component: DynamicCreditCard,
    getProps: () => ({
      cardNumber: "2409 5032 1188 7742",
      cardholderName: "ONE STUDIO",
      expirationDate: "12/30",
      cvv: "321",
      background: "linear-gradient(135deg, #ff814a 0%, #8f5bff 48%, #45c7ff 100%)",
      scale: 0.78,
      rotationIntensity: 0.9,
      parallaxIntensity: 0.75,
      scaleOnHover: 1.035,
      showShine: true,
      showShadow: true,
      borderRadius: 18,
      textColor: "#ffffff",
      hasTextShadow: true,
      showActionButtons: false,
      className: "justify-center",
    }),
  },
  {
    id: "credit-midnight",
    slug: "credit-card/midnight",
    name: "Credit Midnight",
    categories: ["interactive", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-night.webp",
    preload: loadCreditCard,
    component: DynamicCreditCard,
    getProps: () => ({
      cardNumber: "5032 7710 2206 9441",
      cardholderName: "MIDNIGHT",
      expirationDate: "09/31",
      cvv: "417",
      background: "linear-gradient(145deg, #08090d 0%, #24140d 58%, #472315 100%)",
      scale: 0.8,
      rotationIntensity: 1.1,
      parallaxIntensity: 0.85,
      scaleOnHover: 1.04,
      showShine: true,
      showShadow: true,
      borderRadius: 12,
      textColor: "#fff6ef",
      hasTextShadow: true,
      showActionButtons: false,
      className: "justify-center",
    }),
  },
  {
    id: "credit-peach",
    slug: "credit-card/peach",
    name: "Credit Peach",
    categories: ["interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-morning.webp",
    preload: loadCreditCard,
    component: DynamicCreditCard,
    getProps: () => ({
      cardNumber: "8140 2026 5032 1188",
      cardholderName: "PEACH CLUB",
      expirationDate: "08/30",
      cvv: "208",
      background: "linear-gradient(135deg, #ffd8c6 0%, #ff9a6d 52%, #e86f3d 100%)",
      scale: 0.78,
      rotationIntensity: 0.75,
      parallaxIntensity: 0.55,
      scaleOnHover: 1.025,
      showShine: true,
      showShadow: true,
      borderRadius: 24,
      textColor: "#35180c",
      hasTextShadow: false,
      showActionButtons: false,
      className: "justify-center",
    }),
  },
  {
    id: "credit-forest",
    slug: "credit-card/forest",
    name: "Credit Forest",
    categories: ["interactive", "motion"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-noon.webp",
    preload: loadCreditCard,
    component: DynamicCreditCard,
    getProps: () => ({
      cardNumber: "1188 7402 5032 6620",
      cardholderName: "FOREST",
      expirationDate: "04/32",
      cvv: "654",
      background: "linear-gradient(135deg, #0d2c26 0%, #176b57 55%, #8cc9a9 100%)",
      scale: 0.8,
      rotationIntensity: 0.95,
      parallaxIntensity: 0.65,
      scaleOnHover: 1.035,
      showShine: true,
      showShadow: true,
      borderRadius: 16,
      textColor: "#f5fff9",
      hasTextShadow: true,
      showActionButtons: false,
      className: "justify-center",
    }),
  },
  {
    id: "vortex-gold",
    slug: "vortex/gold",
    name: "Vortex Gold",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-night.webp",
    preload: loadVortex,
    component: DynamicVortex,
    getProps: (reducedMotion) => ({
      discCount: 26,
      particleCount: 1100,
      particleColor: "#ffc273",
      discColor: "rgba(255, 207, 132, .20)",
      discLineWidth: 1,
      particleSize: 0.9,
      depth: 1.18,
      spread: 1.14,
      speed: reducedMotion ? 0 : 0.12,
      rotationDirection: -1,
      centerX: 0.5,
      centerY: 0.04,
      fadeInThreshold: 0.024,
      fadeOutThreshold: 0.44,
      opacity: 0.9,
      enableCursorInteraction: !reducedMotion,
      cursorInfluence: 0.08,
    }),
  },
  {
    id: "vortex-blue",
    slug: "vortex/blue",
    name: "Vortex Blue",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-dusk.webp",
    preload: loadVortex,
    component: DynamicVortex,
    getProps: (reducedMotion) => ({
      discCount: 34,
      particleCount: 1500,
      particleColor: "#62d7ff",
      discColor: "rgba(116, 126, 255, .18)",
      discLineWidth: 0.8,
      particleSize: 0.72,
      depth: 1.5,
      spread: 0.96,
      speed: reducedMotion ? 0 : 0.2,
      rotationDirection: 1,
      centerX: 0.52,
      centerY: 0.08,
      fadeInThreshold: 0.02,
      fadeOutThreshold: 0.5,
      opacity: 0.88,
      enableCursorInteraction: !reducedMotion,
      cursorInfluence: 0.14,
    }),
  },
  {
    id: "flicker-mono",
    slug: "flicker/mono",
    name: "Flicker Mono",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-night.webp",
    preload: loadFlicker,
    component: DynamicFlicker,
    getProps: (reducedMotion) => ({
      spacing: 18,
      particleSize: 1.1,
      color: "#fff6ef",
      glowColor: "#ffffff",
      alpha: 0.78,
      overlay: 0.52,
      overlayColor: "#0a0a0a",
      minFrequency: 0.12,
      maxFrequency: 0.42,
      rate: reducedMotion ? 0 : 0.55,
      shape: "circle",
      jitter: false,
      flickerChance: 0.56,
      mouseEffect: !reducedMotion,
    }),
  },
  {
    id: "flicker-rainbow",
    slug: "flicker/rainbow",
    name: "Flicker Rainbow",
    categories: ["backgrounds", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/emotional.webp",
    preload: loadFlicker,
    component: DynamicFlicker,
    getProps: (reducedMotion) => ({
      spacing: 22,
      particleSize: 1.45,
      colorPalette: ["#ff814a", "#ffd65a", "#45c7ff", "#8f5bff", "#ff6fb5"],
      glowColor: "#fff6ef",
      alpha: 0.92,
      overlay: 0.25,
      overlayColor: "#17100c",
      minFrequency: 0.16,
      maxFrequency: 0.9,
      rate: reducedMotion ? 0 : 0.72,
      shape: "square",
      jitter: true,
      flickerChance: 0.72,
      mouseEffect: !reducedMotion,
    }),
  },
  {
    id: "page-flip-dark",
    slug: "page-flip/dark",
    name: "Page Flip Dark",
    categories: ["galleries", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/portfolio-08.webp",
    preload: loadPageFlip,
    component: DynamicPageFlip,
    getProps: (reducedMotion) => ({
      pages: [...pageFlipPages].reverse(),
      pageWidth: 148,
      pageHeight: 216,
      pageRadius: 2,
      pageColor: "#24140d",
      perspective: 1350,
      spineShift: 78,
      turnAngle: 180,
      peekAngle: reducedMotion ? 0 : 8,
      duration: reducedMotion ? 0.01 : 0.65,
      stagger: reducedMotion ? 0 : 0.06,
      ease: "circOut",
      shadow: 0.42,
      trigger: "click",
      closeOnLeave: true,
      interactive: true,
    }),
  },
  {
    id: "glitch-text-soft",
    slug: "glitch-text/soft",
    name: "Glitch Text Soft",
    categories: ["typography", "motion", "interactive"],
    adapterClass: "motionAdapter",
    poster: "/images/demos/premium-studio/bright/scene-morning.webp",
    preload: loadGlitchText,
    component: DynamicGlitchText,
    getProps: (reducedMotion) => ({
      text: "SOFT | SIGNAL",
      colors: ["#ffb38f", "#d6c3ff", "#9ee8ff"],
      textColor: "#fff8f2",
      fontSize: 66,
      fontWeight: "650",
      radius: reducedMotion ? 0 : 90,
      letterSpacing: -1,
      lineHeight: 1.04,
      textAlign: "center",
      fadeIn: !reducedMotion,
      autoFit: true,
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
