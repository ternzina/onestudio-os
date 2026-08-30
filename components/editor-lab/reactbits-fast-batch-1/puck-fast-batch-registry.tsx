"use client";

import type { ReactNode } from "react";
import Circles from "@/components/react-bits/circles";
import Preloader from "@/components/react-bits/preloader";
import ClickStack from "@/components/react-bits/click-stack";
import CreditCard from "@/components/react-bits/credit-card";
import Device from "@/components/react-bits/device";
import PageFlip from "@/components/react-bits/page-flip";
import ParallaxPills from "@/components/react-bits/parallax-pills";
import GlitchText from "@/components/react-bits/glitch-text";
import { Features2 } from "@/components/blocks/features-2";
import Waitlist1 from "@/components/blocks/waitlist-1";
import SocialProof2 from "@/components/blocks/social-proof-2";
import { Showcase2 } from "@/components/blocks/showcase-2";
import FAQ3 from "@/components/blocks/faq-3";
import Stats2 from "@/components/blocks/stats-2";
import Stats3 from "@/components/blocks/stats-3";
import { Footer5 } from "@/components/blocks/footer-5";
import AppDialog1 from "@/components/blocks/app-dialog-1";
import EmptyState1 from "@/components/blocks/empty-state-1";
import Feedback1 from "@/components/blocks/feedback-1";
import Comments1 from "@/components/blocks/comments-1";
import Onboarding1 from "@/components/blocks/onboarding-1";
import CommandMenu1 from "@/components/blocks/command-menu-1";
import SettingsForm1 from "@/components/blocks/settings-form-1";
import AppDialog2 from "@/components/blocks/app-dialog-2";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "Animated Components" | "Marketing Blocks" | "Application UI";

type FastBatchBlock = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  readiness: "PUCK_RENDER_PASS";
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 1";
  batchGroup: BatchGroup;
  batchStatus: "DIRECT_RENDER_PASS" | "BLOCKED_BROWSER_RUNTIME" | "BLOCKED_REQUIRED_DATA";
};

const block = (input: Omit<FastBatchBlock, "category" | "readiness" | "defaultProps" | "fields" | "batchStatus"> & {
  defaultProps?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  batchStatus?: FastBatchBlock["batchStatus"];
}): FastBatchBlock => ({
  ...input,
  category: "React Bits Fast Batch 1",
  readiness: "PUCK_RENDER_PASS",
  defaultProps: input.defaultProps ?? {},
  fields: input.fields ?? {},
  batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
});

const componentHost: ReactBitsHostSpec = {
  profile: "flow",
  width: "content",
  height: "intrinsic",
  runtimeRisk: "dom",
};

const containedComponentHost = (intrinsicWidth: number): ReactBitsHostSpec => ({
  ...componentHost,
  responsiveFit: {
    mode: "contain",
    intrinsicWidth: { value: intrinsicWidth, provenance: "official-source" },
  },
});

const clickStackHost: ReactBitsHostSpec = {
  profile: "flow",
  width: "content",
  height: "technical-definite",
  // The official demo renders the h-full component inside a 500px preview host,
  // which contains the five-card stack and its source-defined shadows.
  technicalHeight: { value: 500, provenance: "puck-technical" },
  runtimeRisk: "dom",
};

const marketingHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  runtimeRisk: "none",
};

const appHost = (minHeight: number): ReactBitsHostSpec => ({
  profile: "app-surface",
  width: "full",
  height: "source-min",
  sourceMinHeight: { value: minHeight, provenance: "official-source" },
  overflow: "source",
  runtimeRisk: "none",
});

const animatedBlocks = [
  // Official source emits a hydration mismatch in the direct Next route; Fast Mode records the blocker instead of rewriting it.
  block({ type: "RB_batch1_circles", displayName: "React Bits Circles", catalogKey: "component:circles", description: "Official React Bits Circles.", component: Circles as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: componentHost, batchStatus: "BLOCKED_BROWSER_RUNTIME" }),
  // Official source requires loading with no official default/demo value in the registry item.
  block({ type: "RB_batch1_preloader", displayName: "React Bits Preloader", catalogKey: "component:preloader", description: "Official React Bits Preloader.", component: Preloader as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: componentHost, batchStatus: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch1_click_stack", displayName: "React Bits Click Stack", catalogKey: "component:click-stack", description: "Official React Bits Click Stack.", component: ClickStack as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: clickStackHost }),
  block({ type: "RB_batch1_credit_card", displayName: "React Bits Credit Card", catalogKey: "component:credit-card", description: "Official React Bits Credit Card.", component: CreditCard as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: containedComponentHost(384) }),
  block({ type: "RB_batch1_device", displayName: "React Bits Device", catalogKey: "component:device", description: "Official React Bits Device.", component: Device as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: containedComponentHost(574) }),
  block({ type: "RB_batch1_page_flip", displayName: "React Bits Page Flip", catalogKey: "component:page-flip", description: "Official React Bits Page Flip.", component: PageFlip as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: componentHost }),
  // Official source emits a hydration mismatch in the direct Next route; Fast Mode records the blocker instead of rewriting it.
  block({ type: "RB_batch1_parallax_pills", displayName: "React Bits Parallax Pills", catalogKey: "component:parallax-pills", description: "Official React Bits Parallax Pills.", component: ParallaxPills as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: componentHost, batchStatus: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch1_glitch_text", displayName: "React Bits Glitch Text", catalogKey: "component:glitch-text", description: "Official React Bits Glitch Text.", component: GlitchText as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 1", "Animated Component"], batchGroup: "Animated Components", host: { profile: "canvas", width: "full", height: "technical-definite", technicalHeight: { value: 320, provenance: "puck-technical" }, overflow: "clip", runtimeRisk: "dom" }, defaultProps: { text: "Glitch Text" }, fields: { text: fields.text("Text", { contentEditable: false }) } }),
];

const marketingBlocks = [
  block({ type: "RB_batch1_features_2", displayName: "React Bits Features 2", catalogKey: "pro-block:features-2", description: "Official React Bits Features 2.", component: Features2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_waitlist_1", displayName: "React Bits Waitlist 1", catalogKey: "pro-block:waitlist-1", description: "Official React Bits Waitlist 1.", component: Waitlist1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_social_proof_2", displayName: "React Bits Social Proof 2", catalogKey: "pro-block:social-proof-2", description: "Official React Bits Social Proof 2.", component: SocialProof2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_showcase_2", displayName: "React Bits Showcase 2", catalogKey: "pro-block:showcase-2", description: "Official React Bits Showcase 2.", component: Showcase2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_faq_3", displayName: "React Bits FAQ 3", catalogKey: "pro-block:faq-3", description: "Official React Bits FAQ 3.", component: FAQ3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_stats_2", displayName: "React Bits Stats 2", catalogKey: "pro-block:stats-2", description: "Official React Bits Stats 2.", component: Stats2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_stats_3", displayName: "React Bits Stats 3", catalogKey: "pro-block:stats-3", description: "Official React Bits Stats 3.", component: Stats3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch1_footer_5", displayName: "React Bits Footer 5", catalogKey: "pro-block:footer-5", description: "Official React Bits Footer 5.", component: Footer5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
];

const appBlocks = [
  block({ type: "RB_batch1_app_dialog_1", displayName: "React Bits App Dialog 1", catalogKey: "pro-block:app-dialog-1", description: "Official React Bits App Dialog 1.", component: AppDialog1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch1_empty_state_1", displayName: "React Bits Empty State 1", catalogKey: "pro-block:empty-state-1", description: "Official React Bits Empty State 1.", component: EmptyState1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch1_feedback_1", displayName: "React Bits Feedback 1", catalogKey: "pro-block:feedback-1", description: "Official React Bits Feedback 1.", component: Feedback1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch1_comments_1", displayName: "React Bits Comments 1", catalogKey: "pro-block:comments-1", description: "Official React Bits Comments 1.", component: Comments1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch1_onboarding_1", displayName: "React Bits Onboarding 1", catalogKey: "pro-block:onboarding-1", description: "Official React Bits Onboarding 1.", component: Onboarding1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch1_command_menu_1", displayName: "React Bits Command Menu 1", catalogKey: "pro-block:command-menu-1", description: "Official React Bits Command Menu 1.", component: CommandMenu1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch1_settings_form_1", displayName: "React Bits Settings Form 1", catalogKey: "pro-block:settings-form-1", description: "Official React Bits Settings Form 1.", component: SettingsForm1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(800) }),
  block({ type: "RB_batch1_app_dialog_2", displayName: "React Bits App Dialog 2", catalogKey: "pro-block:app-dialog-2", description: "Official React Bits App Dialog 2.", component: AppDialog2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 1", "Application UI"], batchGroup: "Application UI", host: appHost(480) }),
];

export const fastBatch1Blocks = [...animatedBlocks, ...marketingBlocks, ...appBlocks];
export const fastBatch1PuckBlocks = fastBatch1Blocks.filter(
  (entry) => entry.batchStatus === "DIRECT_RENDER_PASS",
);
export const fastBatch1Components = Object.fromEntries(fastBatch1PuckBlocks.map((entry) => [
  entry.type,
  entry.sourceKind === "pro-block"
    ? createMarketingPuckComponent(entry as never)
    : createPuckComponent(entry as never, { showLabLabel: false }),
]));
export const fastBatch1Categories = {
  fastBatch1: {
    title: "React Bits Fast Batch 1",
    defaultExpanded: false,
    components: fastBatch1PuckBlocks.map((entry) => entry.type),
  },
};
