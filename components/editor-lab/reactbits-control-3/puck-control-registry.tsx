"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Faq4 from "@/components/blocks/faq-4";
import EmptyState3 from "@/components/blocks/empty-state-3";
import { BlurHighlight, type BlurHighlightRef } from "@/components/react-bits/blur-highlight";
import { createPuckComponent, type RuntimeFamily } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;

const blurHighlightOfficialPreviewText =
  "Our cutting-edge technology transforms how businesses analyze data and make decisions. From real-time insights to predictive analytics, we deliver solutions that drive growth and innovation.";

type BlurHighlightPuckAdapterProps = {
  text: string;
};

function BlurHighlightPuckAdapter({ text }: BlurHighlightPuckAdapterProps) {
  const blurHighlightRef = useRef<BlurHighlightRef>(null);

  useEffect(() => {
    blurHighlightRef.current?.trigger();
    return () => blurHighlightRef.current?.reset();
  }, []);

  return <BlurHighlight ref={blurHighlightRef}>{text}</BlurHighlight>;
}

const control = (input: {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  defaultProps?: Record<string, unknown>;
  runtimeFamily?: RuntimeFamily;
  definiteHeight?: number;
  host?: ReactBitsHostSpec;
}) => ({
  ...input,
  category: "React Bits Control 3",
  readiness: "PUCK_RENDER_PASS" as const,
  defaultProps: input.defaultProps ?? {},
  fields: {},
});

const blurHighlightBlock = {
  ...control({
    type: "RB_control3_blur_highlight",
    displayName: "React Bits Blur Highlight",
    catalogKey: "control-3:blur-highlight",
    description: "Official React Bits animated component rendered through the Puck V3 boundary.",
    component: BlurHighlightPuckAdapter as unknown as AnyComponent,
    sourceKind: "component",
    tags: ["React Bits Control 3", "Animated Component"],
    defaultProps: { text: blurHighlightOfficialPreviewText },
    host: {
      profile: "flow",
      width: "content",
      height: "intrinsic",
      align: "center",
      runtimeRisk: "observer",
    },
  }),
  fields: {
    text: fields.textarea("Text", { contentEditable: false }),
  },
};

const faq4Block = control({
  type: "RB_control3_faq_4",
  displayName: "React Bits FAQ 4",
  catalogKey: "control-3:faq-4",
  description: "Official React Bits Marketing Block rendered through the Puck V3 boundary.",
  component: Faq4 as unknown as AnyComponent,
  sourceKind: "pro-block",
  tags: ["React Bits Control 3", "Marketing Block"],
  host: {
    profile: "section",
    width: "full",
    height: "intrinsic",
    sourceCssVariable: {
      name: "--rb-section-min-h",
      value: "800px",
      provenance: "official-contract",
    },
    runtimeRisk: "observer",
  },
});

const emptyState3Block = control({
  type: "RB_control3_empty_state_3",
  displayName: "React Bits Empty State 3",
  catalogKey: "control-3:empty-state-3",
  description: "Official React Bits Application UI block rendered through the Puck V3 boundary.",
  component: EmptyState3 as unknown as AnyComponent,
  sourceKind: "component",
  tags: ["React Bits Control 3", "Application UI"],
  host: {
    profile: "app-surface",
    width: "full",
    height: "technical-definite",
    sourceMinHeight: { value: 560, provenance: "official-source" },
    technicalHeight: { value: 640, provenance: "puck-technical" },
    overflow: "source",
    runtimeRisk: "none",
  },
});

export const control3Blocks = [blurHighlightBlock, faq4Block, emptyState3Block];

export const control3BlockByCatalogKey = new Map(
  control3Blocks.map((block) => [block.catalogKey, block]),
);

export const control3Components = {
  [blurHighlightBlock.type]: createPuckComponent(blurHighlightBlock as never, { showLabLabel: false }),
  [faq4Block.type]: createMarketingPuckComponent(faq4Block as never),
  [emptyState3Block.type]: createPuckComponent(emptyState3Block as never, { showLabLabel: false }),
};

export const control3Categories = {
  control3: {
    title: "React Bits Control 3",
    defaultExpanded: true,
    components: control3Blocks.map((block) => block.type),
  },
};
