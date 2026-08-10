"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { PublicSiteContent } from "./types";

export type PremiumTemplateEditorCanvasRendererProps = {
  content: PublicSiteContent;
  basePath: string;
};

export type PremiumTemplateEditorCanvasRenderer = ComponentType<PremiumTemplateEditorCanvasRendererProps>;

const NoirEditorCanvas = dynamic(
  () => import("@/app/demos/premium-studio/PremiumStudioExperience"),
  { ssr: false },
);

const NoirEditorCanvasRenderer: PremiumTemplateEditorCanvasRenderer = ({ content, basePath }) => (
  <NoirEditorCanvas content={content} basePath={basePath} />
);

const editorCanvasRenderers = new Map<string, PremiumTemplateEditorCanvasRenderer>([
  ["premium-studio", NoirEditorCanvasRenderer],
]);

export function getPremiumTemplateEditorCanvasRenderer(
  templateKey: string | null | undefined,
) {
  return templateKey ? editorCanvasRenderers.get(templateKey) : undefined;
}
