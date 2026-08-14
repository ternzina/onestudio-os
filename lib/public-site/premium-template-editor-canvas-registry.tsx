"use client";

import { createElement, type ComponentType } from "react";
import PublicPremiumActionStyles from "@/components/public/PublicPremiumActionStyles";
import { getPremiumTemplatePublicRuntime } from "./premium-template-runtime-registry.ts";
import type { PublicSiteContent, PublicSiteData } from "./types";

export type PremiumTemplateEditorCanvasRendererProps = {
  content: PublicSiteContent;
  basePath: string;
  site?: PublicSiteData;
};

export type PremiumTemplateEditorCanvasRenderer = ComponentType<PremiumTemplateEditorCanvasRendererProps>;

function previewSite(content: PublicSiteContent): PublicSiteData {
  return {
    business: {
      id: "template-editor-preview",
      slug: "template-editor-preview",
      name: content.brand_name || "OneStudio",
      locale: "ru",
      primary_locale: "ru",
      currency: "EUR",
      timezone: "UTC",
    },
    content,
    company: { display_name: content.brand_name || "OneStudio" },
    services: [],
    portfolio: [],
    capabilities: { booking: true, catalog: true, portfolio: true },
    available_locales: ["ru"],
    published_at: null,
  };
}

export function getPremiumTemplateEditorCanvasRenderer(
  templateKey: string | null | undefined,
): PremiumTemplateEditorCanvasRenderer | undefined {
  const runtime = getPremiumTemplatePublicRuntime(templateKey);
  if (!runtime) return undefined;
  const PublicHomeRenderer = runtime.publicHomeRenderer;
  return function RegistryBackedPremiumTemplateEditorCanvas({ content, basePath, site }) {
    return <PublicHomeRenderer site={site ? { ...site, content } : previewSite(content)} basePath={basePath} />;
  };
}

export function PremiumTemplateEditorCanvas({
  templateKey,
  ...props
}: PremiumTemplateEditorCanvasRendererProps & {
  templateKey: string | null | undefined;
}) {
  const renderer = getPremiumTemplateEditorCanvasRenderer(templateKey);
  return renderer && templateKey ? (
    <>
      <PublicPremiumActionStyles content={props.content} templateKey={templateKey} />
      {createElement(renderer, props)}
    </>
  ) : null;
}
