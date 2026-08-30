"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface ChromaBlindsProps {
  /** Container width */
  width?: string | number;
  /** Container height */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Content rendered above the effect */
  children?: React.ReactNode;
  /** Number of diagonal stripes spanning the canvas */
  lineCount?: number;
  /** Glow falloff numerator: fatter or thinner light strokes */
  lineThickness?: number;
  /** Glow falloff exponent: lower is sharper, higher is softer */
  lineSharpness?: number;
  /** Drift speed of the diagonal pattern */
  speed?: number;
  /** Stripe rotation in degrees (45 = original "uv.x - uv.y" direction) */
  angle?: number;
  /** Magnification: larger numbers crop the field tighter */
  zoom?: number;
  /** Strength of the radial color drift across the canvas */
  radialPulseStrength?: number;
  /** Time-driven rate of the radial color drift */
  radialPulseSpeed?: number;
  /** Smoothstep upper-bound: lower = more punch, higher = softer rolloff */
  contrast?: number;
  /** First color in the 3-stop cycle (lands at t=0) */
  colorA?: string;
  /** Second color in the 3-stop cycle (lands at t=1/3) */
  colorB?: string;
  /** Third color in the 3-stop cycle (lands at t=2/3) */
  colorC?: string;
  /** Background fill color in hex */
  backgroundColor?: string;
  /** Master alpha (0–1) */
  opacity?: number;
  /** Maximum device pixel ratio */
  dpr?: number;
  /** Freeze the animation in place */
  paused?: boolean;
  /** Allow the cursor to bend the stripe direction toward it */
  cursorInteraction?: boolean;
  /** Maximum angle deviation in degrees applied at the cursor */
  cursorAngleStrength?: number;
  /** Per-frame lerp toward the cursor-driven angle (0–1) */
  cursorLerp?: number;
  /** Click contrast multiplier (>= 1) */
  clickBurstStrength?: number;
  /** Per-second decay rate for the click burst */
  clickBurstDecay?: number;
}

const screenVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const blindsFragment = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;

uniform float uLineCount;
uniform float uLineThickness;
uniform float uLineSharpness;
uniform float uAngleRad;
uniform float uZoom;
uniform float uRadialStrength;
uniform float uRadialSpeed;
uniform float uContrast;

uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;

uniform vec3  uBg;
uniform float uAlpha;
uniform float uClickBoost;

vec3 cosinePalette(in float t) {
  vec3 a = (uColorA + uColorB + uColorC) / 3.0;
  vec3 x = uColorA - a;
  vec3 y = uColorB - a;
  vec3 bSin = -(x + 2.0 * y) / 1.73205080757;
  vec3 phase = vec3(
    atan(bSin.x, x.x),
    atan(bSin.y, x.y),
    atan(bSin.z, x.z)
  );
  vec3 amp = sqrt(x * x + bSin * bSin);
  return a + amp * cos(6.28318530718 * t + phase);
}

void main() {
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  uv *= max(uZoom, 0.0001);

  float ca = cos(uAngleRad);
  float sa = sin(uAngleRad);
  vec2 rotated = vec2(ca * uv.x - sa * uv.y, sa * uv.x + ca * uv.y);

  float stripe = rotated.x * uLineCount * 1.41421356 + uTime * 0.8;
  float wave = sin(stripe);

  float dist = abs(wave);
  float glow = uLineThickness / pow(max(dist, 0.0001), max(uLineSharpness, 0.05));

  float radial = length(uv) * uRadialStrength + uTime * uRadialSpeed;
  vec3 paletteCol = cosinePalette(radial);
  vec3 col = paletteCol * glow * uClickBoost;

  col = smoothstep(vec3(0.0), vec3(max(uContrast, 0.001)), col);

  float bgLuma = dot(uBg, vec3(0.2126, 0.7152, 0.0722));
  float lightMix = smoothstep(0.35, 0.75, bgLuma);

  float coverage = clamp(
    dot(col, vec3(0.2126, 0.7152, 0.0722)),
    0.0,
    1.0
  );

  vec3 painted = mix(uBg, paletteCol, coverage);
  vec3 finalCol = mix(col, painted, lightMix);

  gl_FragColor = vec4(finalCol, uAlpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const n = parseInt(v.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

interface PointerState {
  active: boolean;
  nx: number;
  ny: number;
  smoothedAngle: number;
  initialized: boolean;
  click: number;
}

type PipelineProps = Required<
  Omit<ChromaBlindsProps, "width" | "height" | "className" | "children" | "dpr">
> & {
  onPointerReady: (state: PointerState) => void;
};

const BlindsPipeline: React.FC<PipelineProps> = (props) => {
  const { gl, size } = useThree();

  const refs = useRef<{
    mat: THREE.ShaderMaterial;
    geom: THREE.PlaneGeometry;
    mesh: THREE.Mesh;
    scene: THREE.Scene;
    cam: THREE.OrthographicCamera;
    pointer: PointerState;
  } | null>(null);

  if (refs.current === null) {
    const geom = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: screenVertex,
      fragmentShader: blindsFragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uLineCount: { value: 8 },
        uLineThickness: { value: 0.3 },
        uLineSharpness: { value: 0.7 },
        uAngleRad: { value: Math.PI / 4 },
        uZoom: { value: 0.75 },
        uRadialStrength: { value: 0.5 },
        uRadialSpeed: { value: 0.2 },
        uContrast: { value: 1.2 },
        uColorA: { value: new THREE.Vector3(0.318, 0.024, 0.475) },
        uColorB: { value: new THREE.Vector3(0.878, 0.082, 0.706) },
        uColorC: { value: new THREE.Vector3(0.612, 0.631, 0.949) },
        uBg: { value: new THREE.Vector3(0, 0, 0) },
        uAlpha: { value: 1 },
        uClickBoost: { value: 1 },
      },
    });
    const mesh = new THREE.Mesh(geom, mat);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cam.position.z = 1;
    const pointer: PointerState = {
      active: false,
      nx: 0.5,
      ny: 0.5,
      smoothedAngle: 0,
      initialized: false,
      click: 0,
    };
    refs.current = { mat, geom, mesh, scene, cam, pointer };
  }

  const onReady = props.onPointerReady;
  useEffect(() => {
    const r = refs.current;
    if (r) onReady(r.pointer);
  }, [onReady]);

  useEffect(() => {
    return () => {
      const r = refs.current;
      if (!r) return;
      r.mat.dispose();
      r.geom.dispose();
    };
  }, []);

  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    const r = refs.current;
    if (!r) return;

    const u = r.mat.uniforms;
    if (!props.paused) {
      elapsedRef.current += delta * Math.max(props.speed, 0);
    }
    u.uTime.value = elapsedRef.current;
    u.uRes.value.set(size.width, size.height);
    u.uLineCount.value = props.lineCount;
    u.uLineThickness.value = props.lineThickness;
    u.uLineSharpness.value = props.lineSharpness;
    u.uZoom.value = props.zoom;
    u.uRadialStrength.value = props.radialPulseStrength;
    u.uRadialSpeed.value = props.radialPulseSpeed;
    u.uContrast.value = props.contrast;
    u.uAlpha.value = props.opacity;

    const a = hexToRgb(props.colorA);
    u.uColorA.value.set(a[0], a[1], a[2]);
    const b = hexToRgb(props.colorB);
    u.uColorB.value.set(b[0], b[1], b[2]);
    const c = hexToRgb(props.colorC);
    u.uColorC.value.set(c[0], c[1], c[2]);
    const bg = hexToRgb(props.backgroundColor);
    u.uBg.value.set(bg[0], bg[1], bg[2]);

    const baseAngleRad = (props.angle * Math.PI) / 180;
    const p = r.pointer;
    let targetAngle = baseAngleRad;
    if (props.cursorInteraction && p.active) {
      const dx = p.nx - 0.5;
      const dy = 0.5 - p.ny;
      const reach = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
      const perp = -Math.sin(baseAngleRad) * dx + Math.cos(baseAngleRad) * dy;
      const sign = perp >= 0 ? 1 : -1;
      const offset =
        (sign * reach * (props.cursorAngleStrength * Math.PI)) / 180;
      targetAngle = baseAngleRad + offset;
    }
    const lerp = Math.min(Math.max(props.cursorLerp, 0), 1);
    if (!p.initialized) {
      p.smoothedAngle = targetAngle;
      p.initialized = true;
    } else {
      p.smoothedAngle += (targetAngle - p.smoothedAngle) * lerp;
    }
    u.uAngleRad.value = p.smoothedAngle;

    p.click = Math.max(0, p.click - delta * props.clickBurstDecay);
    u.uClickBoost.value = 1 + p.click * (props.clickBurstStrength - 1);

    gl.setRenderTarget(null);
    gl.render(r.scene, r.cam);
  }, 1);

  return null;
};

const ChromaBlinds: React.FC<ChromaBlindsProps> = ({
  width = "100%",
  height = "100%",
  className,
  children,
  lineCount = 10,
  lineThickness = 0.3,
  lineSharpness = 0.5,
  speed = 1,
  angle = 45,
  zoom = 0.75,
  radialPulseStrength = 0.5,
  radialPulseSpeed = 0.2,
  contrast = 1.2,
  colorA = "#510679",
  colorB = "#E015B4",
  colorC = "#9CA1F2",
  backgroundColor = "#000000",
  opacity = 1,
  dpr = 1.5,
  paused = false,
  cursorInteraction = true,
  cursorAngleStrength = 5,
  cursorLerp = 0.05,
  clickBurstStrength = 1.6,
  clickBurstDecay = 2.5,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<PointerState | null>(null);

  const handlePointerReady = (state: PointerState) => {
    pointerRef.current = state;
  };

  const updatePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    const p = pointerRef.current;
    if (!el || !p) return;
    const rect = el.getBoundingClientRect();
    p.nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
    p.ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
    p.active = true;
  };

  const handlePointerLeave = () => {
    const p = pointerRef.current;
    if (!p) return;
    p.active = false;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    updatePointer(e);
    const p = pointerRef.current;
    if (!p) return;
    p.click = 1;
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
      onPointerMove={cursorInteraction ? updatePointer : undefined}
      onPointerEnter={cursorInteraction ? updatePointer : undefined}
      onPointerLeave={cursorInteraction ? handlePointerLeave : undefined}
      onPointerDown={cursorInteraction ? handlePointerDown : undefined}
    >
      <Canvas
        className="absolute inset-0"
        dpr={[1, dpr]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        orthographic
        camera={{
          position: [0, 0, 1],
          zoom: 1,
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
        }}
      >
        <BlindsPipeline
          lineCount={lineCount}
          lineThickness={lineThickness}
          lineSharpness={lineSharpness}
          speed={speed}
          angle={angle}
          zoom={zoom}
          radialPulseStrength={radialPulseStrength}
          radialPulseSpeed={radialPulseSpeed}
          contrast={contrast}
          colorA={colorA}
          colorB={colorB}
          colorC={colorC}
          backgroundColor={backgroundColor}
          opacity={opacity}
          paused={paused}
          cursorInteraction={cursorInteraction}
          cursorAngleStrength={cursorAngleStrength}
          cursorLerp={cursorLerp}
          clickBurstStrength={clickBurstStrength}
          clickBurstDecay={clickBurstDecay}
          onPointerReady={handlePointerReady}
        />
      </Canvas>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};

export default ChromaBlinds;
