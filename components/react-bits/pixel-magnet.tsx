"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { cn } from "@/lib/utils";

export type PixelMagnetFlow = "contract" | "expand";
export type PixelMagnetBlend = "normal" | "additive";

export interface PixelMagnetProps {
  /** Container width */
  width?: string | number;
  /** Container height */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Content rendered above the effect */
  children?: React.ReactNode;
  /** Number of squares in the swarm */
  count?: number;
  /** Starting seed. Change it for a different arrangement */
  seed?: number;
  /** Grid the squares snap to. Higher values give smaller squares */
  resolution?: number;
  /** Whether squares fall inward or fly outward */
  flow?: PixelMagnetFlow;
  /** How fast the swarm cycles */
  speed?: number;
  /** Radius of the swarm relative to half the container height */
  spread?: number;
  /** Extra size added to the largest squares */
  sizeSpread?: number;
  /** Radius at which the swarm fades out */
  falloff?: number;
  /** Softness of that fade */
  falloffCurve?: number;
  /** Colour of the slowest squares */
  color?: string;
  /** Colour of the fastest squares */
  hotColor?: string;
  /** Background fill colour. Accepts "transparent" */
  backgroundColor?: string;
  /** How squares combine where they overlap */
  blendMode?: PixelMagnetBlend;
  /** Master alpha, from 0 to 1 */
  opacity?: number;
  /** Let the swarm follow the pointer */
  cursorInteraction?: boolean;
  /** How quickly the swarm catches up with the pointer */
  follow?: number;
  /** Drive the swarm with pointer speed */
  velocityActivation?: boolean;
  /** Pointer speed needed to reach full strength */
  velocityScale?: number;
  /** Strength the swarm holds while the pointer rests */
  idleStrength?: number;
  /** How quickly the swarm fades once the pointer stops. Lower values linger */
  decay?: number;
  /** Upper bound on device pixel ratio */
  dpr?: number;
  /** Hold the animation still */
  paused?: boolean;
}

const magnetVertex = `
attribute vec2 aTarget;
attribute float aPace;
attribute float aRank;

uniform float uClock;
uniform float uRes;
uniform float uFlow;
uniform float uSpread;
uniform float uGrowth;
uniform float uAspect;
uniform vec2 uOrigin;

varying vec2 vField;
varying float vPace;

void main() {
  float cycle = fract(uClock * aPace + aPace);
  float lead = 1.0 + uFlow - cycle;

  vec2 anchor = aTarget * (1.0 - lead);
  anchor = floor(anchor * uRes) / uRes;

  float edge = (1.0 + aRank * uGrowth) / uRes;
  vec2 corner = anchor + (position.xy + 0.5) * edge;

  vField = corner;
  vPace = aPace;

  vec2 placed = corner * uSpread + uOrigin;
  gl_Position = vec4(placed.x / max(uAspect, 0.001), placed.y, 0.0, 1.0);
}
`;

const magnetFragment = `
precision highp float;

varying vec2 vField;
varying float vPace;

uniform vec3 uInk;
uniform vec3 uHot;
uniform float uFalloff;
uniform float uCurve;
uniform float uCharge;
uniform float uOpacity;

void main() {
  float reach = max(uFalloff, 0.001);
  float fade = clamp(1.0 - length(vField) / reach, 0.0, 1.0);
  fade = pow(fade, max(uCurve, 0.01));

  float weight = clamp(vPace, 0.0, 1.6) / 1.6;
  vec3 tint = mix(uInk, uHot, weight);

  float alpha = fade * (0.5 + weight * 0.9) * uCharge * uOpacity;
  if (alpha <= 0.001) discard;
  gl_FragColor = vec4(tint * alpha, alpha);
}
`;

const QUAD_CORNERS = new Float32Array([
  -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
]);

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

const subscribeToScreen = () => () => {};

const readScreenDpr = () => window.devicePixelRatio || 1;

const isClear = (paint: string) => {
  const tidy = paint.trim().toLowerCase();
  return tidy === "transparent" || tidy === "none" || tidy === "";
};

const buildSwarm = (count: number, seed: number) => {
  const total = Math.max(1, Math.floor(count));
  const target = new Float32Array(total * 2);
  const pace = new Float32Array(total);
  const rank = new Float32Array(total);

  let chain = seed;
  for (let i = 0; i < total; i += 1) {
    chain += i + Math.tan(chain);
    if (!Number.isFinite(chain)) chain = seed + i * 1.618;

    target[i * 2] = Math.cos(chain);
    target[i * 2 + 1] = Math.sin(chain);
    pace[i] = i / total + (0.4713 * (Math.cos(chain) + 1.5)) / 1.5;
    rank[i] = i / total;
  }

  return { total, target, pace, rank };
};

interface PointerState {
  x: number;
  y: number;
  power: number;
  seen: boolean;
}

interface MagnetSwarmProps {
  readPointer: () => PointerState;
  count: number;
  seed: number;
  resolution: number;
  flow: PixelMagnetFlow;
  speed: number;
  spread: number;
  sizeSpread: number;
  falloff: number;
  falloffCurve: number;
  color: string;
  hotColor: string;
  blendMode: PixelMagnetBlend;
  opacity: number;
  cursorInteraction: boolean;
  follow: number;
  velocityActivation: boolean;
  velocityScale: number;
  idleStrength: number;
  decay: number;
  paused: boolean;
}

const MagnetSwarm = ({
  readPointer,
  count,
  seed,
  resolution,
  flow,
  speed,
  spread,
  sizeSpread,
  falloff,
  falloffCurve,
  color,
  hotColor,
  blendMode,
  opacity,
  cursorInteraction,
  follow,
  velocityActivation,
  velocityScale,
  idleStrength,
  decay,
  paused,
}: MagnetSwarmProps) => {
  const { invalidate, size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const clock = useRef(0);
  const origin = useRef(new THREE.Vector2(0, 0));
  const aim = useRef(new THREE.Vector2(0, 0));
  const charge = useRef(0);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCalm(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const geometry = useMemo(() => {
    const swarm = buildSwarm(count, seed);
    const mesh = new THREE.InstancedBufferGeometry();

    mesh.setAttribute("position", new THREE.BufferAttribute(QUAD_CORNERS, 3));
    mesh.setIndex([0, 1, 2, 0, 2, 3]);
    mesh.setAttribute(
      "aTarget",
      new THREE.InstancedBufferAttribute(swarm.target, 2),
    );
    mesh.setAttribute(
      "aPace",
      new THREE.InstancedBufferAttribute(swarm.pace, 1),
    );
    mesh.setAttribute(
      "aRank",
      new THREE.InstancedBufferAttribute(swarm.rank, 1),
    );
    mesh.instanceCount = swarm.total;
    return mesh;
  }, [count, seed]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uClock: { value: 0 },
      uRes: { value: 100 },
      uFlow: { value: 1 },
      uSpread: { value: 1 },
      uGrowth: { value: 1.5 },
      uAspect: { value: 1 },
      uOrigin: { value: new THREE.Vector2(0, 0) },
      uInk: { value: new THREE.Color("#16a34a") },
      uHot: { value: new THREE.Color("#bbf7d0") },
      uFalloff: { value: 1.05 },
      uCurve: { value: 0.5 },
      uCharge: { value: 0 },
      uOpacity: { value: 1 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms;

    const beat = Math.min(delta, 0.05);
    if (!paused && !calm) clock.current += beat * speed;

    const pointer = readPointer();
    const aspect = size.width / Math.max(size.height, 1);

    if (cursorInteraction && pointer.seen) {
      aim.current.set((pointer.x * 2 - 1) * aspect, 1 - pointer.y * 2);
    } else {
      aim.current.set(0, 0);
    }
    origin.current.lerp(aim.current, clamp(beat * follow, 0, 1));

    pointer.power *= Math.exp(-beat * Math.max(decay, 0.05));
    const drive = velocityActivation
      ? clamp(pointer.power / Math.max(velocityScale, 0.01), 0, 1)
      : 1;
    const goal = Math.max(clamp(idleStrength, 0, 1), drive);
    charge.current += (goal - charge.current) * clamp(beat * 6, 0, 1);

    u.uClock.value = clock.current;
    u.uRes.value = Math.max(resolution, 4);
    u.uFlow.value = flow === "contract" ? 1 : 0;
    u.uSpread.value = spread;
    u.uGrowth.value = sizeSpread;
    u.uAspect.value = aspect;
    u.uOrigin.value.copy(origin.current);
    u.uInk.value.set(color);
    u.uHot.value.set(hotColor);
    u.uFalloff.value = falloff;
    u.uCurve.value = falloffCurve;
    u.uCharge.value = charge.current;
    u.uOpacity.value = opacity;

    const mixing =
      blendMode === "additive" ? THREE.AdditiveBlending : THREE.NormalBlending;
    if (material.blending !== mixing) material.blending = mixing;

    invalidate();
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={magnetVertex}
        fragmentShader={magnetFragment}
        transparent
        premultipliedAlpha
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

const PixelMagnet = ({
  width = "100%",
  height = "100%",
  className,
  children,
  count = 25,
  seed = 1,
  resolution = 100,
  flow = "contract",
  speed = 1,
  spread = 1,
  sizeSpread = 1.5,
  falloff = 1.05,
  falloffCurve = 0.5,
  color = "#16a34a",
  hotColor = "#bbf7d0",
  backgroundColor = "#0a0a0a",
  blendMode = "normal",
  opacity = 1,
  cursorInteraction = true,
  follow = 10.5,
  velocityActivation = true,
  velocityScale = 1.6,
  idleStrength = 0,
  decay = 1.2,
  dpr = 2,
  paused = false,
}: PixelMagnetProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<PointerState>({
    x: 0.5,
    y: 0.5,
    power: 0,
    seen: false,
  });
  const stamp = useRef(0);
  const [awake, setAwake] = useState(false);
  const screenDpr = useSyncExternalStore(
    subscribeToScreen,
    readScreenDpr,
    () => 1,
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const watcher = new IntersectionObserver(
      ([entry]) => setAwake(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    watcher.observe(node);
    return () => watcher.disconnect();
  }, []);

  const readPointer = useCallback(() => pointer.current, []);

  const aimAt = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const node = rootRef.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    const now = performance.now();
    const gap = Math.max(now - stamp.current, 8) / 1000;
    stamp.current = now;

    if (pointer.current.seen) {
      const dx = x - pointer.current.x;
      const dy = y - pointer.current.y;
      const rate = Math.hypot(dx, dy) / gap;
      pointer.current.power = Math.max(pointer.current.power, rate);
    }

    pointer.current.x = x;
    pointer.current.y = y;
    pointer.current.seen = true;
  }, []);

  const release = useCallback(() => {
    pointer.current.seen = false;
    pointer.current.power = 0;
  }, []);

  const ceiling = useMemo(
    () => clamp(Math.min(screenDpr, dpr), 0.5, 2),
    [screenDpr, dpr],
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        width,
        height,
        backgroundColor: isClear(backgroundColor) ? undefined : backgroundColor,
      }}
      onPointerMove={cursorInteraction ? aimAt : undefined}
      onPointerLeave={cursorInteraction ? release : undefined}
    >
      <Canvas
        className="absolute inset-0"
        dpr={ceiling}
        frameloop={awake ? "always" : "demand"}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        orthographic
      >
        <MagnetSwarm
          readPointer={readPointer}
          count={count}
          seed={seed}
          resolution={resolution}
          flow={flow}
          speed={speed}
          spread={spread}
          sizeSpread={sizeSpread}
          falloff={falloff}
          falloffCurve={falloffCurve}
          color={color}
          hotColor={hotColor}
          blendMode={blendMode}
          opacity={opacity}
          cursorInteraction={cursorInteraction}
          follow={follow}
          velocityActivation={velocityActivation}
          velocityScale={velocityScale}
          idleStrength={idleStrength}
          decay={decay}
          paused={paused}
        />
      </Canvas>
      {children ? (
        <div className="relative z-10 h-full w-full">{children}</div>
      ) : null}
    </div>
  );
};

export default PixelMagnet;
