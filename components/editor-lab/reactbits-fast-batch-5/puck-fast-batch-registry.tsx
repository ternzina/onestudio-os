"use client";

import type { ReactNode } from "react";
import MagicTransform from "@/components/react-bits/magic-transform";
import Flicker from "@/components/react-bits/flicker";
import NeonReveal from "@/components/react-bits/neon-reveal";
import CircleStack from "@/components/react-bits/circle-stack";
import ShaderWaves from "@/components/react-bits/shader-waves";
import DitherWave from "@/components/react-bits/dither-wave";
import RadialLiquid from "@/components/react-bits/radial-liquid";
import ChromaWaves from "@/components/react-bits/chroma-waves";
import FAQ8 from "@/components/blocks/faq-8";
import FAQ9 from "@/components/blocks/faq-9";
import Stats7 from "@/components/blocks/stats-7";
import Stats8 from "@/components/blocks/stats-8";
import Features8 from "@/components/blocks/features-8";
import Features9 from "@/components/blocks/features-9";
import { Features11 } from "@/components/blocks/features-11";
import { Features12 } from "@/components/blocks/features-12";
import CommandMenu2 from "@/components/blocks/command-menu-2";
import CommandMenu3 from "@/components/blocks/command-menu-3";
import Comments4 from "@/components/blocks/comments-4";
import Comments5 from "@/components/blocks/comments-5";
import Notifications5 from "@/components/blocks/notifications-5";
import Notifications6 from "@/components/blocks/notifications-6";
import Support5 from "@/components/blocks/support-5";
import AppDialog6 from "@/components/blocks/app-dialog-6";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { defineVisualControls, type VisualControlContract } from "@/components/editor-lab/puck/visual-control-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "Animated Components" | "Marketing Blocks" | "Application UI";
type BatchStatus = "DIRECT_RENDER_PASS" | "BLOCKED_BROWSER_RUNTIME";

type FastBatchBlock = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  visualControls?: readonly VisualControlContract[];
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 5";
  batchGroup: BatchGroup;
  batchStatus: BatchStatus;
  blocker?: string;
};

const block = (input: Omit<FastBatchBlock, "category" | "defaultProps" | "fields" | "batchStatus"> & {
  defaultProps?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  batchStatus?: BatchStatus;
  blocker?: string;
}): FastBatchBlock => ({
  ...input,
  category: "React Bits Fast Batch 5",
  defaultProps: input.defaultProps ?? {},
  fields: input.fields ?? {},
  batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
});

// These source-default scenes have no scroll runway. 480px is a technical Puck
// viewport, not a visual substitute for source content.
const sceneHost: ReactBitsHostSpec = {
  profile: "canvas",
  width: "full",
  height: "technical-definite",
  technicalHeight: { value: 480, provenance: "puck-technical" },
  runtimeRisk: "dom",
};
const marketingHost: ReactBitsHostSpec = { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" };
const appHost = (minHeight: number): ReactBitsHostSpec => ({ profile: "app-surface", width: "full", height: "source-min", sourceMinHeight: { value: minHeight, provenance: "official-source" }, overflow: "source", runtimeRisk: "none" });

const animatedBlocks = [
  block({ type: "RB_batch5_magic_transform", displayName: "React Bits Magic Transform", catalogKey: "starter:magic-transform-tw", description: "Official React Bits Magic Transform.", component: MagicTransform as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, visualControls: defineVisualControls([
    { prop: "axisColor", label: "Axis color", kind: "color", group: "Appearance", defaultValue: "#7C3AED", provenance: "official-source" },
    { prop: "paused", label: "Paused", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
    { prop: "documentDuration", label: "Document duration", kind: "number", presentation: "number", step: 0.1, unit: "s", group: "Behavior", defaultValue: 4, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch5_flicker", displayName: "React Bits Flicker", catalogKey: "starter:flicker-tw", description: "Official React Bits Flicker.", component: Flicker as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, visualControls: defineVisualControls([
    { prop: "color", label: "Particle color", kind: "color", group: "Appearance", defaultValue: "#5A4B81", provenance: "official-source" },
    { prop: "glowColor", label: "Glow color", kind: "color", group: "Appearance", defaultValue: "#FF9FFC", provenance: "official-source" },
    { prop: "overlayColor", label: "Overlay color", kind: "color", group: "Appearance", defaultValue: "#0a0a0a", provenance: "official-source" },
    { prop: "alpha", label: "Particle opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
    { prop: "overlay", label: "Overlay opacity", kind: "number", presentation: "slider", min: 0, max: 1, step: 0.05, group: "Appearance", defaultValue: 1, provenance: "official-source" },
    { prop: "shape", label: "Particle shape", kind: "select", group: "Appearance", defaultValue: "circle", options: [{ label: "Circle", value: "circle" }, { label: "Square", value: "square" }], provenance: "official-source" },
    { prop: "jitter", label: "Jitter", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
    { prop: "mouseEffect", label: "Mouse effect", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch5_neon_reveal", displayName: "React Bits Neon Reveal", catalogKey: "starter:neon-reveal-tw", description: "Official React Bits Neon Reveal.", component: NeonReveal as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch5_circle_stack", displayName: "React Bits Circle Stack", catalogKey: "starter:circle-stack-tw", description: "Official React Bits Circle Stack.", component: CircleStack as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, visualControls: defineVisualControls([
    { prop: "surfaceColor", label: "Surface color", kind: "color", group: "Appearance", defaultValue: "#FFFFFF", provenance: "official-source" },
    { prop: "borderColor", label: "Border color", kind: "color", group: "Appearance", defaultValue: "#000000", provenance: "official-source" },
    { prop: "paused", label: "Paused", kind: "toggle", group: "Behavior", defaultValue: false, provenance: "official-source" },
    { prop: "interval", label: "Interval", kind: "number", presentation: "number", min: 0.2, step: 0.1, unit: "s", group: "Behavior", defaultValue: 4, provenance: "official-source" },
  ]) }),
  block({ type: "RB_batch5_shader_waves", displayName: "React Bits Shader Waves", catalogKey: "starter:shader-waves-tw", description: "Official React Bits Shader Waves.", component: ShaderWaves as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch5_dither_wave", displayName: "React Bits Dither Wave", catalogKey: "starter:dither-wave-tw", description: "Official React Bits Dither Wave.", component: DitherWave as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch5_radial_liquid", displayName: "React Bits Radial Liquid", catalogKey: "starter:radial-liquid-tw", description: "Official React Bits Radial Liquid.", component: RadialLiquid as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch5_chroma_waves", displayName: "React Bits Chroma Waves", catalogKey: "starter:chroma-waves-tw", description: "Official React Bits Chroma Waves.", component: ChromaWaves as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 5", "Animated Component"], batchGroup: "Animated Components", host: sceneHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
];

const marketingBlocks = [
  block({ type: "RB_batch5_faq_8", displayName: "React Bits FAQ 8", catalogKey: "pro-block:faq-8", description: "Official React Bits FAQ 8.", component: FAQ8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_faq_9", displayName: "React Bits FAQ 9", catalogKey: "pro-block:faq-9", description: "Official React Bits FAQ 9.", component: FAQ9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_stats_7", displayName: "React Bits Stats 7", catalogKey: "pro-block:stats-7", description: "Official React Bits Stats 7.", component: Stats7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_stats_8", displayName: "React Bits Stats 8", catalogKey: "pro-block:stats-8", description: "Official React Bits Stats 8.", component: Stats8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_features_8", displayName: "React Bits Features 8", catalogKey: "pro-block:features-8", description: "Official React Bits Features 8.", component: Features8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_features_9", displayName: "React Bits Features 9", catalogKey: "pro-block:features-9", description: "Official React Bits Features 9.", component: Features9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_features_11", displayName: "React Bits Features 11", catalogKey: "pro-block:features-11", description: "Official React Bits Features 11.", component: Features11 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch5_features_12", displayName: "React Bits Features 12", catalogKey: "pro-block:features-12", description: "Official React Bits Features 12.", component: Features12 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
];

const appBlocks = [
  block({ type: "RB_batch5_command_menu_2", displayName: "React Bits Command Menu 2", catalogKey: "pro-block:command-menu-2", description: "Official React Bits Command Menu 2.", component: CommandMenu2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch5_command_menu_3", displayName: "React Bits Command Menu 3", catalogKey: "pro-block:command-menu-3", description: "Official React Bits Command Menu 3.", component: CommandMenu3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch5_comments_4", displayName: "React Bits Comments 4", catalogKey: "pro-block:comments-4", description: "Official React Bits Comments 4.", component: Comments4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch5_comments_5", displayName: "React Bits Comments 5", catalogKey: "pro-block:comments-5", description: "Official React Bits Comments 5.", component: Comments5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch5_notifications_5", displayName: "React Bits Notifications 5", catalogKey: "pro-block:notifications-5", description: "Official React Bits Notifications 5.", component: Notifications5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(600) }),
  block({ type: "RB_batch5_notifications_6", displayName: "React Bits Notifications 6", catalogKey: "pro-block:notifications-6", description: "Official React Bits Notifications 6.", component: Notifications6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(600) }),
  block({ type: "RB_batch5_support_5", displayName: "React Bits Support 5", catalogKey: "pro-block:support-5", description: "Official React Bits Support 5.", component: Support5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(760) }),
  block({ type: "RB_batch5_app_dialog_6", displayName: "React Bits App Dialog 6", catalogKey: "pro-block:app-dialog-6", description: "Official React Bits App Dialog 6.", component: AppDialog6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 5", "Application UI"], batchGroup: "Application UI", host: appHost(600) }),
];

export const fastBatch5Blocks = [...animatedBlocks, ...marketingBlocks, ...appBlocks];
export const fastBatch5PuckBlocks = fastBatch5Blocks.filter((entry) => entry.batchStatus === "DIRECT_RENDER_PASS");
export const fastBatch5Components = Object.fromEntries(fastBatch5PuckBlocks.map((entry) => [entry.type, entry.sourceKind === "pro-block" ? createMarketingPuckComponent(entry as never) : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false })]));
export const fastBatch5Categories = { fastBatch5: { title: "React Bits Fast Batch 5", defaultExpanded: false, components: fastBatch5PuckBlocks.map((entry) => entry.type) } };
