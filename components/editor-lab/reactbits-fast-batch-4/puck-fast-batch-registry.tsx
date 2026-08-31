"use client";

import type { ReactNode } from "react";
import ThreeDLetterSwap from "@/components/react-bits/3d-letter-swap";
import ComparisonSlider from "@/components/react-bits/comparison-slider";
import DraggableGrid from "@/components/react-bits/draggable-grid";
import ParallaxCards from "@/components/react-bits/parallax-cards";
import ScrollStack from "@/components/react-bits/scroll-stack";
import SimpleGraph from "@/components/react-bits/simple-graph";
import StaggeredText from "@/components/react-bits/staggered-text";
import TextPath from "@/components/react-bits/text-path";
import Features6 from "@/components/blocks/features-6";
import Features7 from "@/components/blocks/features-7";
import HowItWorks5 from "@/components/blocks/how-it-works-5";
import Showcase8 from "@/components/blocks/showcase-8";
import SocialProof8 from "@/components/blocks/social-proof-8";
import FAQ7 from "@/components/blocks/faq-7";
import Stats6 from "@/components/blocks/stats-6";
import AdaptedWaitlist3, { waitlist3ContentDefaults } from "@/components/editor-lab/adapted/waitlist-3";
import AppDialog5 from "@/components/blocks/app-dialog-5";
import Comments3 from "@/components/blocks/comments-3";
import EmptyState5 from "@/components/blocks/empty-state-5";
import Feedback4 from "@/components/blocks/feedback-4";
import List4 from "@/components/blocks/list-4";
import Mobile4 from "@/components/blocks/mobile-4";
import Notifications4 from "@/components/blocks/notifications-4";
import Support4 from "@/components/blocks/support-4";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { bindFormContentContract, defineFormContentContract, type FormContentContract } from "@/components/editor-lab/puck/form-content-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "Animated Components" | "Marketing Blocks" | "Application UI";
type BatchStatus = "DIRECT_RENDER_PASS" | "BLOCKED_REQUIRED_DATA";

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
  formContent?: FormContentContract;
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 4";
  batchGroup: BatchGroup;
  batchStatus: BatchStatus;
  blocker?: string;
};

const block = (input: Omit<FastBatchBlock, "category" | "defaultProps" | "fields" | "batchStatus"> & {
  defaultProps?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  batchStatus?: BatchStatus;
  blocker?: string;
}): FastBatchBlock => {
  const boundFormContent = bindFormContentContract(
    input.formContent,
    input.fields ?? {},
    input.defaultProps ?? {},
  );
  return {
    ...input,
    category: "React Bits Fast Batch 4",
    defaultProps: boundFormContent.defaults,
    fields: boundFormContent.fields,
    batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
  };
};

const waitlist3FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Heading", type: "text", defaultValue: waitlist3ContentDefaults.heading },
    { slot: "description", label: "Description", type: "textarea", defaultValue: waitlist3ContentDefaults.description },
    { slot: "emailPlaceholder", label: "Email placeholder", type: "text", defaultValue: waitlist3ContentDefaults.emailPlaceholder },
    { slot: "buttonLabel", label: "Submit button label", type: "text", defaultValue: waitlist3ContentDefaults.buttonLabel },
    { slot: "submittingLabel", label: "Submitting label", type: "text", defaultValue: waitlist3ContentDefaults.submittingLabel },
  ],
});

const technicalHost = (height: number): ReactBitsHostSpec => ({ profile: "canvas", width: "full", height: "technical-definite", technicalHeight: { value: height, provenance: "puck-technical" }, runtimeRisk: "dom" });
const scrollHost: ReactBitsHostSpec = { profile: "flow", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "resize-observer" };
const marketingHost: ReactBitsHostSpec = { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" };
const appHost = (minHeight: number): ReactBitsHostSpec => ({ profile: "app-surface", width: "full", height: "source-min", sourceMinHeight: { value: minHeight, provenance: "official-source" }, overflow: "source", runtimeRisk: "none" });

const animatedBlocks = [
  block({ type: "RB_batch4_3d_letter_swap", displayName: "React Bits 3D Letter Swap", catalogKey: "component:3d-letter-swap", description: "Official React Bits 3D Letter Swap.", component: ThreeDLetterSwap as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(360), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_comparison_slider", displayName: "React Bits Comparison Slider", catalogKey: "component:comparison-slider", description: "Official React Bits Comparison Slider.", component: ComparisonSlider as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(480), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_draggable_grid", displayName: "React Bits Draggable Grid", catalogKey: "component:draggable-grid", description: "Official React Bits Draggable Grid.", component: DraggableGrid as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(600), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_parallax_cards", displayName: "React Bits Parallax Cards", catalogKey: "component:parallax-cards", description: "Official React Bits Parallax Cards.", component: ParallaxCards as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(600), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_scroll_stack", displayName: "React Bits Scroll Stack", catalogKey: "component:scroll-stack", description: "Official React Bits Scroll Stack.", component: ScrollStack as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: scrollHost }),
  block({ type: "RB_batch4_simple_graph", displayName: "React Bits Simple Graph", catalogKey: "component:simple-graph", description: "Official React Bits Simple Graph.", component: SimpleGraph as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(360), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_staggered_text", displayName: "React Bits Staggered Text", catalogKey: "component:staggered-text", description: "Official React Bits Staggered Text.", component: StaggeredText as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(320), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_text_path", displayName: "React Bits Text Path", catalogKey: "component:text-path", description: "Official React Bits Text Path.", component: TextPath as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 4", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(360), batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
];

const marketingBlocks = [
  block({ type: "RB_batch4_features_6", displayName: "React Bits Features 6", catalogKey: "pro-block:features-6", description: "Official React Bits Features 6.", component: Features6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  // The official registry only supplies a missing /svg/placeholder.svg path; no usable official media value is available.
  block({ type: "RB_batch4_features_7", displayName: "React Bits Features 7", catalogKey: "pro-block:features-7", description: "Official React Bits Features 7.", component: Features7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_how_it_works_5", displayName: "React Bits How It Works 5", catalogKey: "pro-block:how-it-works-5", description: "Official React Bits How It Works 5.", component: HowItWorks5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  // The official registry only supplies a missing /svg/placeholder.svg path; no usable official media value is available.
  block({ type: "RB_batch4_showcase_8", displayName: "React Bits Showcase 8", catalogKey: "pro-block:showcase-8", description: "Official React Bits Showcase 8.", component: Showcase8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_DATA", blocker: "BLOCKED_REQUIRED_DATA" }),
  block({ type: "RB_batch4_social_proof_8", displayName: "React Bits Social Proof 8", catalogKey: "pro-block:social-proof-8", description: "Official React Bits Social Proof 8.", component: SocialProof8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch4_faq_7", displayName: "React Bits FAQ 7", catalogKey: "pro-block:faq-7", description: "Official React Bits FAQ 7.", component: FAQ7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch4_stats_6", displayName: "React Bits Stats 6", catalogKey: "pro-block:stats-6", description: "Official React Bits Stats 6.", component: Stats6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch4_waitlist_3", displayName: "React Bits Waitlist 3", catalogKey: "pro-block:waitlist-3", description: "Official React Bits Waitlist 3.", component: AdaptedWaitlist3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost, formContent: waitlist3FormContent }),
];

const appBlocks = [
  block({ type: "RB_batch4_app_dialog_5", displayName: "React Bits App Dialog 5", catalogKey: "pro-block:app-dialog-5", description: "Official React Bits App Dialog 5.", component: AppDialog5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch4_comments_3", displayName: "React Bits Comments 3", catalogKey: "pro-block:comments-3", description: "Official React Bits Comments 3.", component: Comments3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch4_empty_state_5", displayName: "React Bits Empty State 5", catalogKey: "pro-block:empty-state-5", description: "Official React Bits Empty State 5.", component: EmptyState5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch4_feedback_4", displayName: "React Bits Feedback 4", catalogKey: "pro-block:feedback-4", description: "Official React Bits Feedback 4.", component: Feedback4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch4_list_4", displayName: "React Bits List 4", catalogKey: "pro-block:list-4", description: "Official React Bits List 4.", component: List4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch4_mobile_4", displayName: "React Bits Mobile 4", catalogKey: "pro-block:mobile-4", description: "Official React Bits Mobile 4.", component: Mobile4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(680) }),
  block({ type: "RB_batch4_notifications_4", displayName: "React Bits Notifications 4", catalogKey: "pro-block:notifications-4", description: "Official React Bits Notifications 4.", component: Notifications4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(620) }),
  block({ type: "RB_batch4_support_4", displayName: "React Bits Support 4", catalogKey: "pro-block:support-4", description: "Official React Bits Support 4.", component: Support4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 4", "Application UI"], batchGroup: "Application UI", host: appHost(800) }),
];

export const fastBatch4Blocks = [...animatedBlocks, ...marketingBlocks, ...appBlocks];
export const fastBatch4PuckBlocks = fastBatch4Blocks.filter((entry) => entry.batchStatus === "DIRECT_RENDER_PASS");
export const fastBatch4Components = Object.fromEntries(fastBatch4PuckBlocks.map((entry) => [entry.type, entry.sourceKind === "pro-block" ? createMarketingPuckComponent(entry as never) : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false })]));
export const fastBatch4Categories = { fastBatch4: { title: "React Bits Fast Batch 4", defaultExpanded: false, components: fastBatch4PuckBlocks.map((entry) => entry.type) } };
