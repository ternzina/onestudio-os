"use client";

import type { ReactNode } from "react";
import AnimatedList from "@/components/react-bits/animated-list";
import CenterFlow from "@/components/react-bits/center-flow";
import HoverPreview from "@/components/react-bits/hover-preview";
import DepthCard from "@/components/react-bits/depth-card";
import UserCursor from "@/components/react-bits/user-cursor";
import CustomCursor from "@/components/react-bits/custom-cursor";
import ModalCards from "@/components/react-bits/modal-cards";
import { Features4 } from "@/components/blocks/features-4";
import { Features5 } from "@/components/blocks/features-5";
import HowItWorks6 from "@/components/blocks/how-it-works-6";
import { Showcase7 } from "@/components/blocks/showcase-7";
import SocialProof7 from "@/components/blocks/social-proof-7";
import FAQ6 from "@/components/blocks/faq-6";
import Stats5 from "@/components/blocks/stats-5";
import Waitlist2 from "@/components/blocks/waitlist-2";
import AppDialog3 from "@/components/blocks/app-dialog-3";
import Comments2 from "@/components/blocks/comments-2";
import EmptyState4 from "@/components/blocks/empty-state-4";
import Feedback3 from "@/components/blocks/feedback-3";
import List3 from "@/components/blocks/list-3";
import Mobile3 from "@/components/blocks/mobile-3";
import Notifications3 from "@/components/blocks/notifications-3";
import Support3 from "@/components/blocks/support-3";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { defineVisualControls, type VisualControlContract } from "@/components/editor-lab/puck/visual-control-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "Animated Components" | "Marketing Blocks" | "Application UI";
type BatchStatus = "DIRECT_RENDER_PASS" | "BLOCKED_REQUIRED_DATA" | "BLOCKED_FIDELITY_UNPROVEN_DEMO_PRESET";

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
  category: "React Bits Fast Batch 3";
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
  category: "React Bits Fast Batch 3",
  defaultProps: input.defaultProps ?? {},
  fields: input.fields ?? {},
  batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
});

const flowHost: ReactBitsHostSpec = { profile: "flow", width: "full", height: "intrinsic", runtimeRisk: "dom" };
const technicalHost = (height: number): ReactBitsHostSpec => ({ profile: "canvas", width: "full", height: "technical-definite", technicalHeight: { value: height, provenance: "puck-technical" }, runtimeRisk: "dom" });
const marketingHost: ReactBitsHostSpec = { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" };
const appHost = (minHeight: number): ReactBitsHostSpec => ({ profile: "app-surface", width: "full", height: "source-min", sourceMinHeight: { value: minHeight, provenance: "official-source" }, overflow: "source", runtimeRisk: "none" });

const animatedBlocks = [
  // The official component has required ReactNode items and no official serializable demo default.
  block({ type: "RB_batch3_animated_list", displayName: "React Bits Animated List", catalogKey: "component:animated-list", description: "Official React Bits Animated List.", component: AnimatedList as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(600), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  // The official source defaults node surfaces to theme white/black. The lilac docs-demo preset is not supplied by the authenticated registry, so Fast Mode must not invent it.
  block({ type: "RB_batch3_center_flow", displayName: "React Bits Center Flow", catalogKey: "component:center-flow", description: "Official React Bits Center Flow.", component: CenterFlow as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(600), batchStatus: "BLOCKED_FIDELITY_UNPROVEN_DEMO_PRESET", blocker: "BLOCKED_FIDELITY_UNPROVEN_DEMO_PRESET" }),
  // The official component requires content and target records; Fast Mode does not invent them.
  block({ type: "RB_batch3_hover_preview", displayName: "React Bits Hover Preview", catalogKey: "component:hover-preview", description: "Official React Bits Hover Preview.", component: HoverPreview as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: flowHost, batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  // `title` and `image` are source-required; registry source has no official demo data to supply them.
  block({ type: "RB_batch3_depth_card", displayName: "React Bits Depth Card", catalogKey: "component:depth-card", description: "Official React Bits Depth Card.", component: DepthCard as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(420), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  // Without official children/demo content, the source root has zero height and cannot receive pointer events.
  block({ type: "RB_batch3_user_cursor", displayName: "React Bits User Cursor", catalogKey: "component:user-cursor", description: "Official React Bits User Cursor.", component: UserCursor as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(420), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  // The source relies on browser viewport state during SSR and remains static in Puck's portal/iframe realm, even in Interact mode.
  block({ type: "RB_batch3_custom_cursor", displayName: "React Bits Custom Cursor", catalogKey: "component:custom-cursor", description: "Official React Bits Custom Cursor.", component: CustomCursor as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(420), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  // The official responsive grid has intrinsic height (three stacked cards at narrow widths); a fixed technical canvas clips it.
  block({ type: "RB_batch3_modal_cards", displayName: "React Bits Modal Cards", catalogKey: "component:modal-cards", description: "Official React Bits Modal Cards.", component: ModalCards as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 3", "Animated Component"], batchGroup: "Animated Components", host: flowHost, visualControls: defineVisualControls([
    { prop: "gradientColor", label: "Gradient color", kind: "color", group: "Appearance", defaultValue: "#6366f1", provenance: "official-source" },
    { prop: "animationSpeed", label: "Animation speed", kind: "select", group: "Behavior", defaultValue: "normal", options: [{ label: "Slow", value: "slow" }, { label: "Normal", value: "normal" }, { label: "Fast", value: "fast" }, { label: "None", value: "none" }], provenance: "official-source" },
    { prop: "animationVariant", label: "Animation variant", kind: "select", group: "Behavior", defaultValue: "scale", options: [{ label: "Scale", value: "scale" }, { label: "Fade", value: "fade" }, { label: "Slide", value: "slide" }], provenance: "official-source" },
    { prop: "closeOnBackdropClick", label: "Close on backdrop click", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "closeOnEscape", label: "Close on Escape", kind: "toggle", group: "Behavior", defaultValue: true, provenance: "official-source" },
    { prop: "showCloseButton", label: "Show close button", kind: "toggle", group: "Appearance", defaultValue: true, provenance: "official-source" },
  ]) }),
];

const marketingBlocks = [
  block({ type: "RB_batch3_features_4", displayName: "React Bits Features 4", catalogKey: "pro-block:features-4", description: "Official React Bits Features 4.", component: Features4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch3_features_5", displayName: "React Bits Features 5", catalogKey: "pro-block:features-5", description: "Official React Bits Features 5.", component: Features5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch3_how_it_works_6", displayName: "React Bits How It Works 6", catalogKey: "pro-block:how-it-works-6", description: "Official React Bits How It Works 6.", component: HowItWorks6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  // The authenticated official manifest references /svg/placeholder.svg but ships no corresponding asset or demo value.
  block({ type: "RB_batch3_showcase_7", displayName: "React Bits Showcase 7", catalogKey: "pro-block:showcase-7", description: "Official React Bits Showcase 7.", component: Showcase7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_ASSET" }),
  // The authenticated official manifest references eight /mock-logos files but ships none of them.
  block({ type: "RB_batch3_social_proof_7", displayName: "React Bits Social Proof 7", catalogKey: "pro-block:social-proof-7", description: "Official React Bits Social Proof 7.", component: SocialProof7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_ASSET" }),
  block({ type: "RB_batch3_faq_6", displayName: "React Bits FAQ 6", catalogKey: "pro-block:faq-6", description: "Official React Bits FAQ 6.", component: FAQ6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  // The authenticated official manifest references /svg/world-map.svg but ships no corresponding asset or demo value.
  block({ type: "RB_batch3_stats_5", displayName: "React Bits Stats 5", catalogKey: "pro-block:stats-5", description: "Official React Bits Stats 5.", component: Stats5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_ASSET" }),
  block({ type: "RB_batch3_waitlist_2", displayName: "React Bits Waitlist 2", catalogKey: "pro-block:waitlist-2", description: "Official React Bits Waitlist 2.", component: Waitlist2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
];

const appBlocks = [
  block({ type: "RB_batch3_app_dialog_3", displayName: "React Bits App Dialog 3", catalogKey: "pro-block:app-dialog-3", description: "Official React Bits App Dialog 3.", component: AppDialog3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch3_comments_2", displayName: "React Bits Comments 2", catalogKey: "pro-block:comments-2", description: "Official React Bits Comments 2.", component: Comments2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch3_empty_state_4", displayName: "React Bits Empty State 4", catalogKey: "pro-block:empty-state-4", description: "Official React Bits Empty State 4.", component: EmptyState4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch3_feedback_3", displayName: "React Bits Feedback 3", catalogKey: "pro-block:feedback-3", description: "Official React Bits Feedback 3.", component: Feedback3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch3_list_3", displayName: "React Bits List 3", catalogKey: "pro-block:list-3", description: "Official React Bits List 3.", component: List3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch3_mobile_3", displayName: "React Bits Mobile 3", catalogKey: "pro-block:mobile-3", description: "Official React Bits Mobile 3.", component: Mobile3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(680) }),
  block({ type: "RB_batch3_notifications_3", displayName: "React Bits Notifications 3", catalogKey: "pro-block:notifications-3", description: "Official React Bits Notifications 3.", component: Notifications3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(620) }),
  block({ type: "RB_batch3_support_3", displayName: "React Bits Support 3", catalogKey: "pro-block:support-3", description: "Official React Bits Support 3.", component: Support3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 3", "Application UI"], batchGroup: "Application UI", host: appHost(800) }),
];

export const fastBatch3Blocks = [...animatedBlocks, ...marketingBlocks, ...appBlocks];
export const fastBatch3PuckBlocks = fastBatch3Blocks.filter((entry) => entry.batchStatus === "DIRECT_RENDER_PASS");
export const fastBatch3Components = Object.fromEntries(fastBatch3PuckBlocks.map((entry) => [entry.type, entry.sourceKind === "pro-block" ? createMarketingPuckComponent(entry as never) : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false })]));
export const fastBatch3Categories = { fastBatch3: { title: "React Bits Fast Batch 3", defaultExpanded: false, components: fastBatch3PuckBlocks.map((entry) => entry.type) } };
