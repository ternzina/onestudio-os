"use client";

import type { ReactNode } from "react";
import { Auth2 } from "@/components/blocks/auth-2";
import Ecommerce8 from "@/components/blocks/ecommerce-8";
import { Hero4 } from "@/components/blocks/hero-4";
import { Hero5 } from "@/components/blocks/hero-5";
import { Hero9 } from "@/components/blocks/hero-9";
import SocialProof10 from "@/components/blocks/social-proof-10";
import SocialProof15 from "@/components/blocks/social-proof-15";
import Waitlist4 from "@/components/blocks/waitlist-4";
import CursorWave from "@/components/react-bits/cursor-wave";
import GlueDots from "@/components/react-bits/glue-dots";
import GradientCarousel from "@/components/react-bits/gradient-carousel";
import LiquidAscii from "@/components/react-bits/liquid-ascii";
import TextCube from "@/components/react-bits/text-cube";
import Vortex from "@/components/react-bits/vortex";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { defineVisualControls, type VisualControlContract } from "@/components/editor-lab/puck/visual-control-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
export type FastBatch10Group = "CURSORS" | "GALLERIES" | "BACKGROUNDS";
export type FastBatch10Status =
  | "DIRECT_RENDER_PASS"
  | "DIRECT_RETEST"
  | "BLOCKED_REQUIRED_DATA"
  | "BLOCKED_BROWSER_RUNTIME"
  | "BLOCKED_GPU_RUNTIME"
  | "BLOCKED_PUCK_RENDER";

export type FastBatch10Block = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component?: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  visualControls?: readonly VisualControlContract[];
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 10";
  batchGroup: FastBatch10Group;
  batchStatus: FastBatch10Status;
  blocker?: Exclude<FastBatch10Status, "DIRECT_RENDER_PASS" | "DIRECT_RETEST">;
};

const block = (
  input: Omit<FastBatch10Block, "category" | "defaultProps" | "fields" | "batchStatus"> & {
    defaultProps?: Record<string, unknown>;
    batchStatus?: FastBatch10Status;
    blocker?: FastBatch10Block["blocker"];
  },
): FastBatch10Block => ({
  ...input,
  category: "React Bits Fast Batch 10",
  defaultProps: input.defaultProps ?? {},
  fields: {},
  batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
});

const canvasHost = (
  height: number,
  runtimeRisk: "dom" | "webgl" = "webgl",
): ReactBitsHostSpec => ({
  profile: "canvas",
  width: "full",
  height: "technical-definite",
  technicalHeight: { value: height, provenance: "puck-technical" },
  overflow: "clip",
  runtimeRisk,
});

const marketingHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  overflow: "source",
  runtimeRisk: "dom",
};

const cursorBlocks = [
  block({ type: "RB_batch10_dither_cursor", displayName: "React Bits Dither Cursor", catalogKey: "component:dither-cursor", description: "Official React Bits Dither Cursor.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor"], batchGroup: "CURSORS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_glass_cursor", displayName: "React Bits Glass Cursor", catalogKey: "component:glass-cursor", description: "Official React Bits Glass Cursor.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor"], batchGroup: "CURSORS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_pixel_magnet", displayName: "React Bits Pixel Magnet", catalogKey: "component:pixel-magnet", description: "Official React Bits Pixel Magnet.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor"], batchGroup: "CURSORS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_liquid_ascii", displayName: "React Bits Liquid Ascii", catalogKey: "component:liquid-ascii", description: "Official React Bits Liquid Ascii.", component: LiquidAscii as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor", "Background"], batchGroup: "CURSORS", host: canvasHost(480, "dom"), visualControls: defineVisualControls([
    { prop: "color", label: "Text color", kind: "color", group: "Appearance", defaultValue: "#ffffff", provenance: "official-source" },
    { prop: "backgroundColor", label: "Background color", kind: "color", group: "Appearance", defaultValue: "#000000", provenance: "official-source" },
    { prop: "flipRatio", label: "FLIP ratio", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Behavior", defaultValue: 0.3, provenance: "official-source" },
    { prop: "fillHeight", label: "Fill height", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 0.4, provenance: "official-source" },
    { prop: "opacity", label: "Opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
    { prop: "autoWave", label: "Auto wave", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch10_text_cube", displayName: "React Bits Text Cube", catalogKey: "component:text-cube", description: "Official React Bits Text Cube.", component: TextCube as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor", "Background"], batchGroup: "CURSORS", host: canvasHost(480, "dom"), visualControls: defineVisualControls([
    { prop: "color", label: "Text color", kind: "color", group: "Appearance", defaultValue: "#1a1a1a", provenance: "official-source" },
    { prop: "backgroundColor", label: "Background color", kind: "color", group: "Appearance", defaultValue: "#ffffff", provenance: "official-source" },
    { prop: "followSpeed", label: "Follow speed", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.01, group: "Behavior", defaultValue: 0.08, provenance: "official-source" },
    { prop: "fontWeight", label: "Font weight", kind: "number", presentation: "slider", min: 100, max: 900, step: 100, group: "Appearance", defaultValue: 100, provenance: "official-source" },
    { prop: "breathe", label: "Breathe", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Behavior", defaultValue: 0.1, provenance: "official-source" },
    { prop: "depthFade", label: "Depth fade", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 0.3, provenance: "official-source" },
    { prop: "opacity", label: "Opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch10_chroma_blinds", displayName: "React Bits Chroma Blinds", catalogKey: "component:chroma-blinds", description: "Official React Bits Chroma Blinds.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor", "Background"], batchGroup: "CURSORS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_grid_rise", displayName: "React Bits Grid Rise", catalogKey: "component:grid-rise", description: "Official React Bits Grid Rise.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor", "Background"], batchGroup: "CURSORS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_halftone_vortex", displayName: "React Bits Halftone Vortex", catalogKey: "component:halftone-vortex", description: "Official React Bits Halftone Vortex.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor", "Background"], batchGroup: "CURSORS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_cursor_wave", displayName: "React Bits Cursor Wave", catalogKey: "component:cursor-wave", description: "Batch 9 blocker passed its retest with the proven canvas host.", component: CursorWave as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor"], batchGroup: "CURSORS", host: canvasHost(480, "dom"), visualControls: defineVisualControls([
    { prop: "backgroundColor", label: "Background color", kind: "color", group: "Appearance", defaultValue: "#080808", provenance: "official-source" },
    { prop: "idleScale", label: "Idle scale", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.01, group: "Appearance", defaultValue: 0.09, provenance: "official-source" },
    { prop: "opacity", label: "Opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch10_smooth_cursor", displayName: "React Bits Smooth Cursor", catalogKey: "component:smooth-cursor", description: "Batch 9 blocker remains: the cursor stays static in the Puck interactive iframe.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Cursor"], batchGroup: "CURSORS", host: canvasHost(480, "dom"), batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER" }),
];

const galleryBlocks = [
  block({ type: "RB_batch10_infinite_gallery", displayName: "React Bits Infinite Gallery", catalogKey: "component:infinite-gallery", description: "Official React Bits Infinite Gallery; blocked because its required official demo asset returns an image-load failure.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: canvasHost(600), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch10_parallax_carousel", displayName: "React Bits Parallax Carousel", catalogKey: "component:parallax-carousel", description: "Official React Bits Parallax Carousel.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: canvasHost(600), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_lenticular_carousel", displayName: "React Bits Lenticular Carousel", catalogKey: "component:lenticular-carousel", description: "Official React Bits Lenticular Carousel.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: canvasHost(620), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_reel_gallery", displayName: "React Bits Reel Gallery", catalogKey: "component:reel-gallery", description: "Official React Bits Reel Gallery.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: canvasHost(720), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_hero_7", displayName: "React Bits Hero 7", catalogKey: "pro-block:hero-7", description: "Official React Bits Hero 7 image carousel.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: marketingHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_social_proof_10", displayName: "React Bits Social Proof 10", catalogKey: "pro-block:social-proof-10", description: "Official React Bits Social Proof 10 case-study grid.", component: SocialProof10 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Gallery", "Portfolio"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch10_social_proof_15", displayName: "React Bits Social Proof 15", catalogKey: "pro-block:social-proof-15", description: "Official React Bits Social Proof 15 rotating customer story.", component: SocialProof15 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Gallery", "Carousel"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch10_showcase_3", displayName: "React Bits Showcase 3", catalogKey: "pro-block:showcase-3", description: "Official React Bits Showcase 3 carousel.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Gallery", "Portfolio"], batchGroup: "GALLERIES", host: marketingHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_ecommerce_8", displayName: "React Bits Ecommerce 8", catalogKey: "pro-block:ecommerce-8", description: "Official React Bits Ecommerce 8 product gallery.", component: Ecommerce8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch10_gradient_carousel", displayName: "React Bits Gradient Carousel", catalogKey: "component:gradient-carousel", description: "Batch 9 blocker passed its retest with a definite gallery host.", component: GradientCarousel as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: canvasHost(620, "dom"), visualControls: defineVisualControls([
    { prop: "frictionFactor", label: "Friction", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.01, group: "Behavior", defaultValue: 0.92, provenance: "official-source" },
    { prop: "gradientSize", label: "Gradient size", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 0.65, provenance: "official-source" },
    { prop: "gradientIntensity", label: "Gradient intensity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 0.7, provenance: "official-source" },
    { prop: "enableKeyboard", label: "Keyboard navigation", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch10_hero_4", displayName: "React Bits Hero 4", catalogKey: "pro-block:hero-4", description: "Batch 9 browser-runtime blocker passed its retest.", component: Hero4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
];

const backgroundBlocks = [
  block({ type: "RB_batch10_vortex", displayName: "React Bits Vortex", catalogKey: "component:vortex", description: "Official React Bits Vortex.", component: Vortex as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: canvasHost(480, "dom"), visualControls: defineVisualControls([
    { prop: "particleColor", label: "Particle color", kind: "color", group: "Appearance", defaultValue: "#000000", provenance: "official-source" },
    { prop: "depth", label: "Depth", kind: "number", presentation: "slider", min: 0.5, max: 2, step: 0.1, group: "Appearance", defaultValue: 1.7, provenance: "official-source" },
    { prop: "centerX", label: "Horizontal center", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 0.5, provenance: "official-source" },
    { prop: "centerY", label: "Vertical center", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 0, provenance: "official-source" },
    { prop: "opacity", label: "Opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
    { prop: "enableCursorInteraction", label: "Cursor interaction", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch10_glue_dots", displayName: "React Bits Glue Dots", catalogKey: "component:glue-dots", description: "Official React Bits Glue Dots.", component: GlueDots as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: canvasHost(480, "dom"), defaultProps: { className: "h-full w-full" }, visualControls: defineVisualControls([
    { prop: "color", label: "Dot color", kind: "color", group: "Appearance", defaultValue: "#ffffff", provenance: "official-source" },
    { prop: "backgroundColor", label: "Background color", kind: "color", group: "Appearance", defaultValue: "#0a0a0a", provenance: "official-source" },
    { prop: "opacity", label: "Opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
    { prop: "merge", label: "Merge dots", kind: "toggle", group: "Appearance", defaultValue: true, provenance: "official-source" },
    { prop: "rippleOnPress", label: "Ripple on press", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "cursorInteraction", label: "Cursor interaction", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "paused", label: "Paused", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch10_blinking_squares", displayName: "React Bits Blinking Squares", catalogKey: "component:blinking-squares", description: "Official React Bits Blinking Squares.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_aurora_beam", displayName: "React Bits Aurora Beam", catalogKey: "component:aurora-beam", description: "Official React Bits Aurora Beam.", sourceKind: "component", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: canvasHost(480), batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch10_hero_9", displayName: "React Bits Hero 9", catalogKey: "pro-block:hero-9", description: "Official React Bits Hero 9 video background.", component: Hero9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost }),
  block({ type: "RB_batch10_auth_2", displayName: "React Bits Auth 2", catalogKey: "pro-block:auth-2", description: "Official React Bits Auth 2 gradient background.", component: Auth2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost }),
  block({ type: "RB_batch10_waitlist_4", displayName: "React Bits Waitlist 4", catalogKey: "pro-block:waitlist-4", description: "Official React Bits Waitlist 4 dotted-grid background.", component: Waitlist4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost }),
  block({ type: "RB_batch10_hero_5", displayName: "React Bits Hero 5", catalogKey: "pro-block:hero-5", description: "Batch 9 browser-runtime blocker passed its retest.", component: Hero5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 10", "Background", "Cursor"], batchGroup: "BACKGROUNDS", host: marketingHost }),
];

export const fastBatch10Blocks = [...cursorBlocks, ...galleryBlocks, ...backgroundBlocks];
export const fastBatch10PuckBlocks = fastBatch10Blocks.filter(
  (entry): entry is FastBatch10Block & { component: AnyComponent } =>
    !entry.batchStatus.startsWith("BLOCKED") && Boolean(entry.component),
);
export const fastBatch10Components = Object.fromEntries(
  fastBatch10PuckBlocks.map((entry) => [
    entry.type,
    entry.sourceKind === "pro-block"
      ? createMarketingPuckComponent(entry as never)
      : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false }),
  ]),
);
export const fastBatch10Categories = {
  fastBatch10: {
    title: "React Bits Fast Batch 10",
    defaultExpanded: false,
    components: fastBatch10PuckBlocks.map((entry) => entry.type),
  },
};
