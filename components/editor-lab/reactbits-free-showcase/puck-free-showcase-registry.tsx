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

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type Block = { type: string; displayName: string; catalogKey: string; description: string; component: AnyComponent; sourceKind: "component"; sourceTier: "FREE"; sourceProvenance: "REGISTRY"; tags: readonly string[]; defaultProps: Record<string, unknown>; fields: Record<string, unknown>; host: ReactBitsHostSpec; category: "React Bits Free Showcase"; readiness: "READY" };
const host: ReactBitsHostSpec = { profile: "canvas", width: "full", height: "technical-definite", technicalHeight: { value: 480, provenance: "puck-technical" }, overflow: "clip", runtimeRisk: "webgl" };
const block = (type: string, displayName: string, catalogKey: string, component: AnyComponent): Block => ({ type, displayName, catalogKey, component, description: `Official React Bits ${displayName} free component.`, sourceKind: "component", sourceTier: "FREE", sourceProvenance: "REGISTRY", tags: ["React Bits Free Showcase", "FREE", "REGISTRY"], defaultProps: {}, fields: {}, host, category: "React Bits Free Showcase", readiness: "READY" });
export const freeShowcaseBlocks = [
  block("RB_free_glow_cursor", "Glow Cursor", "current-free:glow-cursor", GlowCursor as unknown as AnyComponent),
  block("RB_free_particle_text", "Particle Text", "current-free:particle-text", ParticleText as unknown as AnyComponent),
  block("RB_free_magic_rings", "Magic Rings", "current-free:magic-rings", MagicRings as unknown as AnyComponent),
  block("RB_free_strands", "Strands", "current-free:strands", Strands as unknown as AnyComponent),
  block("RB_free_splash_cursor", "Splash Cursor", "current-free:splash-cursor", SplashCursor as unknown as AnyComponent),
  block("RB_free_floating_lines", "Floating Lines", "current-free:floating-lines", FloatingLines as unknown as AnyComponent),
];
export const freeShowcaseComponents = Object.fromEntries(freeShowcaseBlocks.map((entry) => [entry.type, createPuckComponent(entry as never, { showLabLabel: false })]));
export const freeShowcaseCategories = { freeShowcase: { title: "React Bits Free Showcase", defaultExpanded: false, components: freeShowcaseBlocks.map((entry) => entry.type) } };
