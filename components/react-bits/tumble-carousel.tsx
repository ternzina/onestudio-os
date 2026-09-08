"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
  type Transition,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TumbleCarouselItem {
  /** Image source */
  src: string;
  /** Caption rendered over the focused card */
  title: string;
  /** Alt text, defaults to the title */
  alt?: string;
}

export interface TumbleCarouselProps {
  /** Cards rendered by the carousel */
  items?: TumbleCarouselItem[];
  /** Card focused on mount */
  initialIndex?: number;
  /** Card width in pixels */
  cardWidth?: number;
  /** Aspect ratio of each card */
  aspectRatio?: string;
  /** Height of the visible frame, derived from the card geometry when omitted */
  frameHeight?: number;
  /** Distance in steps at which cards have faded out completely */
  visibleRange?: number;
  /** Degrees each card tumbles per step away from the focused one */
  rotation?: number;
  /** Vertical drop per step as a percentage of card height */
  verticalOffset?: number;
  /** Scale applied to every unfocused card */
  inactiveScale?: number;
  /** Corner radius of the cards in pixels */
  borderRadius?: number;
  /** Blur applied to unfocused captions in pixels */
  titleBlur?: number;
  /** Multiplier for the transition duration */
  speed?: number;
  /** Render the caption over the focused card */
  showTitles?: boolean;
  /** Show the previous and next buttons */
  showControls?: boolean;
  /** Show the position counter between the buttons */
  showCounter?: boolean;
  /** Tumble endlessly in both directions */
  loop?: boolean;
  /** Advance on a timer */
  autoplay?: boolean;
  /** Delay between automatic advances in milliseconds */
  autoplayDelay?: number;
  /** Allow dragging across the frame to navigate */
  enableDrag?: boolean;
  /** Allow arrow keys to navigate when focused */
  enableKeyboard?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Fired whenever the focused card changes */
  onIndexChange?: (index: number) => void;
}

const DEFAULT_ITEMS: TumbleCarouselItem[] = [
  {
    src: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=600&auto=format&fit=crop",
    title: "Vanishing Point",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    title: "Glass and Gravity",
  },
  {
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=600&auto=format&fit=crop",
    title: "Cut From the Sky",
  },
  {
    src: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=600&auto=format&fit=crop",
    title: "Stacked in White",
  },
  {
    src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=600&auto=format&fit=crop",
    title: "The Long Curve",
  },
  {
    src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=600&auto=format&fit=crop",
    title: "Quiet Lines",
  },
  {
    src: "https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?q=80&w=600&auto=format&fit=crop",
    title: "Cobalt Facade",
  },
  {
    src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=600&auto=format&fit=crop",
    title: "Concrete Chorus",
  },
  {
    src: "https://images.unsplash.com/photo-1470723710355-95304d8aece4?q=80&w=600&auto=format&fit=crop",
    title: "City in Motion",
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
    title: "Water and Stone",
  },
];

const FADE_SPAN = 0.7;
const THROW_WEIGHT = 0.12;
const CLICK_SLOP = 6;

const parseRatio = (value: string) => {
  const [w, h] = value.split("/").map((part) => Number(part.trim()));
  if (!Number.isFinite(w) || w <= 0) return 1;
  if (!Number.isFinite(h) || h <= 0) return w;
  return w / h;
};

const settle = (value: number, count: number, wrap: boolean) => {
  if (count < 1) return 0;
  if (wrap) return ((value % count) + count) % count;
  return value < 0 ? 0 : value > count - 1 ? count - 1 : value;
};

const nearestDelta = (raw: number, count: number, wrap: boolean) => {
  if (!wrap || count < 2) return raw;
  const half = count / 2;
  let shifted = ((raw + half) % count) - half;
  if (shifted < -half) shifted += count;
  return shifted;
};

const spring = (
  bounce: number,
  seconds: number,
  speed: number,
  plain: boolean,
): Transition =>
  plain
    ? { type: "tween", duration: 0.12, ease: "linear" }
    : { type: "spring", bounce, duration: seconds * speed };

interface CardProps {
  item: TumbleCarouselItem;
  index: number;
  count: number;
  glide: MotionValue<number>;
  tumble: MotionValue<number>;
  width: number;
  aspectRatio: string;
  rotation: number;
  drop: number;
  minScale: number;
  radius: number;
  blur: number;
  captioned: boolean;
  wrap: boolean;
  range: number;
  onPick: () => void;
}

const Card = ({
  item,
  index,
  count,
  glide,
  tumble,
  width,
  aspectRatio,
  rotation,
  drop,
  minScale,
  radius,
  blur,
  captioned,
  wrap,
  range,
  onPick,
}: CardProps) => {
  const lateral = useTransform(glide, (p) =>
    nearestDelta(index - p, count, wrap),
  );
  const pivot = useTransform(tumble, (p) =>
    nearestDelta(index - p, count, wrap),
  );

  const x = useTransform(lateral, (d) => `${d * 100 - 50}%`);
  const y = useTransform(pivot, (d) => `${d * drop - 50}%`);
  const rotate = useTransform(pivot, (d) => d * rotation);
  const scale = useTransform(
    pivot,
    (d) => 1 - Math.min(Math.abs(d), 1) * (1 - minScale),
  );
  const zIndex = useTransform(
    pivot,
    (d) => count - Math.round(Math.abs(d) * 2),
  );
  const veil = useTransform(pivot, (d) => {
    const past = Math.abs(d) - Math.max(range - FADE_SPAN, 0);
    return past <= 0 ? 1 : Math.max(0, 1 - past / FADE_SPAN);
  });

  const fade = useTransform(pivot, (d) => Math.max(0, 1 - Math.abs(d) * 1.8));
  const smear = useTransform(
    pivot,
    (d) => `blur(${Math.min(Math.abs(d), 1) * blur}px)`,
  );
  const lift = useTransform(pivot, (d) => Math.min(Math.abs(d), 1) * 10);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-[transform]"
      style={{ width, aspectRatio, x, y, rotate, scale, zIndex, opacity: veil }}
    >
      <button
        type="button"
        onClick={onPick}
        aria-label={item.title}
        style={{ borderRadius: radius }}
        className="relative block h-full w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 shadow-[0_18px_45px_-20px_rgb(0_0_0/0.45)] outline-none focus-visible:[outline:2px_solid_currentColor] focus-visible:[outline-offset:4px]"
      >
        <img
          src={item.src}
          alt={item.alt ?? item.title}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
        />

        {captioned && (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              style={{ opacity: fade }}
            />
            <motion.span
              className="pointer-events-none absolute inset-x-0 bottom-0 block px-4 pb-3.5 text-left text-sm font-medium leading-snug tracking-[-0.01em] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]"
              style={{ opacity: fade, filter: smear, y: lift }}
            >
              {item.title}
            </motion.span>
          </>
        )}
      </button>
    </motion.div>
  );
};

const Arrow = ({
  side,
  disabled,
  onPress,
}: {
  side: "prev" | "next";
  disabled: boolean;
  onPress: () => void;
}) => {
  const Glyph = side === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={side === "prev" ? "Previous card" : "Next card"}
      className="cursor-pointer p-1 opacity-40 transition-opacity duration-200 hover:opacity-100 disabled:pointer-events-none disabled:opacity-15"
    >
      <Glyph size={16} strokeWidth={2.25} />
    </button>
  );
};

const TumbleCarousel: React.FC<TumbleCarouselProps> = ({
  items = DEFAULT_ITEMS,
  initialIndex = 3,
  cardWidth = 200,
  aspectRatio = "1 / 1",
  frameHeight,
  visibleRange = 2.4,
  rotation = 30,
  verticalOffset = 50,
  inactiveScale = 0.6,
  borderRadius = 16,
  titleBlur = 2,
  speed = 1,
  showTitles = true,
  showControls = true,
  showCounter = true,
  loop = false,
  autoplay = false,
  autoplayDelay = 3000,
  enableDrag = true,
  enableKeyboard = true,
  className,
  onIndexChange,
}) => {
  const count = items.length;
  const plain = useReducedMotion() ?? false;
  const start = useMemo(
    () => settle(initialIndex, count, false),
    [initialIndex, count],
  );

  const [focused, setFocused] = useState(start);
  const glide = useMotionValue(start);
  const tumble = useMotionValue(start);

  const anchor = useRef(start);
  const swiped = useRef(false);
  const report = useRef(onIndexChange);

  useEffect(() => {
    report.current = onIndexChange;
  }, [onIndexChange]);

  const settleAt = useCallback(
    (raw: number) => {
      const target = settle(raw, count, loop);
      setFocused(target);
      report.current?.(target);

      const landing = loop
        ? tumble.get() + nearestDelta(target - tumble.get(), count, true)
        : target;
      animate(glide, landing, spring(0.1, 0.8, speed, plain));
      animate(tumble, landing, spring(0.2, 0.8, speed, plain));
    },
    [count, glide, loop, plain, speed, tumble],
  );

  const nudge = useCallback(
    (delta: number) => settleAt(focused + delta),
    [focused, settleAt],
  );

  useEffect(() => {
    if (!autoplay || count <= 1) return;
    const tick = window.setInterval(
      () => {
        if (!loop && focused >= count - 1) return;
        settleAt(focused + 1);
      },
      Math.max(autoplayDelay, 400),
    );
    return () => window.clearInterval(tick);
  }, [autoplay, autoplayDelay, count, focused, loop, settleAt]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboard) return;
    const delta =
      event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!delta) return;
    event.preventDefault();
    nudge(delta);
  };

  const onPanStart = () => {
    swiped.current = false;
    anchor.current = tumble.get();
  };

  const onPan = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > CLICK_SLOP) swiped.current = true;
    let next = anchor.current - info.offset.x / cardWidth;
    if (!loop) {
      if (next < 0) next *= 0.35;
      else if (next > count - 1) next = count - 1 + (next - (count - 1)) * 0.35;
    }
    glide.set(next);
    tumble.set(next);
  };

  const onPanEnd = (_: unknown, info: PanInfo) => {
    const thrown = tumble.get() - (info.velocity.x / cardWidth) * THROW_WEIGHT;
    settleAt(Math.round(thrown));
  };

  const pick = (index: number) => {
    if (swiped.current) return;
    settleAt(index);
  };

  const frame = useMemo(() => {
    if (frameHeight) return frameHeight;
    const cardHeight = cardWidth / parseRatio(aspectRatio);
    const radians = (Math.abs(rotation) * Math.PI) / 180;
    const halfSpan =
      (inactiveScale *
        (cardHeight * Math.cos(radians) + cardWidth * Math.sin(radians))) /
      2;
    const reach = (Math.abs(verticalOffset) / 100) * cardHeight;
    return Math.round(2 * (visibleRange * reach + halfSpan));
  }, [
    aspectRatio,
    cardWidth,
    frameHeight,
    inactiveScale,
    rotation,
    verticalOffset,
    visibleRange,
  ]);

  const pad = String(count).length;
  const head = !loop && focused === 0;
  const tail = !loop && focused >= count - 1;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex w-full select-none flex-col items-center overflow-hidden text-neutral-900 outline-none dark:text-neutral-100",
        className,
      )}
    >
      <motion.div
        className="relative w-full overflow-hidden"
        style={{ height: frame, touchAction: "pan-y" }}
        onPanStart={enableDrag ? onPanStart : undefined}
        onPan={enableDrag ? onPan : undefined}
        onPanEnd={enableDrag ? onPanEnd : undefined}
      >
        {items.map((item, index) => (
          <Card
            key={`${item.src}-${index}`}
            item={item}
            index={index}
            count={count}
            glide={glide}
            tumble={tumble}
            width={cardWidth}
            aspectRatio={aspectRatio}
            rotation={rotation}
            drop={verticalOffset}
            minScale={inactiveScale}
            radius={borderRadius}
            blur={titleBlur}
            captioned={showTitles}
            wrap={loop}
            range={visibleRange}
            onPick={() => pick(index)}
          />
        ))}
      </motion.div>

      {(showControls || showCounter) && (
        <div className="mt-6 flex items-center gap-4">
          {showControls && (
            <Arrow side="prev" disabled={head} onPress={() => nudge(-1)} />
          )}
          {showCounter && (
            <p className="flex items-center gap-1.5 text-xs font-medium tabular-nums tracking-wide">
              <span>{String(focused + 1).padStart(pad, "0")}</span>
              <span className="opacity-30">/</span>
              <span className="opacity-40">
                {String(count).padStart(pad, "0")}
              </span>
            </p>
          )}
          {showControls && (
            <Arrow side="next" disabled={tail} onPress={() => nudge(1)} />
          )}
        </div>
      )}
    </div>
  );
};

export default TumbleCarousel;
