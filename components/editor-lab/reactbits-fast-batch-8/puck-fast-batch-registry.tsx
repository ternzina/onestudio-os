"use client";

import type { ReactNode } from "react";
import { Showcase1 } from "@/components/blocks/showcase-1";
import { SocialProof9 } from "@/components/blocks/social-proof-9";
import SocialProof11 from "@/components/blocks/social-proof-11";
import Scheduling1 from "@/components/blocks/scheduling-1";
import Scheduling2 from "@/components/blocks/scheduling-2";
import Scheduling4 from "@/components/blocks/scheduling-4";
import Scheduling5 from "@/components/blocks/scheduling-5";
import Scheduling6 from "@/components/blocks/scheduling-6";
import Scheduling7 from "@/components/blocks/scheduling-7";
import AppShell3 from "@/components/blocks/app-shell-3";
import AppShell5 from "@/components/blocks/app-shell-5";
import AppSidebar3 from "@/components/blocks/app-sidebar-3";
import AppSidebar4 from "@/components/blocks/app-sidebar-4";
import AppSidebar5 from "@/components/blocks/app-sidebar-5";
import Card6 from "@/components/blocks/card-6";
import Card7 from "@/components/blocks/card-7";
import Forms3 from "@/components/blocks/forms-3";
import List6 from "@/components/blocks/list-6";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";

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
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 8";
  batchGroup: BatchGroup;
  batchStatus: "DIRECT_RENDER_PASS";
  sourceKind: "pro-block";
};

const block = (
  input: Omit<Block, "category" | "defaultProps" | "fields" | "batchStatus">,
): Block => ({
  ...input,
  category: "React Bits Fast Batch 8",
  defaultProps: {},
  fields: {},
  batchStatus: "DIRECT_RENDER_PASS",
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

const marketingBlocks = [
  block({ type: "RB_batch8_showcase_1", displayName: "React Bits Showcase 1", catalogKey: "pro-block:showcase-1", description: "Official React Bits Showcase 1.", component: Showcase1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Showcase"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch8_social_proof_9", displayName: "React Bits Social Proof 9", catalogKey: "pro-block:social-proof-9", description: "Official React Bits Social Proof 9.", component: SocialProof9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Social Proof"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
  block({ type: "RB_batch8_social_proof_11", displayName: "React Bits Social Proof 11", catalogKey: "pro-block:social-proof-11", description: "Official React Bits Social Proof 11.", component: SocialProof11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Social Proof"], batchGroup: "Marketing Blocks", host: marketingHost, sourceKind: "pro-block" }),
];

const appBlocks = [
  block({ type: "RB_batch8_scheduling_1", displayName: "React Bits Scheduling 1", catalogKey: "pro-block:scheduling-1", description: "Official React Bits Scheduling 1.", component: Scheduling1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Scheduling"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_scheduling_2", displayName: "React Bits Scheduling 2", catalogKey: "pro-block:scheduling-2", description: "Official React Bits Scheduling 2.", component: Scheduling2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Scheduling"], batchGroup: "Application UI", host: appHost(480), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_scheduling_4", displayName: "React Bits Scheduling 4", catalogKey: "pro-block:scheduling-4", description: "Official React Bits Scheduling 4.", component: Scheduling4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Scheduling"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_scheduling_5", displayName: "React Bits Scheduling 5", catalogKey: "pro-block:scheduling-5", description: "Official React Bits Scheduling 5.", component: Scheduling5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Scheduling"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_scheduling_6", displayName: "React Bits Scheduling 6", catalogKey: "pro-block:scheduling-6", description: "Official React Bits Scheduling 6.", component: Scheduling6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Scheduling"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_scheduling_7", displayName: "React Bits Scheduling 7", catalogKey: "pro-block:scheduling-7", description: "Official React Bits Scheduling 7.", component: Scheduling7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Scheduling"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_app_shell_3", displayName: "React Bits App Shell 3", catalogKey: "pro-block:app-shell-3", description: "Official React Bits App Shell 3.", component: AppShell3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "App Shell"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_app_shell_5", displayName: "React Bits App Shell 5", catalogKey: "pro-block:app-shell-5", description: "Official React Bits App Shell 5.", component: AppShell5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "App Shell"], batchGroup: "Application UI", host: appHost(720), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_app_sidebar_3", displayName: "React Bits App Sidebar 3", catalogKey: "pro-block:app-sidebar-3", description: "Official React Bits App Sidebar 3.", component: AppSidebar3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "App Sidebar"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_app_sidebar_4", displayName: "React Bits App Sidebar 4", catalogKey: "pro-block:app-sidebar-4", description: "Official React Bits App Sidebar 4.", component: AppSidebar4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "App Sidebar"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_app_sidebar_5", displayName: "React Bits App Sidebar 5", catalogKey: "pro-block:app-sidebar-5", description: "Official React Bits App Sidebar 5.", component: AppSidebar5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "App Sidebar"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_card_6", displayName: "React Bits Card 6", catalogKey: "pro-block:card-6", description: "Official React Bits Card 6.", component: Card6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Cards"], batchGroup: "Application UI", host: appHost(480), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_card_7", displayName: "React Bits Card 7", catalogKey: "pro-block:card-7", description: "Official React Bits Card 7.", component: Card7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Cards"], batchGroup: "Application UI", host: appHost(560), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_forms_3", displayName: "React Bits Forms 3", catalogKey: "pro-block:forms-3", description: "Official React Bits Forms 3.", component: Forms3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Forms"], batchGroup: "Application UI", host: appHost(1120), sourceKind: "pro-block" }),
  block({ type: "RB_batch8_list_6", displayName: "React Bits List 6", catalogKey: "pro-block:list-6", description: "Official React Bits List 6.", component: List6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 8", "Lists"], batchGroup: "Application UI", host: appHost(640), sourceKind: "pro-block" }),
];

export const fastBatch8Blocks = [...marketingBlocks, ...appBlocks];
export const fastBatch8PuckBlocks = fastBatch8Blocks;
export const fastBatch8Components = Object.fromEntries(
  fastBatch8PuckBlocks.map((entry) => [
    entry.type,
    createMarketingPuckComponent(entry as never),
  ]),
);
export const fastBatch8Categories = {
  fastBatch8: {
    title: "React Bits Fast Batch 8",
    defaultExpanded: false,
    components: fastBatch8PuckBlocks.map((entry) => entry.type),
  },
};
