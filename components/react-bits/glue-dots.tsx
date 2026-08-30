"use client";

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface GlueDotsProps {
  /** Dots across the grid */
  columns?: number;
  /** Dots down the grid */
  rows?: number;
  /** Spread the grid across the container instead of using spacing */
  fill?: boolean;
  /** Gap between dot centres in pixels, used when fill is off */
  spacing?: number;
  /** Padding kept clear around the grid in pixels */
  inset?: number;
  /** Resting dot radius in pixels */
  dotRadius?: number;
  /** Blur radius feeding the merge filter */
  blur?: number;
  /** Threshold of the merge filter, higher snaps the edges harder */
  contrast?: number;
  /** Merge neighbouring dots into one another */
  merge?: boolean;
  /** Pull of each dot back toward its rest position */
  tension?: number;
  /** Velocity retained each frame, below 1 settles the motion */
  damping?: number;
  /** Seconds the ripple takes to travel one cell outward */
  travelDelay?: number;
  /** Peak throw of a ripple in pixels */
  bounce?: number;
  /** How quickly a ripple dies out over time */
  decay?: number;
  /** Oscillation rate of a ripple in radians per second */
  frequency?: number;
  /** How quickly a ripple weakens with distance from its origin */
  spread?: number;
  /** Release a radial ripple where the pointer presses */
  rippleOnPress?: boolean;
  /** Let the pointer drag nearby dots toward it */
  cursorInteraction?: boolean;
  /** Reach of the pointer well in pixels */
  cursorRadius?: number;
  /** How far dots slide toward the pointer in pixels */
  cursorPull?: number;
  /** How much dots swell inside the pointer well */
  cursorSwell?: number;
  /** Colour of the dots */
  color?: string;
  /** Panel backdrop, or "transparent" to show the page through */
  backgroundColor?: string;
  /** Master alpha */
  opacity?: number;
  /** Freeze the animation */
  paused?: boolean;
  /** Upper device pixel ratio bound */
  dpr?: number;
  className?: string;
  children?: ReactNode;
}

const TAU = Math.PI * 2;
const RIPPLE_SLOTS = 12;
const RIPPLE_LIFE = 3;

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

interface Lattice {
  count: number;
  homeX: Float32Array;
  homeY: Float32Array;
  posX: Float32Array;
  posY: Float32Array;
  velX: Float32Array;
  velY: Float32Array;
  size: Float32Array;
}

const emptyLattice = (): Lattice => ({
  count: 0,
  homeX: new Float32Array(0),
  homeY: new Float32Array(0),
  posX: new Float32Array(0),
  posY: new Float32Array(0),
  velX: new Float32Array(0),
  velY: new Float32Array(0),
  size: new Float32Array(0),
});

export const GlueDots = ({
  columns = 14,
  rows = 9,
  fill = true,
  spacing = 56,
  inset = 0,
  dotRadius = 12,
  blur = 8,
  contrast = 28,
  merge = true,
  tension = 0.085,
  damping = 0.8,
  travelDelay = 0.06,
  bounce = 14,
  decay = 2.6,
  frequency = 12,
  spread = 0.18,
  rippleOnPress = true,
  cursorInteraction = true,
  cursorRadius = 200,
  cursorPull = 22,
  cursorSwell = 0.25,
  color = "#ffffff",
  backgroundColor = "#0a0a0a",
  opacity = 1,
  paused = false,
  dpr = 2,
  className,
  children,
}: GlueDotsProps) => {
  const shell = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLCanvasElement>(null);
  const lattice = useRef<Lattice>(emptyLattice());
  const pointer = useRef({ x: 0, y: 0, live: false });
  const stamp = useRef({
    w: 0,
    h: 0,
    cols: 0,
    rows: 0,
    gapX: 0,
    gapY: 0,
    pad: 0,
    fill: true,
  });

  const rippleX = useRef(new Float32Array(RIPPLE_SLOTS));
  const rippleY = useRef(new Float32Array(RIPPLE_SLOTS));
  const rippleAt = useRef(new Float32Array(RIPPLE_SLOTS).fill(-999));
  const rippleAmp = useRef(new Float32Array(RIPPLE_SLOTS));
  const rippleHead = useRef(0);

  const knobs = useRef({
    columns,
    rows,
    fill,
    spacing,
    inset,
    dotRadius,
    tension,
    damping,
    travelDelay,
    bounce,
    decay,
    frequency,
    spread,
    cursorInteraction,
    cursorRadius,
    cursorPull,
    cursorSwell,
    color,
    paused,
    dpr,
  });

  useEffect(() => {
    knobs.current = {
      columns,
      rows,
      fill,
      spacing,
      inset,
      dotRadius,
      tension,
      damping,
      travelDelay,
      bounce,
      decay,
      frequency,
      spread,
      cursorInteraction,
      cursorRadius,
      cursorPull,
      cursorSwell,
      color,
      paused,
      dpr,
    };
  });

  const seedId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `glue-${seedId}`;

  useEffect(() => {
    const node = shell.current;
    const canvas = surface.current;
    if (!node || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let clock = 0;
    let last = 0;
    let awake = true;

    const layout = () => {
      const box = node.getBoundingClientRect();
      const w = Math.max(Math.round(box.width), 1);
      const h = Math.max(Math.round(box.height), 1);
      const set = knobs.current;
      const cols = Math.max(Math.round(set.columns), 1);
      const tiers = Math.max(Math.round(set.rows), 1);
      const pad = Math.max(set.inset, 0);

      let gapX = Math.max(set.spacing, 1);
      let gapY = gapX;
      if (set.fill) {
        gapX = Math.max((w - pad * 2) / cols, 1);
        gapY = Math.max((h - pad * 2) / tiers, 1);
      }

      const mark = stamp.current;
      const same =
        mark.w === w &&
        mark.h === h &&
        mark.cols === cols &&
        mark.rows === tiers &&
        mark.gapX === gapX &&
        mark.gapY === gapY &&
        mark.pad === pad &&
        mark.fill === set.fill;

      const ratio = Math.min(
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        Math.max(set.dpr, 0.5),
      );
      const pixelW = Math.round(w * ratio);
      const pixelH = Math.round(h * ratio);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (same) return;
      stamp.current = {
        w,
        h,
        cols,
        rows: tiers,
        gapX,
        gapY,
        pad,
        fill: set.fill,
      };

      const total = cols * tiers;
      const grid: Lattice = {
        count: total,
        homeX: new Float32Array(total),
        homeY: new Float32Array(total),
        posX: new Float32Array(total),
        posY: new Float32Array(total),
        velX: new Float32Array(total),
        velY: new Float32Array(total),
        size: new Float32Array(total),
      };

      const originX = set.fill ? pad + gapX / 2 : (w - (cols - 1) * gapX) / 2;
      const originY = set.fill ? pad + gapY / 2 : (h - (tiers - 1) * gapY) / 2;

      for (let index = 0; index < total; index += 1) {
        const lane = index % cols;
        const tier = (index - lane) / cols;
        const x = originX + lane * gapX;
        const y = originY + tier * gapY;
        grid.homeX[index] = x;
        grid.homeY[index] = y;
        grid.posX[index] = x;
        grid.posY[index] = y;
        grid.size[index] = set.dotRadius;
      }

      lattice.current = grid;
    };

    const castRipple = (x: number, y: number, strength: number) => {
      const slot = rippleHead.current % RIPPLE_SLOTS;
      rippleHead.current += 1;
      rippleX.current[slot] = x;
      rippleY.current[slot] = y;
      rippleAt.current[slot] = clock;
      rippleAmp.current[slot] = strength;
    };

    const advance = (beat: number) => {
      const set = knobs.current;
      const grid = lattice.current;
      if (!grid.count) return;

      const mark = stamp.current;
      const cell = Math.max((mark.gapX + mark.gapY) / 2, 1);
      const rest = Math.max(set.dotRadius, 0.5);
      const reach = Math.max(set.cursorRadius, 1);
      const pull = set.cursorPull;
      const swell = set.cursorSwell;
      const spring = clamp(set.tension, 0, 1);
      const keep = clamp(set.damping, 0, 1);
      const cursor = pointer.current;
      const useCursor = set.cursorInteraction && cursor.live;
      const step = Math.min(beat, 0.05) * 60;
      const hold = Math.pow(keep, step);

      for (let index = 0; index < grid.count; index += 1) {
        const homeX = grid.homeX[index];
        const homeY = grid.homeY[index];
        let goalX = homeX;
        let goalY = homeY;
        let goalR = rest;

        for (let slot = 0; slot < RIPPLE_SLOTS; slot += 1) {
          const age = clock - rippleAt.current[slot];
          if (age < 0 || age > RIPPLE_LIFE) continue;
          const dx = homeX - rippleX.current[slot];
          const dy = homeY - rippleY.current[slot];
          const gap = Math.hypot(dx, dy);
          const rings = gap / cell;
          const local = age - rings * set.travelDelay;
          if (local <= 0) continue;
          const falloff = Math.exp(-rings * set.spread);
          if (falloff < 0.01) continue;
          const throwOff =
            rippleAmp.current[slot] *
            Math.exp(-set.decay * local) *
            Math.sin(set.frequency * local) *
            falloff;
          if (gap > 0.001) {
            goalX += (dx / gap) * throwOff;
            goalY += (dy / gap) * throwOff;
          }
          goalR = rest * (1 + (Math.abs(throwOff) / Math.max(rest, 1)) * 0.35);
        }

        if (useCursor) {
          const dx = cursor.x - homeX;
          const dy = cursor.y - homeY;
          const gap = Math.hypot(dx, dy);
          if (gap > 1 && gap < reach) {
            const grip = (1 - gap / reach) ** 2;
            const slide = grip * pull;
            goalX += (dx / gap) * slide;
            goalY += (dy / gap) * slide;
            goalR = rest * (1 + grip * swell);
          }
        }

        let vx = grid.velX[index] + (goalX - grid.posX[index]) * spring * step;
        let vy = grid.velY[index] + (goalY - grid.posY[index]) * spring * step;
        vx *= hold;
        vy *= hold;
        grid.velX[index] = vx;
        grid.velY[index] = vy;
        grid.posX[index] += vx * step;
        grid.posY[index] += vy * step;
        grid.size[index] += (goalR - grid.size[index]) * 0.1 * step;
      }
    };

    const paint = () => {
      const grid = lattice.current;
      const { w, h } = stamp.current;
      ctx.clearRect(0, 0, w, h);
      if (!grid.count) return;
      ctx.fillStyle = knobs.current.color;
      ctx.beginPath();
      for (let index = 0; index < grid.count; index += 1) {
        const radius = Math.max(grid.size[index], 0.1);
        const x = grid.posX[index];
        const y = grid.posY[index];
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, TAU);
      }
      ctx.fill();
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!awake) return;
      const beat = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      if (!knobs.current.paused) clock += beat;
      layout();
      advance(beat);
      paint();
    };

    const track = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      pointer.current.x = event.clientX - box.left;
      pointer.current.y = event.clientY - box.top;
      pointer.current.live = true;
    };

    const release = () => {
      pointer.current.live = false;
    };

    const press = (event: PointerEvent) => {
      if (!rippleOnPress) return;
      const box = node.getBoundingClientRect();
      castRipple(
        event.clientX - box.left,
        event.clientY - box.top,
        knobs.current.bounce * 1.35,
      );
    };

    layout();

    const watcher =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(layout);
    watcher?.observe(node);

    const gate =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              awake = entry.isIntersecting;
              if (awake) last = 0;
            },
            { threshold: 0 },
          );
    gate?.observe(node);

    node.addEventListener("pointermove", track);
    node.addEventListener("pointerleave", release);
    node.addEventListener("pointerdown", press);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      watcher?.disconnect();
      gate?.disconnect();
      node.removeEventListener("pointermove", track);
      node.removeEventListener("pointerleave", release);
      node.removeEventListener("pointerdown", press);
    };
  }, [rippleOnPress]);

  const backdrop: CSSProperties = {
    backgroundColor:
      backgroundColor === "transparent" ||
      backgroundColor === "none" ||
      backgroundColor === ""
        ? undefined
        : backgroundColor,
  };

  return (
    <div
      ref={shell}
      className={cn("relative overflow-hidden", className)}
      style={{ opacity }}
    >
      <div className="absolute inset-0" style={backdrop} />
      <canvas
        ref={surface}
        className="absolute inset-0 h-full w-full"
        style={merge ? { filter: `url(#${filterId})` } : undefined}
      />
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blur}
              result="haze"
            />
            <feColorMatrix
              in="haze"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${-contrast / 2}`}
            />
          </filter>
        </defs>
      </svg>
      {children ? (
        <div className="relative z-10 h-full w-full">{children}</div>
      ) : null}
    </div>
  );
};

export default GlueDots;
