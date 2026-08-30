"use client";

import type { ReactNode } from "react";
import ThreeDTextReveal from "@/components/react-bits/3d-text-reveal";
import BendingMarquee from "@/components/react-bits/bending-marquee";
import CardSpread from "@/components/react-bits/card-spread";
import CircleGallery from "@/components/react-bits/circle-gallery";
import SkewedCarousel from "@/components/react-bits/skewed-carousel";
import SpeedingText from "@/components/react-bits/speeding-text";
import TiltedTiles from "@/components/react-bits/tilted-tiles";
import TumbleCarousel from "@/components/react-bits/tumble-carousel";
import SocialProof4 from "@/components/blocks/social-proof-4";
import Faq5 from "@/components/blocks/faq-5";
import Stats4 from "@/components/blocks/stats-4";
import About8 from "@/components/blocks/about-8";
import HowItWorks8 from "@/components/blocks/how-it-works-8";
import Showcase6 from "@/components/blocks/showcase-6";
import SocialProof5 from "@/components/blocks/social-proof-5";
import About9 from "@/components/blocks/about-9";
import AppDialog4 from "@/components/blocks/app-dialog-4";
import EmptyState2 from "@/components/blocks/empty-state-2";
import Feedback2 from "@/components/blocks/feedback-2";
import Onboarding2 from "@/components/blocks/onboarding-2";
import Notifications2 from "@/components/blocks/notifications-2";
import Support2 from "@/components/blocks/support-2";
import List2 from "@/components/blocks/list-2";
import Mobile2 from "@/components/blocks/mobile-2";
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
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 2";
  batchGroup: BatchGroup;
  batchStatus: "DIRECT_RENDER_PASS" | "BLOCKED_PUCK_RENDER";
};

const block = (input: Omit<FastBatchBlock, "category" | "defaultProps" | "fields" | "batchStatus"> & {
  defaultProps?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  batchStatus?: FastBatchBlock["batchStatus"];
}): FastBatchBlock => ({
  ...input,
  category: "React Bits Fast Batch 2",
  defaultProps: input.defaultProps ?? {},
  fields: input.fields ?? {},
  batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
});

const flowHost: ReactBitsHostSpec = {
  profile: "flow",
  width: "full",
  height: "intrinsic",
  runtimeRisk: "dom",
};

const fullViewportHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  runtimeRisk: "dom",
};

const technicalHost = (height: number, runtimeRisk: ReactBitsHostSpec["runtimeRisk"] = "dom"): ReactBitsHostSpec => ({
  profile: "canvas",
  width: "full",
  height: "technical-definite",
  technicalHeight: { value: height, provenance: "puck-technical" },
  runtimeRisk,
});

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
  // Official source pins a h-screen scene through GSAP ScrollTrigger. It renders directly,
  // but stays visually empty in Puck's iframe viewport after two host/scroll diagnostics.
  block({ type: "RB_batch2_3d_text_reveal", displayName: "React Bits 3D Text Reveal", catalogKey: "component:3d-text-reveal", description: "Official React Bits 3D Text Reveal.", component: ThreeDTextReveal as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: fullViewportHost, batchStatus: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch2_bending_marquee", displayName: "React Bits Bending Marquee", catalogKey: "component:bending-marquee", description: "Official React Bits Bending Marquee.", component: BendingMarquee as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(520, "resize-observer") }),
  block({ type: "RB_batch2_card_spread", displayName: "React Bits Card Spread", catalogKey: "component:card-spread", description: "Official React Bits Card Spread.", component: CardSpread as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(520, "resize-observer") }),
  block({ type: "RB_batch2_circle_gallery", displayName: "React Bits Circle Gallery", catalogKey: "component:circle-gallery", description: "Official React Bits Circle Gallery.", component: CircleGallery as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: fullViewportHost }),
  block({ type: "RB_batch2_skewed_carousel", displayName: "React Bits Skewed Carousel", catalogKey: "component:skewed-carousel", description: "Official React Bits Skewed Carousel.", component: SkewedCarousel as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: flowHost }),
  // Official docs demo exposes black text on a white surface. The Puck iframe's
  // source-default startOnView observer does not paint digits after two checks,
  // so it stays available in the direct/demo review but is not offered as a
  // misleading empty Puck block.
  block({ type: "RB_batch2_speeding_text", displayName: "React Bits Speeding Text", catalogKey: "component:speeding-text", description: "Official React Bits Speeding Text.", component: SpeedingText as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(240, "observer"), defaultProps: { backgroundColor: "#ffffff" }, fields: { value: fields.number("Value", { min: 0, max: 1000000 }) }, batchStatus: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch2_tilted_tiles", displayName: "React Bits Tilted Tiles", catalogKey: "component:tilted-tiles", description: "Official React Bits Tilted Tiles.", component: TiltedTiles as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: technicalHost(520) }),
  block({ type: "RB_batch2_tumble_carousel", displayName: "React Bits Tumble Carousel", catalogKey: "component:tumble-carousel", description: "Official React Bits Tumble Carousel.", component: TumbleCarousel as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 2", "Animated Component"], batchGroup: "Animated Components", host: flowHost }),
];

const marketingBlocks = [
  block({ type: "RB_batch2_social_proof_4", displayName: "React Bits Social Proof 4", catalogKey: "pro-block:social-proof-4", description: "Official React Bits Social Proof 4.", component: SocialProof4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_faq_5", displayName: "React Bits FAQ 5", catalogKey: "pro-block:faq-5", description: "Official React Bits FAQ 5.", component: Faq5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_stats_4", displayName: "React Bits Stats 4", catalogKey: "pro-block:stats-4", description: "Official React Bits Stats 4.", component: Stats4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_about_8", displayName: "React Bits About 8", catalogKey: "pro-block:about-8", description: "Official React Bits About 8.", component: About8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_how_it_works_8", displayName: "React Bits How It Works 8", catalogKey: "pro-block:how-it-works-8", description: "Official React Bits How It Works 8.", component: HowItWorks8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_showcase_6", displayName: "React Bits Showcase 6", catalogKey: "pro-block:showcase-6", description: "Official React Bits Showcase 6.", component: Showcase6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_social_proof_5", displayName: "React Bits Social Proof 5", catalogKey: "pro-block:social-proof-5", description: "Official React Bits Social Proof 5.", component: SocialProof5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
  block({ type: "RB_batch2_about_9", displayName: "React Bits About 9", catalogKey: "pro-block:about-9", description: "Official React Bits About 9.", component: About9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Marketing Block"], batchGroup: "Marketing Blocks", host: marketingHost }),
];

const appBlocks = [
  block({ type: "RB_batch2_app_dialog_4", displayName: "React Bits App Dialog 4", catalogKey: "pro-block:app-dialog-4", description: "Official React Bits App Dialog 4.", component: AppDialog4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch2_empty_state_2", displayName: "React Bits Empty State 2", catalogKey: "pro-block:empty-state-2", description: "Official React Bits Empty State 2.", component: EmptyState2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch2_feedback_2", displayName: "React Bits Feedback 2", catalogKey: "pro-block:feedback-2", description: "Official React Bits Feedback 2.", component: Feedback2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(560) }),
  block({ type: "RB_batch2_onboarding_2", displayName: "React Bits Onboarding 2", catalogKey: "pro-block:onboarding-2", description: "Official React Bits Onboarding 2.", component: Onboarding2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(720) }),
  block({ type: "RB_batch2_notifications_2", displayName: "React Bits Notifications 2", catalogKey: "pro-block:notifications-2", description: "Official React Bits Notifications 2.", component: Notifications2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(620) }),
  block({ type: "RB_batch2_support_2", displayName: "React Bits Support 2", catalogKey: "pro-block:support-2", description: "Official React Bits Support 2.", component: Support2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(800) }),
  block({ type: "RB_batch2_list_2", displayName: "React Bits List 2", catalogKey: "pro-block:list-2", description: "Official React Bits List 2.", component: List2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(640) }),
  block({ type: "RB_batch2_mobile_2", displayName: "React Bits Mobile 2", catalogKey: "pro-block:mobile-2", description: "Official React Bits Mobile 2.", component: Mobile2 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 2", "Application UI"], batchGroup: "Application UI", host: appHost(680) }),
];

export const fastBatch2Blocks = [...animatedBlocks, ...marketingBlocks, ...appBlocks];
export const fastBatch2PuckBlocks = fastBatch2Blocks.filter((entry) => entry.batchStatus === "DIRECT_RENDER_PASS");
export const fastBatch2Components = Object.fromEntries(fastBatch2PuckBlocks.map((entry) => [
  entry.type,
  entry.sourceKind === "pro-block"
    ? createMarketingPuckComponent(entry as never)
    : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false }),
]));
export const fastBatch2Categories = {
  fastBatch2: {
    title: "React Bits Fast Batch 2",
    defaultExpanded: false,
    components: fastBatch2PuckBlocks.map((entry) => entry.type),
  },
};
