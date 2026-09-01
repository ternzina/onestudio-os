"use client";

import type { ReactNode } from "react";
import FloatingLines from "@/components/react-bits/FloatingLines";
import GlowCursor from "@/components/react-bits/GlowCursor";
import MagicRings from "@/components/react-bits/MagicRings";
import ParticleText from "@/components/react-bits/ParticleText";
import SplashCursor from "@/components/react-bits/SplashCursor";
import Strands from "@/components/react-bits/Strands";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { defineVisualControls, type VisualControlContract } from "@/components/editor-lab/puck/visual-control-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type Block = { type: string; displayName: string; catalogKey: string; description: string; component: AnyComponent; sourceKind: "component"; sourceTier: "FREE"; sourceProvenance: "REGISTRY"; tags: readonly string[]; defaultProps: Record<string, unknown>; fields: Record<string, unknown>; visualControls: readonly VisualControlContract[]; host: ReactBitsHostSpec; category: "React Bits Free Showcase"; readiness: "READY" };
const host: ReactBitsHostSpec = { profile: "canvas", width: "full", height: "technical-definite", technicalHeight: { value: 480, provenance: "puck-technical" }, overflow: "clip", surfaceBackground: { value: "#000000", provenance: "official-demo" }, runtimeRisk: "webgl" };
const block = (type: string, displayName: string, catalogKey: string, component: AnyComponent, visualControls: readonly VisualControlContract[]): Block => ({ type, displayName, catalogKey, component, description: `Official React Bits ${displayName} free component.`, sourceKind: "component", sourceTier: "FREE", sourceProvenance: "REGISTRY", tags: ["React Bits Free Showcase", "FREE", "REGISTRY"], defaultProps: {}, fields: {}, visualControls, host, category: "React Bits Free Showcase", readiness: "READY" });
export const freeShowcaseBlocks = [
  block("RB_free_glow_cursor", "Glow Cursor", "current-free:glow-cursor", GlowCursor as unknown as AnyComponent, defineVisualControls([
    { prop: "color", label: "Color", kind: "color", group: "Appearance", defaultValue: "#67E8F9", provenance: "official-source" },
    { prop: "secondaryColor", label: "Secondary color", kind: "color", group: "Appearance", defaultValue: "#A78BFA", provenance: "official-source" },
    { prop: "trailLength", label: "Trail length", kind: "number", presentation: "slider", min: 2, max: 64, step: 1, unit: "count", group: "Behavior", defaultValue: 40, provenance: "official-source" },
    { prop: "trailWidth", label: "Trail width", kind: "number", presentation: "number", min: 0.1, step: 0.1, unit: "px", group: "Appearance", defaultValue: 8, provenance: "official-source" },
    { prop: "followSpeed", label: "Follow speed", kind: "number", presentation: "slider", min: 0.01, max: 0.99, step: 0.01, group: "Behavior", defaultValue: 0.16, provenance: "official-source" },
    { prop: "opacity", label: "Opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
    { prop: "pulseSpeed", label: "Pulse speed", kind: "number", presentation: "number", step: 0.1, group: "Behavior", defaultValue: 1.1, provenance: "official-source" },
    { prop: "idleFade", label: "Idle fade", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "blendMode", label: "Blend mode", kind: "select", group: "Appearance", defaultValue: "screen", options: [{ label: "Screen", value: "screen" }, { label: "Normal", value: "normal" }, { label: "Plus lighter", value: "plus-lighter" }], provenance: "official-source" },
    { prop: "enabled", label: "Enabled", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
  ])),
  block("RB_free_particle_text", "Particle Text", "current-free:particle-text", ParticleText as unknown as AnyComponent, defineVisualControls([
    { prop: "particleSize", label: "Particle size", kind: "number", presentation: "number", min: 0.6, step: 0.1, unit: "px", group: "Appearance", defaultValue: 2, provenance: "official-source" },
    { prop: "density", label: "Density", kind: "number", presentation: "number", min: 2, step: 1, unit: "count", group: "Appearance", defaultValue: 4, provenance: "official-source" },
    { prop: "color", label: "Color", kind: "color", group: "Appearance", defaultValue: "#ffffff", provenance: "official-source" },
    { prop: "highlightColor", label: "Highlight color", kind: "color", group: "Appearance", defaultValue: "#8b5cf6", provenance: "official-source" },
    { prop: "gatherDuration", label: "Gather duration", kind: "number", presentation: "number", min: 1, step: 100, unit: "ms", group: "Behavior", defaultValue: 1600, provenance: "official-source" },
    { prop: "trigger", label: "Trigger", kind: "select", group: "Behavior", defaultValue: "mount", options: [{ label: "Mount", value: "mount" }, { label: "Hover", value: "hover" }, { label: "Click", value: "click" }], provenance: "official-source" },
    { prop: "glow", label: "Glow", kind: "toggle", group: "Appearance", defaultValue: true, provenance: "official-source" },
  ])),
  block("RB_free_magic_rings", "Magic Rings", "current-free:magic-rings", MagicRings as unknown as AnyComponent, defineVisualControls([
    { prop: "color", label: "Color", kind: "color", group: "Appearance", defaultValue: "#fc42ff", provenance: "official-source" },
    { prop: "colorTwo", label: "Secondary color", kind: "color", group: "Appearance", defaultValue: "#42fcff", provenance: "official-source" },
    { prop: "followMouse", label: "Follow mouse", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
    { prop: "clickBurst", label: "Click burst", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
    { prop: "alphaMode", label: "Alpha mode", kind: "select", group: "Appearance", defaultValue: "luminance", options: [{ label: "Luminance", value: "luminance" }, { label: "Coverage", value: "coverage" }], provenance: "official-source" },
  ])),
  block("RB_free_strands", "Strands", "current-free:strands", Strands as unknown as AnyComponent, defineVisualControls([
    { prop: "colors", label: "Strand colors", kind: "colorArray", group: "Appearance", defaultValue: ["#FF4242", "#7C3AED", "#06B6D4", "#EAB308"], itemLabels: ["Color 1", "Color 2", "Color 3", "Color 4"], provenance: "official-source" },
    { prop: "count", label: "Strand count", kind: "number", presentation: "slider", min: 1, max: 12, step: 1, unit: "count", group: "Appearance", defaultValue: 3, provenance: "official-source" },
    { prop: "glass", label: "Glass", kind: "toggle", group: "Appearance", defaultValue: false, provenance: "official-source" },
  ])),
  block("RB_free_splash_cursor", "Splash Cursor", "current-free:splash-cursor", SplashCursor as unknown as AnyComponent, defineVisualControls([
    { prop: "COLOR", label: "Color", kind: "color", group: "Appearance", defaultValue: "#ff0000", provenance: "official-source" },
    { prop: "RAINBOW_MODE", label: "Rainbow mode", kind: "toggle", group: "Appearance", defaultValue: true, provenance: "official-source" },
    { prop: "TRANSPARENT", label: "Transparent background", kind: "toggle", group: "Appearance", defaultValue: true, provenance: "official-source" },
    { prop: "SHADING", label: "Shading", kind: "toggle", group: "Appearance", defaultValue: true, provenance: "official-source" },
  ])),
  block("RB_free_floating_lines", "Floating Lines", "current-free:floating-lines", FloatingLines as unknown as AnyComponent, defineVisualControls([
    { prop: "backgroundColor", label: "Background color", kind: "color", group: "Appearance", defaultValue: "#000000", provenance: "official-source" },
    { prop: "interactive", label: "Interactive", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "parallax", label: "Parallax", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "lightMode", label: "Light mode", kind: "toggle", group: "Appearance", defaultValue: false, provenance: "official-source" },
    { prop: "mixBlendMode", label: "Blend mode", kind: "select", group: "Appearance", defaultValue: "screen", options: [{ label: "Screen", value: "screen" }, { label: "Normal", value: "normal" }, { label: "Multiply", value: "multiply" }], provenance: "official-source" },
  ])),
];
export const freeShowcaseComponents = Object.fromEntries(freeShowcaseBlocks.map((entry) => [entry.type, createPuckComponent(entry as never, { showLabLabel: false })]));
export const freeShowcaseCategories = { freeShowcase: { title: "React Bits Free Showcase", defaultExpanded: false, components: freeShowcaseBlocks.map((entry) => entry.type) } };
