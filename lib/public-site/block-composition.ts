import type { CSSProperties } from "react";
import type {
  PublicSiteCompositionAlign,
  PublicSiteCompositionCardLayout,
  PublicSiteCompositionColumns,
  PublicSiteCompositionElement,
  PublicSiteCompositionLayout,
  PublicSiteCompositionMobileColumns,
  PublicSiteCompositionSplitRatio,
  PublicSiteCompositionTextAlign,
  PublicSiteCustomBlock,
  PublicSiteCustomBlockKind,
  PublicSiteMediaGap,
} from "./types";

export type PublicSiteBlockCompositionCapabilities = {
  layouts: readonly PublicSiteCompositionLayout[];
  cards: boolean;
  splitRatio: boolean;
  mediaPlacement: boolean;
};

export type ResolvedPublicSiteBlockComposition = {
  enabled: boolean;
  layout: PublicSiteCompositionLayout;
  columns: PublicSiteCompositionColumns;
  gap: PublicSiteMediaGap;
  align: PublicSiteCompositionAlign;
  textAlign: PublicSiteCompositionTextAlign;
  splitRatio: PublicSiteCompositionSplitRatio;
  cardLayout: PublicSiteCompositionCardLayout;
  order: PublicSiteCompositionElement[];
  mobileLayout: PublicSiteCompositionLayout;
  mobileColumns: PublicSiteCompositionMobileColumns;
  mobileGap: PublicSiteMediaGap;
  mobileAlign: PublicSiteCompositionAlign;
  mobileTextAlign: PublicSiteCompositionTextAlign;
  mobileCardLayout: PublicSiteCompositionCardLayout;
  mobileOrder: PublicSiteCompositionElement[];
};

const compositionGap = {
  none: "0px",
  compact: "10px",
  normal: "clamp(18px, 3vw, 32px)",
  airy: "clamp(28px, 5vw, 56px)",
} as const;

const compositionSplit = {
  balanced: "minmax(0, 1fr) minmax(0, 1fr)",
  content_wide: "minmax(0, 1.2fr) minmax(0, .8fr)",
  media_wide: "minmax(0, .8fr) minmax(0, 1.2fr)",
} as const;

const defaultElements: Record<PublicSiteCustomBlockKind, readonly PublicSiteCompositionElement[]> = {
  text: ["eyebrow", "title", "text"],
  features: ["eyebrow", "title", "cards"],
  cta: ["eyebrow", "title", "text", "action"],
  slider: ["eyebrow", "title", "text", "media"],
  collage: ["eyebrow", "title", "text", "media"],
  video: ["eyebrow", "title", "text", "media"],
  media_text: ["eyebrow", "title", "text", "action"],
  columns: ["eyebrow", "title", "text", "cards"],
};

export function publicSiteBlockCompositionCapabilities(
  kind: PublicSiteCustomBlockKind,
): PublicSiteBlockCompositionCapabilities {
  if (kind === "media_text") {
    return { layouts: ["split", "stack"], cards: false, splitRatio: true, mediaPlacement: true };
  }
  if (kind === "columns" || kind === "features") {
    return { layouts: ["grid", "stack"], cards: true, splitRatio: false, mediaPlacement: false };
  }
  if (kind === "text" || kind === "cta") {
    return { layouts: ["stack", "split", "grid"], cards: false, splitRatio: true, mediaPlacement: false };
  }
  return { layouts: ["stack", "grid"], cards: false, splitRatio: false, mediaPlacement: false };
}

export function publicSiteCompositionElements(
  kind: PublicSiteCustomBlockKind,
): PublicSiteCompositionElement[] {
  return [...defaultElements[kind]];
}

export function normalizePublicSiteCompositionOrder(
  kind: PublicSiteCustomBlockKind,
  order?: readonly PublicSiteCompositionElement[],
): PublicSiteCompositionElement[] {
  const allowed = defaultElements[kind];
  const seen = new Set<PublicSiteCompositionElement>();
  const normalized = (order ?? []).filter((element): element is PublicSiteCompositionElement => {
    if (!allowed.includes(element) || seen.has(element)) return false;
    seen.add(element);
    return true;
  });
  return [...normalized, ...allowed.filter((element) => !seen.has(element))];
}

function defaultLayout(kind: PublicSiteCustomBlockKind): PublicSiteCompositionLayout {
  if (kind === "media_text") return "split";
  return "stack";
}

function defaultColumns(block: PublicSiteCustomBlock): PublicSiteCompositionColumns {
  if (block.kind === "columns") return block.columns_count === 2 ? 2 : 3;
  if (block.kind === "features") return 3;
  if (block.kind === "media_text") return 2;
  return 1;
}

export function resolvePublicSiteBlockComposition(
  block: PublicSiteCustomBlock,
): ResolvedPublicSiteBlockComposition {
  const capabilities = publicSiteBlockCompositionCapabilities(block.kind);
  const fallbackLayout = defaultLayout(block.kind);
  const layout = capabilities.layouts.includes(block.composition_layout ?? fallbackLayout)
    ? block.composition_layout ?? fallbackLayout
    : fallbackLayout;
  const mobileLayout = capabilities.layouts.includes(block.composition_mobile_layout ?? "stack")
    ? block.composition_mobile_layout ?? "stack"
    : "stack";
  const order = normalizePublicSiteCompositionOrder(block.kind, block.composition_order);
  return {
    enabled: block.composition_enabled === true,
    layout,
    columns: block.composition_columns ?? defaultColumns(block),
    gap: block.composition_gap ?? "normal",
    align: block.composition_align ?? (block.kind === "media_text" ? "center" : "stretch"),
    textAlign: block.composition_text_align ?? "left",
    splitRatio: block.composition_split_ratio ?? "balanced",
    cardLayout: block.composition_card_layout ?? "vertical",
    order,
    mobileLayout,
    mobileColumns: block.composition_mobile_columns ?? 1,
    mobileGap: block.composition_mobile_gap ?? block.composition_gap ?? "normal",
    mobileAlign: block.composition_mobile_align ?? block.composition_align ?? "stretch",
    mobileTextAlign: block.composition_mobile_text_align ?? block.composition_text_align ?? "left",
    mobileCardLayout: block.composition_mobile_card_layout ?? block.composition_card_layout ?? "vertical",
    mobileOrder: normalizePublicSiteCompositionOrder(block.kind, block.composition_mobile_order ?? order),
  };
}

type CompositionVariables = CSSProperties & {
  "--os-composition-columns"?: string;
  "--os-composition-mobile-columns"?: string;
  "--os-composition-gap"?: string;
  "--os-composition-mobile-gap"?: string;
  "--os-composition-align"?: string;
  "--os-composition-mobile-align"?: string;
  "--os-composition-text-align"?: string;
  "--os-composition-mobile-text-align"?: string;
  "--os-composition-split"?: string;
  "--os-composition-mobile-split"?: string;
};

export function publicSiteBlockCompositionStyle(
  block: PublicSiteCustomBlock,
): CompositionVariables {
  const composition = resolvePublicSiteBlockComposition(block);
  if (!composition.enabled) return {};
  return {
    "--os-composition-columns": String(composition.columns),
    "--os-composition-mobile-columns": String(composition.mobileColumns),
    "--os-composition-gap": compositionGap[composition.gap],
    "--os-composition-mobile-gap": compositionGap[composition.mobileGap],
    "--os-composition-align": composition.align,
    "--os-composition-mobile-align": composition.mobileAlign,
    "--os-composition-text-align": composition.textAlign,
    "--os-composition-mobile-text-align": composition.mobileTextAlign,
    "--os-composition-split": compositionSplit[composition.splitRatio],
    "--os-composition-mobile-split": `repeat(${composition.mobileColumns}, minmax(0, 1fr))`,
  };
}

type CompositionItemVariables = CSSProperties & {
  "--os-composition-order"?: string;
  "--os-composition-mobile-order"?: string;
};

export function publicSiteCompositionItemStyle(
  block: PublicSiteCustomBlock,
  element: PublicSiteCompositionElement,
): CompositionItemVariables | undefined {
  const composition = resolvePublicSiteBlockComposition(block);
  if (!composition.enabled) return undefined;
  return {
    "--os-composition-order": String(composition.order.indexOf(element) + 1),
    "--os-composition-mobile-order": String(composition.mobileOrder.indexOf(element) + 1),
  };
}
