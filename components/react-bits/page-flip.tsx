"use client";

import { memo, useCallback, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

export interface PageFlipLeaf {
  id?: string;
  front: string;
  back: string;
  frontAlt?: string;
  backAlt?: string;
}

export interface PageFlipProps {
  /** Leaves of the book, each with a front and a back image. */
  pages?: PageFlipLeaf[];
  /** Width of a single leaf in pixels. */
  pageWidth?: number;
  /** Height of a single leaf in pixels. */
  pageHeight?: number;
  /** Corner radius of a leaf in pixels. */
  pageRadius?: number;
  /** Paper colour showing through while an image loads. */
  pageColor?: string;
  /** Perspective depth applied to the scene, in pixels. */
  perspective?: number;
  /** How far the book slides aside once a leaf is turned, in pixels. */
  spineShift?: number;
  /** Angle a turned leaf rotates through, in degrees. */
  turnAngle?: number;
  /** Angle an unopened leaf tilts to when the pointer is over it. */
  peekAngle?: number;
  /** Seconds a single turn takes. */
  duration?: number;
  /** Seconds added per leaf when the whole book closes at once. */
  stagger?: number;
  /** Easing curve of the turn. */
  ease?: "easeInOut" | "easeOut" | "circOut" | "backOut";
  /** Drop shadow strength behind each leaf, 0 removes it. */
  shadow?: number;
  /** Interaction that turns a leaf. Hover riffles through the book. */
  trigger?: "click" | "hover";
  /** Close every turned leaf when the pointer leaves the scene. */
  closeOnLeave?: boolean;
  /** Enable pointer and keyboard interaction. */
  interactive?: boolean;
  /** Optional className applied to the root. */
  className?: string;
  /** Optional inline style applied to the root. */
  style?: CSSProperties;
}

const CURVES = {
  easeInOut: [0.65, 0, 0.35, 1],
  easeOut: [0.16, 1, 0.3, 1],
  circOut: [0, 0.55, 0.45, 1],
  backOut: [0.34, 1.56, 0.64, 1],
} as const;

const DEFAULT_PAGES: PageFlipLeaf[] = [
  {
    id: "atrium",
    front:
      "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=700&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=700&auto=format&fit=crop",
    frontAlt: "Glass atrium seen from below",
    backAlt: "Corporate tower against an open sky",
  },
  {
    id: "vault",
    front:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=700&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=700&auto=format&fit=crop",
    frontAlt: "White concrete facade in daylight",
    backAlt: "Repeating window lattice on a high rise",
  },
  {
    id: "terrace",
    front:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=700&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=700&auto=format&fit=crop",
    frontAlt: "Terraced building stepping into the sky",
    backAlt: "Row of arches along a shaded walkway",
  },
  {
    id: "canopy",
    front:
      "https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?q=80&w=700&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=700&auto=format&fit=crop",
    frontAlt: "Steel canopy over a public square",
    backAlt: "Concrete stairwell curving upward",
  },
  {
    id: "ridge",
    front:
      "https://images.unsplash.com/photo-1470723710355-95304d8aece4?q=80&w=700&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=700&auto=format&fit=crop",
    frontAlt: "Roofline ridge cutting across the skyline",
    backAlt: "Modern house framed by clean geometry",
  },
];

interface LeafProps {
  index: number;
  total: number;
  front: string;
  back: string;
  frontAlt: string;
  backAlt: string;
  turned: boolean;
  peek: boolean;
  delay: number;
  width: number;
  height: number;
  radius: number;
  paper: string;
  turnAngle: number;
  peekAngle: number;
  duration: number;
  curve: readonly number[];
  shadow: number;
  interactive: boolean;
  onSelect: (index: number) => void;
  onReach: (index: number) => void;
  onRelease: () => void;
}

const Leaf = memo(function Leaf({
  index,
  total,
  front,
  back,
  frontAlt,
  backAlt,
  turned,
  peek,
  delay,
  width,
  height,
  radius,
  paper,
  turnAngle,
  peekAngle,
  duration,
  curve,
  shadow,
  interactive,
  onSelect,
  onReach,
  onRelease,
}: LeafProps) {
  const spin = useMotionValue(0);
  const stack = useTransform(spin, (value) =>
    value < -turnAngle / 2 ? total + index + 1 : total - index,
  );

  return (
    <motion.div
      className="absolute"
      style={{
        width,
        height,
        rotateY: spin,
        zIndex: stack,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        borderRadius: radius,
        cursor: interactive ? "pointer" : "default",
        boxShadow:
          shadow > 0
            ? `${Math.round(4 * shadow)}px ${Math.round(6 * shadow)}px ${Math.round(
                34 * shadow,
              )}px rgba(0,0,0,${Math.min(shadow * 0.75, 1)})`
            : "none",
      }}
      animate={{ rotateY: turned ? -turnAngle : peek ? -peekAngle : 0 }}
      transition={{
        duration,
        delay,
        ease: curve as unknown as [number, number, number, number],
      }}
      onPointerEnter={() => onReach(index)}
      onPointerLeave={onRelease}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(index);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(index);
        }
      }}
      role={interactive ? "button" : undefined}
      aria-pressed={interactive ? turned : undefined}
      tabIndex={interactive ? 0 : -1}
    >
      <img
        src={front}
        alt={frontAlt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          background: paper,
          borderRadius: radius,
          backfaceVisibility: "hidden",
        }}
      />
      <img
        src={back}
        alt={backAlt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          background: paper,
          borderRadius: radius,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg) translateZ(1px)",
        }}
      />
    </motion.div>
  );
});

const PageFlip = ({
  pages = DEFAULT_PAGES,
  pageWidth = 220,
  pageHeight = 320,
  pageRadius = 4,
  pageColor = "#f4f4f4",
  perspective = 1200,
  spineShift = 110,
  turnAngle = 180,
  peekAngle = 10,
  duration = 0.55,
  stagger = 0.08,
  ease = "easeInOut",
  shadow = 0.3,
  trigger = "click",
  closeOnLeave = true,
  interactive = true,
  className,
  style,
}: PageFlipProps) => {
  const book = pages.length > 0 ? pages : DEFAULT_PAGES;
  const total = book.length;

  const [open, setOpen] = useState(0);
  const [hovered, setHovered] = useState(-1);
  const [cascade, setCascade] = useState(false);

  const curve = CURVES[ease] ?? CURVES.easeInOut;

  const select = useCallback(
    (index: number) => {
      if (!interactive) return;
      setCascade(false);
      setOpen((prev) => (index < prev ? index : index + 1));
    },
    [interactive],
  );

  const reach = useCallback(
    (index: number) => {
      if (!interactive) return;
      setHovered(index);
      if (trigger !== "hover") return;
      setCascade(false);
      setOpen(index + 1);
    },
    [interactive, trigger],
  );

  const release = useCallback(() => {
    setHovered(-1);
  }, []);

  const shutAll = useCallback(() => {
    setCascade(true);
    setOpen(0);
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ perspective: `${perspective}px`, ...style }}
      onClick={shutAll}
      onPointerLeave={() => {
        setHovered(-1);
        if (closeOnLeave) shutAll();
      }}
    >
      <motion.div
        className="relative"
        style={{
          width: pageWidth,
          height: pageHeight,
          perspective: `${perspective}px`,
          transformStyle: "preserve-3d",
        }}
        animate={{ x: open > 0 ? spineShift : 0 }}
        transition={{
          duration: Math.max(duration * 0.8, 0.1),
          ease: "easeOut",
        }}
      >
        {book.map((leaf, index) => {
          const turned = index < open;
          return (
            <Leaf
              key={leaf.id ?? `${leaf.front}-${index}`}
              index={index}
              total={total}
              front={leaf.front}
              back={leaf.back}
              frontAlt={leaf.frontAlt ?? ""}
              backAlt={leaf.backAlt ?? ""}
              turned={turned}
              peek={
                interactive && !turned && hovered === index && index === open
              }
              delay={cascade && !turned ? (total - 1 - index) * stagger : 0}
              width={pageWidth}
              height={pageHeight}
              radius={pageRadius}
              paper={pageColor}
              turnAngle={turnAngle}
              peekAngle={peekAngle}
              duration={duration}
              curve={curve}
              shadow={shadow}
              interactive={interactive}
              onSelect={select}
              onReach={reach}
              onRelease={release}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default PageFlip;
