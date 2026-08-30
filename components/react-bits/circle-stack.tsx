"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export interface CircleStackItem {
  /** Stable id for React keys: defaults to the index if omitted. */
  id?: string;
  /** Image URL rendered inside the disc when it becomes active. */
  image: string;
  /** Alt text for the image. */
  alt?: string;
}

export interface CircleStackProps {
  /** Discs in the stack. Defaults to 3 sample images. */
  items?: CircleStackItem[];
  /** Diameter of each disc in pixels. */
  size?: number;
  /** Tilt of the discs in degrees. 0 = flat circle, 90 = edge-on. */
  tilt?: number;
  /** Vertical separation between adjacent discs in pixels. */
  stackGap?: number;
  /** Seconds between active-index advances. */
  interval?: number;
  /** Seconds for the lift / settle transition. */
  transitionDuration?: number;
  /** Pause the auto-cycle. */
  paused?: boolean;
  /** Color for the disc surface (top face). */
  surfaceColor?: string;
  /** Color for the disc border ring. */
  borderColor?: string;
  /** Border thickness in pixels. */
  borderWidth?: number;
  /** Optional className on the root. */
  className?: string;
  /** Optional inline style on the root. */
  style?: CSSProperties;
  /** Fired when the active disc changes. */
  onActiveChange?: (index: number) => void;
}

const DEFAULT_ITEMS: CircleStackItem[] = [
  {
    id: "circle-stack-1",
    image:
      "https://images.unsplash.com/photo-1635776062360-af423602aff3?q=80&w=900&auto=format&fit=crop",
    alt: "Lavender gradient",
  },
  {
    id: "circle-stack-2",
    image:
      "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=900&auto=format&fit=crop",
    alt: "Peach gradient",
  },
  {
    id: "circle-stack-3",
    image:
      "https://images.unsplash.com/photo-1635776062764-e025521e3df3?q=80&w=900&auto=format&fit=crop",
    alt: "Mint gradient",
  },
];

const CircleStack = ({
  items = DEFAULT_ITEMS,
  size = 410,
  tilt = 60,
  stackGap = 45,
  interval = 4,
  transitionDuration = 0.9,
  paused = false,
  surfaceColor = "#FFFFFF",
  borderColor = "#000000",
  borderWidth = 1,
  className,
  style,
  onActiveChange,
}: CircleStackProps) => {
  const total = Math.max(1, items.length);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = window.setInterval(
      () => {
        setActiveIndex((i) => {
          const next = (i + 1) % total;
          onActiveChange?.(next);
          return next;
        });
      },
      Math.max(0.2, interval) * 1000,
    );
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, total, interval]);

  const stackHeight = size + (total - 1) * stackGap;

  const rootStyle: CSSProperties = {
    width: size + 80,
    height: stackHeight + 40,
    perspective: size * 8,
    ...style,
  };

  const tiltRad = (tilt * Math.PI) / 180;
  const liftAmount = size * Math.cos(tiltRad) * 0.6;

  return (
    <div
      className={cn(
        "relative flex select-none items-center justify-center",
        className,
      )}
      style={rootStyle}
      role="group"
      aria-label="Disc stack"
    >
      <div
        className="relative [transform-style:preserve-3d]"
        style={{ width: size, height: stackHeight }}
      >
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          const restingY = i * stackGap;
          const y = i < activeIndex ? restingY - liftAmount : restingY;

          return (
            <div
              key={item.id ?? i}
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-full"
              style={{
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                transform: `translateY(${y}px) rotateX(${tilt}deg)`,
                transformStyle: "preserve-3d",
                zIndex: total - i,
                background: surfaceColor,
                border: `${borderWidth}px solid ${borderColor}`,
                transition: `transform ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.alt ?? ""}
                draggable={false}
                className="h-full w-full select-none object-cover"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CircleStack;
