"use client";

import type { ReactNode } from "react";
import Hero1 from "@/components/blocks/hero-1";
import Hero2 from "@/components/blocks/hero-2";
import Hero3 from "@/components/blocks/hero-3";
import Navigation1 from "@/components/blocks/navigation-1";
import { Navigation2 } from "@/components/blocks/navigation-2";
import { Navigation3 } from "@/components/blocks/navigation-3";
import CTA1 from "@/components/blocks/cta-1";
import CTA2 from "@/components/blocks/cta-2";
import CTA3 from "@/components/blocks/cta-3";
import Pricing2 from "@/components/blocks/pricing-2";
import Pricing3 from "@/components/blocks/pricing-3";
import Pricing4 from "@/components/blocks/pricing-4";
import Contact1 from "@/components/blocks/contact-1";
import Contact3 from "@/components/blocks/contact-3";
import Footer1 from "@/components/blocks/footer-1";
import Footer2 from "@/components/blocks/footer-2";
import Footer4 from "@/components/blocks/footer-4";
import Card1 from "@/components/blocks/card-1";
import Card3 from "@/components/blocks/card-3";
import AppShell1 from "@/components/blocks/app-shell-1";
import AppSidebar1 from "@/components/blocks/app-sidebar-1";
import Onboarding3 from "@/components/blocks/onboarding-3";
import Mobile5 from "@/components/blocks/mobile-5";
import List5 from "@/components/blocks/list-5";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "Marketing Blocks" | "Application UI";
type BatchStatus = "DIRECT_RENDER_PASS" | "BLOCKED_SOURCE_DIFF";
type Block = { type: string; displayName: string; catalogKey: string; description: string; component: AnyComponent; tags: readonly string[]; defaultProps: Record<string, unknown>; fields: Record<string, unknown>; host: ReactBitsHostSpec; category: "React Bits Fast Batch 6"; batchGroup: BatchGroup; batchStatus: BatchStatus; blocker?: string; sourceKind: "pro-block" };
const block = (input: Omit<Block, "category" | "defaultProps" | "fields" | "batchStatus"> & { defaultProps?: Record<string, unknown>; fields?: Record<string, unknown>; batchStatus?: BatchStatus; blocker?: string }): Block => ({ ...input, category: "React Bits Fast Batch 6", defaultProps: input.defaultProps ?? {}, fields: input.fields ?? {}, batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS" });
const marketingHost: ReactBitsHostSpec = { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" };
const appHost = (minHeight: number): ReactBitsHostSpec => ({ profile: "app-surface", width: "full", height: "source-min", sourceMinHeight: { value: minHeight, provenance: "official-source" }, overflow: "source", runtimeRisk: "none" });
const sourceDiff = "BLOCKED_SOURCE_DIFF" as const;

const marketingBlocks = [
  block({ type: "RB_batch6_hero_1", displayName: "React Bits Hero 1", catalogKey: "pro-block:hero-1", description: "Official React Bits Hero 1.", component: Hero1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Hero"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_hero_2", displayName: "React Bits Hero 2", catalogKey: "pro-block:hero-2", description: "Official React Bits Hero 2.", component: Hero2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Hero"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_hero_3", displayName: "React Bits Hero 3", catalogKey: "pro-block:hero-3", description: "Official React Bits Hero 3.", component: Hero3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Hero"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_navigation_1", displayName: "React Bits Navigation 1", catalogKey: "pro-block:navigation-1", description: "Official React Bits Navigation 1.", component: Navigation1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_navigation_2", displayName: "React Bits Navigation 2", catalogKey: "pro-block:navigation-2", description: "Official React Bits Navigation 2.", component: Navigation2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_navigation_3", displayName: "React Bits Navigation 3", catalogKey: "pro-block:navigation-3", description: "Official React Bits Navigation 3.", component: Navigation3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_cta_1", displayName: "React Bits CTA 1", catalogKey: "pro-block:cta-1", description: "Official React Bits CTA 1.", component: CTA1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "CTA"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_cta_2", displayName: "React Bits CTA 2", catalogKey: "pro-block:cta-2", description: "Official React Bits CTA 2.", component: CTA2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "CTA"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_cta_3", displayName: "React Bits CTA 3", catalogKey: "pro-block:cta-3", description: "Official React Bits CTA 3.", component: CTA3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "CTA"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_pricing_2", displayName: "React Bits Pricing 2", catalogKey: "pro-block:pricing-2", description: "Official React Bits Pricing 2.", component: Pricing2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Pricing"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_pricing_3", displayName: "React Bits Pricing 3", catalogKey: "pro-block:pricing-3", description: "Official React Bits Pricing 3.", component: Pricing3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Pricing"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_pricing_4", displayName: "React Bits Pricing 4", catalogKey: "pro-block:pricing-4", description: "Official React Bits Pricing 4.", component: Pricing4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Pricing"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_contact_1", displayName: "React Bits Contact 1", catalogKey: "pro-block:contact-1", description: "Official React Bits Contact 1.", component: Contact1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Contact"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_contact_3", displayName: "React Bits Contact 3", catalogKey: "pro-block:contact-3", description: "Official React Bits Contact 3.", component: Contact3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Contact"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_footer_1", displayName: "React Bits Footer 1", catalogKey: "pro-block:footer-1", description: "Official React Bits Footer 1.", component: Footer1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Footer"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_footer_2", displayName: "React Bits Footer 2", catalogKey: "pro-block:footer-2", description: "Official React Bits Footer 2.", component: Footer2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Footer"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_footer_4", displayName: "React Bits Footer 4", catalogKey: "pro-block:footer-4", description: "Official React Bits Footer 4.", component: Footer4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Footer"], batchGroup: "Marketing Blocks", host: marketingHost, batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
];
const appBlocks = [
  block({ type: "RB_batch6_card_1", displayName: "React Bits Card 1", catalogKey: "pro-block:card-1", description: "Official React Bits Card 1.", component: Card1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Cards"], batchGroup: "Application UI", host: appHost(560), batchStatus: sourceDiff, blocker: sourceDiff, sourceKind: "pro-block" }),
  block({ type: "RB_batch6_card_3", displayName: "React Bits Card 3", catalogKey: "pro-block:card-3", description: "Official React Bits Card 3.", component: Card3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Cards"], batchGroup: "Application UI", host: appHost(560), sourceKind: "pro-block" }),
  block({ type: "RB_batch6_app_shell_1", displayName: "React Bits App Shell 1", catalogKey: "pro-block:app-shell-1", description: "Official React Bits App Shell 1.", component: AppShell1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "App Shell"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch6_app_sidebar_1", displayName: "React Bits App Sidebar 1", catalogKey: "pro-block:app-sidebar-1", description: "Official React Bits App Sidebar 1.", component: AppSidebar1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "App Shell"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch6_onboarding_3", displayName: "React Bits Onboarding 3", catalogKey: "pro-block:onboarding-3", description: "Official React Bits Onboarding 3.", component: Onboarding3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Onboarding"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch6_mobile_5", displayName: "React Bits Mobile 5", catalogKey: "pro-block:mobile-5", description: "Official React Bits Mobile 5.", component: Mobile5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Mobile UI"], batchGroup: "Application UI", host: appHost(680), sourceKind: "pro-block" }),
  block({ type: "RB_batch6_list_5", displayName: "React Bits List 5", catalogKey: "pro-block:list-5", description: "Official React Bits List 5.", component: List5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 6", "Lists"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
];
export const fastBatch6Blocks = [...marketingBlocks, ...appBlocks];
export const fastBatch6PuckBlocks = fastBatch6Blocks.filter((entry) => entry.batchStatus === "DIRECT_RENDER_PASS");
export const fastBatch6Components = Object.fromEntries(fastBatch6PuckBlocks.map((entry) => [entry.type, createMarketingPuckComponent(entry as never)]));
export const fastBatch6Categories = { fastBatch6: { title: "React Bits Fast Batch 6", defaultExpanded: false, components: fastBatch6PuckBlocks.map((entry) => entry.type) } };
