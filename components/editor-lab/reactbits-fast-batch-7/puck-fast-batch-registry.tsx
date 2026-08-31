"use client";

import type { ReactNode } from "react";
import { Hero6 } from "@/components/blocks/hero-6";
import Cta4 from "@/components/blocks/cta-4";
import Cta6 from "@/components/blocks/cta-6";
import Cta7 from "@/components/blocks/cta-7";
import AdaptedFooter6, {
  footer6CommunityLinks,
  footer6ExploreLinks,
  footer6StudioLinks,
} from "@/components/editor-lab/adapted/footer-6";
import Footer8 from "@/components/blocks/footer-8";
import AdaptedFooter10, {
  footer10LifecycleLinks,
  footer10ProductLinks,
  footer10SupportLinks,
} from "@/components/editor-lab/adapted/footer-10";
import { Navigation4 } from "@/components/blocks/navigation-4";
import { Navigation6 } from "@/components/blocks/navigation-6";
import { Navigation7 } from "@/components/blocks/navigation-7";
import { Navigation8 } from "@/components/blocks/navigation-8";
import Contact4 from "@/components/blocks/contact-4";
import Contact5 from "@/components/blocks/contact-5";
import AdaptedContact6 from "@/components/editor-lab/adapted/contact-6";
import Pricing1 from "@/components/blocks/pricing-1";
import { Pricing5 } from "@/components/blocks/pricing-5";
import { Pricing6 } from "@/components/blocks/pricing-6";
import { AdaptedCard4 } from "@/components/editor-lab/adapted/card-4";
import Card5 from "@/components/blocks/card-5";
import AppShell2 from "@/components/blocks/app-shell-2";
import AppSidebar2 from "@/components/blocks/app-sidebar-2";
import Onboarding4 from "@/components/blocks/onboarding-4";
import Forms1 from "@/components/blocks/forms-1";
import Forms2 from "@/components/blocks/forms-2";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import type { ArrayItemsContract, PrimitiveArrayItem } from "@/components/editor-lab/puck/array-items-contract";
import { bindArrayItemsContracts, defineArrayItemsContract } from "@/components/editor-lab/puck/array-items-contract";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { defineMenuLinksArrayContract } from "@/components/editor-lab/puck/menu-links-array-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "Marketing Blocks" | "Application UI";
type Block = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component: AnyComponent;
  tags: readonly string[];
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  arrayItems?: readonly ArrayItemsContract<PrimitiveArrayItem>[];
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 7";
  batchGroup: BatchGroup;
  batchStatus: "DIRECT_RENDER_PASS";
  sourceKind: "pro-block";
};

const block = (
  input: Omit<Block, "category" | "defaultProps" | "fields" | "batchStatus"> & Pick<Partial<Block>, "defaultProps" | "fields">,
): Block => {
  const boundArrays = bindArrayItemsContracts(input.arrayItems, input.fields ?? {}, input.defaultProps ?? {});
  return {
    ...input,
    category: "React Bits Fast Batch 7",
    defaultProps: boundArrays.defaults,
    fields: boundArrays.fields,
    batchStatus: "DIRECT_RENDER_PASS",
  };
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

const card4Meetings = defineArrayItemsContract({
  slot: "meetings",
  label: "Meetings",
  defaults: [
    { id: "roadmap", title: "Roadmap review", day: "14", weekday: "Mon", window: "09:30 – 10:15", place: "Studio A", invited: 7 },
    { id: "standup", title: "Platform standup", day: "14", weekday: "Mon", window: "11:00 – 11:15", place: "Video call", invited: 8 },
    { id: "design", title: "Design critique", day: "14", weekday: "Mon", window: "14:00 – 15:00", place: "Studio B", invited: 4 },
    { id: "pricing", title: "Pricing working group", day: "15", weekday: "Tue", window: "10:00 – 10:50", place: "Video call", invited: 5 },
    { id: "retro", title: "Sprint retrospective", day: "17", weekday: "Thu", window: "16:00 – 16:45", place: "Studio A", invited: 8 },
    { id: "onsite", title: "Customer onsite prep", day: "18", weekday: "Fri", window: "08:30 – 09:00", place: "Video call", invited: 2 },
  ],
  fields: {
    title: fields.text("Meeting title", { contentEditable: false }),
    day: fields.text("Day", { contentEditable: false }),
    weekday: fields.text("Weekday", { contentEditable: false }),
    window: fields.text("Time window", { contentEditable: false }),
    place: fields.text("Place", { contentEditable: false }),
  },
  itemLabel: (item, index) => `Meeting ${Number(index ?? 0) + 1} — ${String(item.title ?? "Untitled")}`,
});

const footer10LinkContracts = [
  defineMenuLinksArrayContract({ slot: "lifecycleLinks", label: "Lifecycle links", defaults: footer10LifecycleLinks }),
  defineMenuLinksArrayContract({ slot: "productLinks", label: "Product links", defaults: footer10ProductLinks }),
  defineMenuLinksArrayContract({ slot: "supportLinks", label: "Support links", defaults: footer10SupportLinks }),
];

const footer6LinkContracts = [
  defineMenuLinksArrayContract({ slot: "exploreLinks", label: "Explore links", defaults: footer6ExploreLinks }),
  defineMenuLinksArrayContract({ slot: "studioLinks", label: "Studio links", defaults: footer6StudioLinks }),
  defineMenuLinksArrayContract({ slot: "communityLinks", label: "Community links", defaults: footer6CommunityLinks }),
];

const marketingBlocks = [
  block({ type: "RB_batch7_hero_6", displayName: "React Bits Hero 6", catalogKey: "pro-block:hero-6", description: "Official React Bits Hero 6.", component: Hero6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Hero"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_cta_4", displayName: "React Bits CTA 4", catalogKey: "pro-block:cta-4", description: "Official React Bits CTA 4.", component: Cta4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "CTA"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_cta_6", displayName: "React Bits CTA 6", catalogKey: "pro-block:cta-6", description: "Official React Bits CTA 6.", component: Cta6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "CTA"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_cta_7", displayName: "React Bits CTA 7", catalogKey: "pro-block:cta-7", description: "Official React Bits CTA 7.", component: Cta7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "CTA"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_footer_6", displayName: "React Bits Footer 6", catalogKey: "pro-block:footer-6", description: "Official React Bits Footer 6.", component: AdaptedFooter6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Footer"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block", arrayItems: footer6LinkContracts }),
  block({ type: "RB_batch7_footer_8", displayName: "React Bits Footer 8", catalogKey: "pro-block:footer-8", description: "Official React Bits Footer 8.", component: Footer8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Footer"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_footer_10", displayName: "React Bits Footer 10", catalogKey: "pro-block:footer-10", description: "Official React Bits Footer 10.", component: AdaptedFooter10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Footer"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block", arrayItems: footer10LinkContracts }),
  block({ type: "RB_batch7_navigation_4", displayName: "React Bits Navigation 4", catalogKey: "pro-block:navigation-4", description: "Official React Bits Navigation 4.", component: Navigation4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_navigation_6", displayName: "React Bits Navigation 6", catalogKey: "pro-block:navigation-6", description: "Official React Bits Navigation 6.", component: Navigation6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_navigation_7", displayName: "React Bits Navigation 7", catalogKey: "pro-block:navigation-7", description: "Official React Bits Navigation 7.", component: Navigation7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_navigation_8", displayName: "React Bits Navigation 8", catalogKey: "pro-block:navigation-8", description: "Official React Bits Navigation 8.", component: Navigation8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Navigation"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_contact_4", displayName: "React Bits Contact 4", catalogKey: "pro-block:contact-4", description: "Official React Bits Contact 4.", component: Contact4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Contact"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_contact_5", displayName: "React Bits Contact 5", catalogKey: "pro-block:contact-5", description: "Official React Bits Contact 5.", component: Contact5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Contact"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_contact_6", displayName: "React Bits Contact 6", catalogKey: "pro-block:contact-6", description: "Official React Bits Contact 6.", component: AdaptedContact6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Contact"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block", defaultProps: { heading: "Still wondering\nabout something?", description: "Drop us a line any time and a real person will get back to you within a business day.", primaryActionLabel: "hello@northwind.com" }, fields: { heading: fields.text("Heading", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }), primaryActionLabel: fields.text("Primary action label", { contentEditable: false }) } }),
  block({ type: "RB_batch7_pricing_1", displayName: "React Bits Pricing 1", catalogKey: "pro-block:pricing-1", description: "Official React Bits Pricing 1.", component: Pricing1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Pricing"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_pricing_5", displayName: "React Bits Pricing 5", catalogKey: "pro-block:pricing-5", description: "Official React Bits Pricing 5.", component: Pricing5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Pricing"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch7_pricing_6", displayName: "React Bits Pricing 6", catalogKey: "pro-block:pricing-6", description: "Official React Bits Pricing 6.", component: Pricing6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Pricing"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
];

const appBlocks = [
  block({ type: "RB_batch7_card_4", displayName: "React Bits Card 4", catalogKey: "pro-block:card-4", description: "Official React Bits Card 4.", component: AdaptedCard4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Cards"], batchGroup: "Application UI", host: appHost(560), sourceKind: "pro-block", arrayItems: [card4Meetings] }),
  block({ type: "RB_batch7_card_5", displayName: "React Bits Card 5", catalogKey: "pro-block:card-5", description: "Official React Bits Card 5.", component: Card5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Cards"], batchGroup: "Application UI", host: appHost(560), sourceKind: "pro-block" }),
  block({ type: "RB_batch7_app_shell_2", displayName: "React Bits App Shell 2", catalogKey: "pro-block:app-shell-2", description: "Official React Bits App Shell 2.", component: AppShell2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "App Shell"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch7_app_sidebar_2", displayName: "React Bits App Sidebar 2", catalogKey: "pro-block:app-sidebar-2", description: "Official React Bits App Sidebar 2.", component: AppSidebar2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "App Shell"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch7_onboarding_4", displayName: "React Bits Onboarding 4", catalogKey: "pro-block:onboarding-4", description: "Official React Bits Onboarding 4.", component: Onboarding4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Onboarding"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch7_forms_1", displayName: "React Bits Forms 1", catalogKey: "pro-block:forms-1", description: "Official React Bits Forms 1.", component: Forms1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Forms"], batchGroup: "Application UI", host: appHost(840), sourceKind: "pro-block" }),
  block({ type: "RB_batch7_forms_2", displayName: "React Bits Forms 2", catalogKey: "pro-block:forms-2", description: "Official React Bits Forms 2.", component: Forms2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 7", "Forms"], batchGroup: "Application UI", host: appHost(800), sourceKind: "pro-block" }),
];

export const fastBatch7Blocks = [...marketingBlocks, ...appBlocks];
export const fastBatch7PuckBlocks = fastBatch7Blocks;
export const fastBatch7Components = Object.fromEntries(
  fastBatch7PuckBlocks.map((entry) => [
    entry.type,
    createMarketingPuckComponent(entry as never),
  ]),
);
export const fastBatch7Categories = {
  fastBatch7: {
    title: "React Bits Fast Batch 7",
    defaultExpanded: false,
    components: fastBatch7PuckBlocks.map((entry) => entry.type),
  },
};
