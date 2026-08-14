"use client";

import dynamic from "next/dynamic";
import { createElement, type ComponentType } from "react";
import PublicPremiumActionStyles from "@/components/public/PublicPremiumActionStyles";
import type { PublicSiteContent, PublicSiteData } from "./types";

export type PremiumTemplateEditorCanvasRendererProps = {
  content: PublicSiteContent;
  basePath: string;
  site?: PublicSiteData;
};

export type PremiumTemplateEditorCanvasRenderer = ComponentType<PremiumTemplateEditorCanvasRendererProps>;

const NoirEditorCanvas = dynamic(
  () => import("@/app/demos/premium-studio/PremiumStudioExperience"),
  { ssr: false },
);

const NoirEditorCanvasRenderer: PremiumTemplateEditorCanvasRenderer = ({ content, basePath }) => (
  <NoirEditorCanvas content={content} basePath={basePath} />
);

const VeloraEditorCanvas = dynamic(
  () => import("@/components/public/velora/VeloraSite"),
  { ssr: false },
);

const VeloraEditorCanvasRenderer: PremiumTemplateEditorCanvasRenderer = ({ content, basePath, site }) => (
  <VeloraEditorCanvas
    site={site ?? {
      business: {
        id: "velora-editor-preview",
        slug: "velora-editor-preview",
        name: content.brand_name || "VELORA",
        locale: "ru",
        primary_locale: "ru",
        currency: "EUR",
        timezone: "Europe/Kyiv",
      },
      content,
      company: { display_name: content.brand_name || "VELORA" },
      services: [],
      portfolio: [],
      capabilities: { booking: true, catalog: true, portfolio: true },
      available_locales: ["ru", "en"],
      published_at: null,
    }}
    basePath={basePath}
  />
);

const LumeaEditorCanvas = dynamic(
  () => import("@/components/public/lumea/LumeaSite"),
  { ssr: false },
);

const LumeaEditorCanvasRenderer: PremiumTemplateEditorCanvasRenderer = ({ content, basePath, site }) => (
  <LumeaEditorCanvas
    site={site ?? {
      business: {
        id: "lumea-editor-preview",
        slug: "lumea-editor-preview",
        name: content.brand_name || "LUMEA Beauty",
        locale: "ru",
        primary_locale: "ru",
        currency: "UAH",
        timezone: "Europe/Kyiv",
      },
      content,
      company: { display_name: content.brand_name || "LUMEA Beauty" },
      services: [],
      portfolio: [],
      capabilities: { booking: true, catalog: true, portfolio: true },
      available_locales: ["ru", "en"],
      published_at: null,
    }}
    basePath={basePath}
  />
);

const editorCanvasRenderers = new Map<string, PremiumTemplateEditorCanvasRenderer>([
  ["premium-studio", NoirEditorCanvasRenderer],
  ["velora-event-venue", VeloraEditorCanvasRenderer],
  ["lumea-beauty", LumeaEditorCanvasRenderer],
]);

export function getPremiumTemplateEditorCanvasRenderer(
  templateKey: string | null | undefined,
) {
  return templateKey ? editorCanvasRenderers.get(templateKey) : undefined;
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
