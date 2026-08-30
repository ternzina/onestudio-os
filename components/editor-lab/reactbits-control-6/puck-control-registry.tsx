"use client";

import type { ReactNode } from "react";
import TextScatter from "@/components/react-bits/text-scatter";
import Download1 from "@/components/blocks/download-1";
import Card2 from "@/components/blocks/card-2";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;

const control = (input: {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  defaultProps?: Record<string, unknown>;
  host: ReactBitsHostSpec;
}) => ({
  ...input,
  category: "React Bits Control 6",
  readiness: "PUCK_RENDER_PASS" as const,
  defaultProps: input.defaultProps ?? {},
  fields: {},
});

const textScatterBlock = {
  ...control({
    type: "RB_control6_text_scatter",
    displayName: "React Bits Text Scatter",
    catalogKey: "control-6:text-scatter-tw",
    description: "Official React Bits Text Scatter rendered through the generic Puck host.",
    component: TextScatter as unknown as AnyComponent,
    sourceKind: "component",
    tags: ["React Bits Control 6", "Animated Component"],
    defaultProps: { text: "Bounce Back." },
    host: { profile: "flow", width: "content", height: "intrinsic", runtimeRisk: "dom" },
  }),
  // `text` is the only safe field with an official default and no inferred range.
  // Numeric props have no official supported ranges, and className/as are unsafe.
  fields: { text: fields.text("Text", { contentEditable: false }) },
};

const download1Block = control({
  type: "RB_control6_download_1",
  displayName: "React Bits Download 1",
  catalogKey: "control-6:download-1",
  description: "Official React Bits Marketing Block rendered through the generic Puck host.",
  component: Download1 as unknown as AnyComponent,
  sourceKind: "pro-block",
  tags: ["React Bits Control 6", "Marketing Block"],
  host: { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" },
});

const card2Block = control({
  type: "RB_control6_card_2",
  displayName: "React Bits Card 2",
  catalogKey: "control-6:card-2",
  description: "Official React Bits Application UI block rendered through the generic Puck host.",
  component: Card2 as unknown as AnyComponent,
  sourceKind: "component",
  tags: ["React Bits Control 6", "Application UI"],
  host: {
    profile: "app-surface",
    width: "full",
    height: "source-min",
    sourceMinHeight: { value: 560, provenance: "official-source" },
    overflow: "source",
    runtimeRisk: "none",
  },
});

export const control6Blocks = [textScatterBlock, download1Block, card2Block];
export const control6BlockByCatalogKey = new Map(control6Blocks.map((block) => [block.catalogKey, block]));
export const control6Components = {
  [textScatterBlock.type]: createPuckComponent(textScatterBlock as never, { showLabLabel: false }),
  [download1Block.type]: createMarketingPuckComponent(download1Block as never),
  [card2Block.type]: createPuckComponent(card2Block as never, { showLabLabel: false }),
};
export const control6Categories = {
  control6: { title: "React Bits Control 6", defaultExpanded: true, components: control6Blocks.map((block) => block.type) },
};
