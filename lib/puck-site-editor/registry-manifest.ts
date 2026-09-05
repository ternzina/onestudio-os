import { PUCK_EXPANDED_REGISTRY_DATA } from "./generated-registry-data.ts";
import type { ComponentEditorContract } from "./builder-contract.ts";
import { hero6SlidesDefaults } from "../../components/puck-site-editor/adapted/hero-6-contract.ts";
import type { ProductLibraryCategory } from "./product-library.ts";
import { PUCK_PRODUCTION_RUNTIME_EXCLUSIONS } from "./runtime-exclusions.ts";
import { PUCK_BATCH_1_EDITOR_CONTRACTS } from "../../components/puck-site-editor/content-editability-batch-1-contracts.ts";
import {
  PUCK_BATCH_2_EDITOR_CONTRACTS,
  navigation13EditorContract,
} from "../../components/puck-site-editor/content-editability-batch-2-contracts.ts";
import {
  PUCK_BATCH_3_EDITOR_CONTRACTS,
} from "../../components/puck-site-editor/content-editability-batch-3-contracts.ts";
import {
  PUCK_BATCH_4_EDITOR_CONTRACTS,
} from "../../components/puck-site-editor/content-editability-batch-4-contracts.ts";
import type { PuckRuntimeRealm } from "./runtime-realm.ts";
import {
  resolvePuckInteractionPolicy,
  type PuckInteractionPolicy,
} from "./interaction-policy.ts";

export const PUCK_REGISTRY_VERSION = "onestudio-puck-1" as const;

export type PuckProductTaxonomy = ProductLibraryCategory;

export type PuckProductionBackgroundTarget =
  | "wrapper"
  | "sourceProp"
  | "cssVariable"
  | "sourceRoot"
  | "none";

export type PuckProductionBackgroundCapability =
  | { supported: false; target: "none" }
  | { supported: true; target: "wrapper" | "sourceRoot" }
  | { supported: true; target: "sourceProp"; prop: string }
  | { supported: true; target: "cssVariable"; name: `--${string}` };

export type PuckProductionTextColorCapability =
  | { supported: false; target: "none" }
  | { supported: true; target: "wrapper" | "sourceRoot" }
  | { supported: true; target: "sourceProp"; prop: string }
  | { supported: true; target: "cssVariable"; name: `--${string}` };

export type PuckProductionPresentationGeometryKind =
  | "intrinsic"
  | "minHeight"
  | "aspect"
  | "fullSurface"
  | "viewport";

export type PuckProductionPresentationProvenance =
  | "source"
  | "officialExample"
  | "officialDemo"
  | "technicalRuntime"
  | "editorPresentationDefault";

export type PuckProductionPresentationDimension = {
  value: number;
  provenance: PuckProductionPresentationProvenance;
};

export type PuckProductionPresentationSourceGeometry = {
  width?: { value: string | number; provenance: "source" };
  height?: { value: string | number; provenance: "source" };
  definiteParent?: { required: true; provenance: "source" };
};

export type PuckProductionPresentationEditorDefault = {
  width: PuckProductionPresentationDimension;
  height: PuckProductionPresentationDimension;
};

/** Typed layout semantics for the selected production presentation root. */
export type PuckProductionPresentationRootLayout = {
  display: "flex";
  alignItems: "center";
  justifyContent: "center";
};

export type PuckProductionPresentationGeometry = {
  kind: PuckProductionPresentationGeometryKind;
  minHeight?: PuckProductionPresentationDimension;
  aspectRatio?: PuckProductionPresentationDimension;
  authoredWidth?: PuckProductionPresentationDimension;
  authoredHeight?: PuckProductionPresentationDimension;
  viewportHeight?: { value: "100vh"; provenance: "source" };
};

export type PuckProductionPresentationContract = {
  /** The production surface is the selected counterpart of the source contract. */
  target: "componentRoot";
  /** Typed layout applied to the ProductionSourceHost presentation root. */
  rootLayout?: PuckProductionPresentationRootLayout;
  /** The source/public overflow contract, independent of preview chrome. */
  overflow: "visible" | "clip";
  provenance: PuckProductionPresentationProvenance;
  sourceGeometry?: PuckProductionPresentationSourceGeometry;
  /** Editor/library-only scene dimensions; never public component geometry. */
  editorPresentationDefault?: PuckProductionPresentationEditorDefault;
  /** A non-ratio host fallback needed to give fill-parent sources a public runtime parent. */
  technicalRuntime?: {
    height: PuckProductionPresentationDimension;
  };
  geometry: PuckProductionPresentationGeometry;
  officialExampleProps?: {
    text: string;
    className: string;
    as: string;
    velocity: number;
    rotation: number;
    scale: number;
    duration: number;
    returnAfter: number;
    provenance: "officialExample";
  };
};

export type PuckProductionVisualStyleCapabilities = {
  background: PuckProductionBackgroundCapability;
  textColor: PuckProductionTextColorCapability;
};

type PuckPropRuleOptions = { editable?: boolean; required?: boolean };

export type PrimitivePuckPropRule = PuckPropRuleOptions & (
  | { kind: "string"; maxLength: number; format?: "url" | "color" }
  | { kind: "boolean" }
  | { kind: "number"; min: number; max: number }
  | { kind: "enum"; values: readonly string[] }
);

export type PuckPropRule =
  | PrimitivePuckPropRule
  | (PuckPropRuleOptions & {
      kind: "array";
      maxItems: number;
      item: PuckPropRule;
    })
  | (PuckPropRuleOptions & {
      kind: "object";
      properties: Readonly<Record<string, PuckPropRule>>;
    });

export type PuckProductionHostSpec = {
  profile: "flow" | "section" | "app-surface" | "canvas" | "aspect-media";
  width: "full" | "content";
  height: "intrinsic" | "source-min" | "technical-definite" | "aspect";
  align?: "start" | "center";
  overflow?: "source" | "clip";
  sourceMinHeight?: { value: number; provenance: "official-source" };
  technicalHeight?: { value: number; provenance: "puck-technical" };
  sourceCssVariable?: { name: string; value: string; provenance: "official-contract" };
  aspectRatio?: { value: string; provenance: "official-source" | "official-demo" };
  responsiveFit?: {
    mode: "contain";
    intrinsicWidth: { value: number; provenance: "official-source" };
  };
  surfaceBackground?: {
    value: string;
    provenance: "official-source" | "official-demo";
  };
  runtimeRisk?: "none" | "dom" | "observer" | "resize-observer" | "webgl";
};

export type PuckRegistryManifestEntry = {
  id: string;
  catalogKey: string;
  label: string;
  taxonomy: PuckProductTaxonomy;
  sourceTier: "PRO" | "FREE";
  sourceProvenance: "REGISTRY";
  sourceKind: "component" | "pro-block";
  backgroundCapability: PuckProductionBackgroundCapability;
  textColorCapability: PuckProductionTextColorCapability;
  officialSlug: string;
  physicalSource: string;
  sourcePropKeys: readonly string[];
  rendererSource: string;
  legacyIds: readonly string[];
  editorAdapter: string;
  publicRenderer: string;
  host: PuckProductionHostSpec | null;
  definiteHeight: number | null;
  runtimeFamily: string | null;
  runtimeRealm?: PuckRuntimeRealm;
  interactionPolicy: PuckInteractionPolicy;
  presentationContract?: PuckProductionPresentationContract;
  documentVersions: readonly [1];
  props: Readonly<Record<string, PuckPropRule>>;
  defaults: Readonly<Record<string, unknown>>;
  editorContract?: ComponentEditorContract;
};

const text = (maxLength = 2_000): PrimitivePuckPropRule => ({ kind: "string", maxLength });
const url = (): PrimitivePuckPropRule => ({ kind: "string", maxLength: 2_048, format: "url" });
const color = (): PrimitivePuckPropRule => ({ kind: "string", maxLength: 32, format: "color" });
const choice = (...values: string[]): PrimitivePuckPropRule => ({ kind: "enum", values });
const numeric = (min: number, max: number, editable = false): PrimitivePuckPropRule => ({ kind: "number", min, max, editable });
const nonEditableText = (maxLength = 2_000): PrimitivePuckPropRule => ({ kind: "string", maxLength, editable: false });
const editableArray = (
  properties: Readonly<Record<string, PuckPropRule>>,
  maxItems = 32,
): PuckPropRule => ({ kind: "array", editable: true, maxItems, item: { kind: "object", properties } });

export const PUCK_COMMON_PROP_RULES = {
  id: text(128),
  layoutWidth: choice("full", "wide", "medium", "narrow"),
  paddingY: choice("none", "compact", "normal", "airy"),
  align: choice("left", "center", "right"),
  mobileWidth: choice("inherit", "full", "narrow"),
  mobileHidden: { kind: "boolean" },
  backgroundColor: color(),
  textColor: color(),
  motion: choice("default", "none", "subtle"),
} satisfies Record<string, PuckPropRule>;

export const PUCK_COMMON_DEFAULTS = {
  layoutWidth: "full",
  paddingY: "none",
  align: "left",
  mobileWidth: "inherit",
  mobileHidden: false,
  backgroundColor: "#ffffff",
  textColor: "#171717",
  motion: "default",
} as const;

const generatedByCatalogKey = new Map<string, (typeof PUCK_EXPANDED_REGISTRY_DATA)[number]>(
  PUCK_EXPANDED_REGISTRY_DATA.map((item) => [item.catalogKey, item]),
);

const presentationDimension = (
  value: number,
  provenance: PuckProductionPresentationDimension["provenance"],
): PuckProductionPresentationDimension => ({ value, provenance });

const SOURCE_FILL_SURFACE_GEOMETRY: PuckProductionPresentationSourceGeometry = {
  width: { value: "100%", provenance: "source" },
  height: { value: "100%", provenance: "source" },
  definiteParent: { required: true, provenance: "source" },
};

const fullSurfacePresentation = (
  technicalHeight: number,
): PuckProductionPresentationContract => ({
  target: "componentRoot",
  overflow: "clip",
  provenance: "source",
  sourceGeometry: SOURCE_FILL_SURFACE_GEOMETRY,
  technicalRuntime: {
    height: presentationDimension(technicalHeight, "technicalRuntime"),
  },
  geometry: { kind: "fullSurface" },
});

const intrinsicPresentation = (
  geometry: PuckProductionPresentationGeometry = { kind: "intrinsic" },
): PuckProductionPresentationContract => ({
  target: "componentRoot",
  overflow: "visible",
  provenance: "source",
  geometry,
});

const sourceMinPresentation = (
  minHeight: number,
): PuckProductionPresentationContract => ({
  target: "componentRoot",
  overflow: "visible",
  provenance: "source",
  geometry: {
    kind: "minHeight",
    minHeight: presentationDimension(minHeight, "source"),
  },
});

const viewportPresentation = (): PuckProductionPresentationContract => ({
  target: "componentRoot",
  overflow: "visible",
  provenance: "source",
  geometry: {
    kind: "viewport",
    viewportHeight: { value: "100vh", provenance: "source" },
  },
});

/**
 * Production component scene contracts. This is a catalog data table: the
 * renderer never branches on a component id. Every entry below was checked
 * against its physical root/source measurements before being classified.
 */
const PUCK_PRODUCTION_PRESENTATION_CONTRACTS: Readonly<Record<string, PuckProductionPresentationContract>> = {
  // Parent-sized source roots render directly into the provided host/stage.
  "component:lightspeed": fullSurfacePresentation(480),
  "component:light-droplets": fullSurfacePresentation(480),
  "component:frame-border": {
    ...fullSurfacePresentation(480),
    geometry: {
      kind: "fullSurface",
      aspectRatio: presentationDimension(1.64, "editorPresentationDefault"),
    },
  },
  "starter:flicker-tw": fullSurfacePresentation(480),
  "component:dot-shift": fullSurfacePresentation(480),
  "component:click-stack": fullSurfacePresentation(500),
  "component:glitch-text": fullSurfacePresentation(320),
  "component:bending-marquee": fullSurfacePresentation(520),
  "component:card-spread": fullSurfacePresentation(520),
  "component:tilted-tiles": fullSurfacePresentation(520),
  "component:liquid-ascii": fullSurfacePresentation(480),
  "component:text-cube": fullSurfacePresentation(480),
  "component:cursor-wave": fullSurfacePresentation(480),
  "component:gradient-carousel": fullSurfacePresentation(620),
  "component:vortex": fullSurfacePresentation(480),
  "component:glue-dots": fullSurfacePresentation(480),
  "current-free:glow-cursor": fullSurfacePresentation(480),
  "current-free:particle-text": fullSurfacePresentation(480),
  "current-free:magic-rings": fullSurfacePresentation(480),
  "current-free:strands": fullSurfacePresentation(480),
  "current-free:floating-lines": fullSurfacePresentation(480),

  // Source-authored DOM/content geometry stays natural.
  "control-3:blur-highlight": intrinsicPresentation(),
  "component:credit-card": intrinsicPresentation(),
  "component:device": intrinsicPresentation(),
  "component:page-flip": intrinsicPresentation(),
  "component:skewed-carousel": intrinsicPresentation(),
  "component:tumble-carousel": intrinsicPresentation(),
  "component:modal-cards": intrinsicPresentation(),
  "starter:circle-stack-tw": intrinsicPresentation({
    kind: "intrinsic",
    authoredWidth: presentationDimension(490, "source"),
    authoredHeight: presentationDimension(540, "source"),
  }),
  "starter:rotating-cards-tw": intrinsicPresentation(),

  // The source itself declares these minimum/fixed dimensions.
  "control-3:empty-state-3": sourceMinPresentation(560),
  "control-6:card-2": sourceMinPresentation(560),
  "starter:magic-transform-tw": {
    ...sourceMinPresentation(560),
    editorPresentationDefault: {
      width: presentationDimension(1280, "editorPresentationDefault"),
      height: presentationDimension(560, "editorPresentationDefault"),
    },
  },

  // These components intentionally represent viewport/scroll behavior.
  "component:circle-gallery": viewportPresentation(),
  "component:scroll-stack": viewportPresentation(),
  "starter:scroll-mask-tw": viewportPresentation(),
  "current-free:splash-cursor": viewportPresentation(),
};

function productionPresentationContract(catalogKey: string) {
  return PUCK_PRODUCTION_PRESENTATION_CONTRACTS[catalogKey];
}

type PuckBatch3CatalogKey = keyof typeof PUCK_BATCH_3_EDITOR_CONTRACTS;

const batch3EditorContract = (catalogKey: PuckBatch3CatalogKey): ComponentEditorContract => {
  const contract = PUCK_BATCH_3_EDITOR_CONTRACTS[catalogKey];
  if (!contract) throw new Error(`Missing Batch 3 editor contract: ${catalogKey}`);
  return contract;
};

type PuckBatch4CatalogKey = keyof typeof PUCK_BATCH_4_EDITOR_CONTRACTS;

const batch4EditorContract = (catalogKey: PuckBatch4CatalogKey): ComponentEditorContract => {
  const contract = PUCK_BATCH_4_EDITOR_CONTRACTS[catalogKey];
  if (!contract) throw new Error(`Missing Batch 4 editor contract: ${catalogKey}`);
  return contract;
};

type PilotManifestEntry = Omit<
  PuckRegistryManifestEntry,
  | "documentVersions"
  | "sourceProvenance"
  | "sourceKind"
  | "officialSlug"
  | "physicalSource"
  | "sourcePropKeys"
  | "rendererSource"
  | "legacyIds"
  | "host"
  | "backgroundCapability"
  | "definiteHeight"
  | "runtimeFamily"
  | "textColorCapability"
  | "interactionPolicy"
> & {
  host?: PuckProductionHostSpec | null;
  backgroundCapability?: PuckProductionBackgroundCapability;
  textColorCapability?: PuckProductionTextColorCapability;
};

const NONE_BACKGROUND_CAPABILITY: PuckProductionBackgroundCapability = {
  supported: false,
  target: "none",
};

const NONE_TEXT_COLOR_CAPABILITY: PuckProductionTextColorCapability = {
  supported: false,
  target: "none",
};

/**
 * The manifest is the only production description of where the shared
 * Background field is allowed to render. Host layout metadata such as
 * sourceCssVariable and surfaceBackground remains separate: those values are
 * source fidelity/layout contracts, not editor Background targets.
 *
 * Entries in this table are verified host/source-root contracts. Source prop
 * capabilities are resolved from the generated source schema below so a
 * component cannot receive a shared style field just because common host
 * props happen to exist in the manifest.
 */
export const PUCK_PRODUCTION_BACKGROUND_CAPABILITIES: Readonly<Record<string, PuckProductionBackgroundCapability>> = {
  "pro-block:hero-16": { supported: true, target: "sourceRoot" },
  "pro-block:hero-14": { supported: true, target: "sourceRoot" },
  "pro-block:hero-6": { supported: true, target: "sourceRoot" },
  "pro-block:cta-9": { supported: true, target: "sourceRoot" },
  "pro-block:hero-17": { supported: true, target: "sourceRoot" },
  "pro-block:hero-19": { supported: true, target: "sourceRoot" },
  "pro-block:navigation-4": { supported: true, target: "sourceRoot" },
  "pro-block:cta-8": { supported: true, target: "sourceRoot" },
  "pro-block:navigation-11": { supported: true, target: "sourceRoot" },
  "pro-block:navigation-14": { supported: true, target: "sourceRoot" },
};

/** Optional explicit overrides are reserved for verified semantic targets. */
export const PUCK_PRODUCTION_VISUAL_STYLE_CAPABILITIES: Readonly<Record<string, PuckProductionVisualStyleCapabilities>> = {};

function generatedSourceColorCapability(
  catalogKey: string,
  prop: "backgroundColor" | "textColor",
): PuckProductionBackgroundCapability | PuckProductionTextColorCapability | undefined {
  const sourceProps = generatedByCatalogKey.get(catalogKey)?.props as Readonly<Record<string, PuckPropRule>> | undefined;
  const rule = sourceProps?.[prop];
  return rule?.kind === "string" && rule.format === "color"
    ? { supported: true, target: "sourceProp", prop }
    : undefined;
}

export function puckProductionBackgroundCapability(catalogKey: string): PuckProductionBackgroundCapability {
  const explicit = PUCK_PRODUCTION_VISUAL_STYLE_CAPABILITIES[catalogKey]?.background;
  const sourceProp = generatedSourceColorCapability(catalogKey, "backgroundColor");
  return explicit
    ?? (sourceProp?.target === "sourceProp" ? sourceProp : undefined)
    ?? PUCK_PRODUCTION_BACKGROUND_CAPABILITIES[catalogKey]
    ?? NONE_BACKGROUND_CAPABILITY;
}

export function puckProductionTextColorCapability(catalogKey: string): PuckProductionTextColorCapability {
  const explicit = PUCK_PRODUCTION_VISUAL_STYLE_CAPABILITIES[catalogKey]?.textColor;
  const sourceProp = generatedSourceColorCapability(catalogKey, "textColor");
  return explicit
    ?? (sourceProp?.target === "sourceProp" ? sourceProp : undefined)
    ?? NONE_TEXT_COLOR_CAPABILITY;
}

const HERO_14_EDITOR_CONTRACT = {
  componentId: "reactbits.hero-14",
  defaultProps: {
    rating: "5 stars",
    reviews: "3,000+ reviews",
    headingLine1: "Focus on work.",
    headingLine2: "We handle ops.",
    description: "Streamlined team expenses, automated invoicing, payroll management, and real-time reporting. All in one place.",
    emailPlaceholder: "What's your work email?",
    buttonLabel: "Get started for free",
    linkLabel: "Explore product",
    mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=900&fit=crop",
  },
  fields: [
    { key: "rating", path: ["rating"], group: "CONTENT", label: "Rating", type: "text", originalValue: "5 stars", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "reviews", path: ["reviews"], group: "CONTENT", label: "Reviews", type: "text", originalValue: "3,000+ reviews", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "headingLine1", path: ["headingLine1"], group: "CONTENT", label: "Heading line 1", type: "text", originalValue: "Focus on work.", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "headingLine2", path: ["headingLine2"], group: "CONTENT", label: "Heading line 2", type: "text", originalValue: "We handle ops.", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "description", path: ["description"], group: "CONTENT", label: "Description", type: "textarea", originalValue: "Streamlined team expenses, automated invoicing, payroll management, and real-time reporting. All in one place.", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "emailPlaceholder", path: ["emailPlaceholder"], group: "CONTENT", label: "Email placeholder", type: "text", originalValue: "What's your work email?", inlineEditable: false, mediaEligible: false, resettable: true },
    { key: "buttonLabel", path: ["buttonLabel"], group: "ACTIONS", label: "Primary button label", type: "text", originalValue: "Get started for free", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "linkLabel", path: ["linkLabel"], group: "ACTIONS", label: "Secondary action label", type: "text", originalValue: "Explore product", inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "mediaUrl", path: ["mediaUrl"], group: "MEDIA", label: "Product preview", type: "media", originalValue: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=900&fit=crop", inlineEditable: false, mediaEligible: true, resettable: true },
  ],
  contentFields: ["rating", "reviews", "headingLine1", "headingLine2", "description", "emailPlaceholder"],
  mediaFields: [{ fieldKey: "mediaUrl", path: ["mediaUrl"], originalValue: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=900&fit=crop", allowManualUrl: true, allowLibrarySelection: true, uploadSupported: false }],
  actionFields: ["buttonLabel", "linkLabel"],
  arrays: [],
  inlineFields: [
    { fieldKey: "rating", path: ["rating"], valueType: "text" },
    { fieldKey: "reviews", path: ["reviews"], valueType: "text" },
    { fieldKey: "headingLine1", path: ["headingLine1"], valueType: "text" },
    { fieldKey: "headingLine2", path: ["headingLine2"], valueType: "text" },
    { fieldKey: "description", path: ["description"], valueType: "textarea" },
    { fieldKey: "buttonLabel", path: ["buttonLabel"], valueType: "text" },
    { fieldKey: "linkLabel", path: ["linkLabel"], valueType: "text" },
  ],
  nativePuck: { fields: ["headingLine1"] },
} as const satisfies ComponentEditorContract;

const entry = (input: PilotManifestEntry): PuckRegistryManifestEntry => {
  const generated = generatedByCatalogKey.get(input.catalogKey);
  if (!generated) throw new Error(`Missing generated production source metadata: ${input.catalogKey}`);
  return {
  ...input,
  documentVersions: [1],
  sourceProvenance: "REGISTRY",
  sourceKind: generated.sourceKind,
  backgroundCapability: input.backgroundCapability ?? puckProductionBackgroundCapability(input.catalogKey),
  textColorCapability: input.textColorCapability ?? puckProductionTextColorCapability(input.catalogKey),
  officialSlug: generated.officialSlug,
  physicalSource: generated.physicalSource,
  sourcePropKeys: Object.keys(input.props),
  rendererSource: generated.rendererSource,
  legacyIds: generated.legacyIds,
  host: input.host ?? generated.host as PuckProductionHostSpec | null,
  definiteHeight: generated.definiteHeight,
  runtimeFamily: generated.runtimeFamily,
  interactionPolicy: resolvePuckInteractionPolicy(input.catalogKey),
  ...(productionPresentationContract(input.catalogKey)
    ? { presentationContract: productionPresentationContract(input.catalogKey) }
    : {}),
  props: { ...PUCK_COMMON_PROP_RULES, ...input.props },
  defaults: { ...PUCK_COMMON_DEFAULTS, ...input.defaults },
  };
};

export const PUCK_PILOT_BASELINE_MANIFEST = [
  entry({
    id: "reactbits.navigation-12",
    catalogKey: "pro-block:navigation-12",
    label: "Navigation 12",
    taxonomy: "Navigation",
    sourceTier: "PRO",
    editorAdapter: "adapted-navigation-12",
    publicRenderer: "adapted-navigation-12",
    props: {
      primaryNavLabel: text(160),
      mobileNavLabel: text(160),
      brandName: text(120),
      brandHref: text(2_048),
      signInLabel: text(120),
      signInHref: text(2_048),
      primaryActionLabel: text(120),
      primaryActionHref: text(2_048),
      openMenuLabel: text(120),
      closeMenuLabel: text(120),
      links: editableArray({ label: text(120) }, 8),
    },
    defaults: batch3EditorContract("pro-block:navigation-12").defaultProps,
    editorContract: batch3EditorContract("pro-block:navigation-12"),
  }),
  entry({
    id: "reactbits.hero-14",
    catalogKey: "pro-block:hero-14",
    label: "Hero 14",
    taxonomy: "Hero",
    sourceTier: "PRO",
    editorAdapter: "adapted-hero-14",
    publicRenderer: "adapted-hero-14",
    props: {
      rating: text(80),
      reviews: text(120),
      headingLine1: text(160),
      headingLine2: text(160),
      description: text(1_000),
      emailPlaceholder: text(160),
      buttonLabel: text(120),
      linkLabel: text(120),
      mediaUrl: url(),
    },
    defaults: {
      rating: "5 stars",
      reviews: "3,000+ reviews",
      headingLine1: "Focus on work.",
      headingLine2: "We handle ops.",
      description: "Streamlined team expenses, automated invoicing, payroll management, and real-time reporting. All in one place.",
      emailPlaceholder: "What's your work email?",
      buttonLabel: "Get started for free",
      linkLabel: "Explore product",
      mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=900&fit=crop",
    },
    editorContract: HERO_14_EDITOR_CONTRACT,
  }),
  entry({
    id: "reactbits.cta-9",
    catalogKey: "pro-block:cta-9",
    label: "CTA 9",
    taxonomy: "CTA",
    sourceTier: "PRO",
    editorAdapter: "adapted-cta-9",
    publicRenderer: "adapted-cta-9",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "dom" },
    props: {
      heading: text(240),
      description: text(1_000),
      buttonLabel: text(120),
      leftCardImage: url(),
      leftCardHeadline: text(240),
      leftCardMeta: text(160),
      rightCardContext: text(240),
      rightCardTitle: text(160),
      rightCardDescription: text(1_000),
    },
    defaults: batch4EditorContract("pro-block:cta-9").defaultProps,
    editorContract: batch4EditorContract("pro-block:cta-9"),
  }),
  entry({
    id: "reactbits.pricing-3",
    catalogKey: "pro-block:pricing-3",
    label: "Pricing 3",
    taxonomy: "Pricing",
    sourceTier: "PRO",
    editorAdapter: "adapted-pricing-3",
    publicRenderer: "adapted-pricing-3",
    props: {
      plans: {
        kind: "array",
        maxItems: 6,
        item: {
          kind: "object",
          properties: {
            title: text(120),
            description: text(1_000),
            price: text(80),
            suffix: text(40),
            limit: text(160),
            ctaLabel: text(120),
          },
        },
      },
    },
    defaults: {
      plans: [
        { title: "Free", description: "Get started with essential analytics. Perfect for personal projects and early-stage startups.", price: "Free", suffix: "/mo.", limit: "Up to 10K events/month", ctaLabel: "Get started" },
        { title: "Pro", description: "Advanced analytics and insights for growing teams. Scale with confidence.", price: "$49", suffix: "/mo.", limit: "Up to 500K events/month", ctaLabel: "See packages" },
        { title: "Enterprise", description: "Custom solutions with dedicated support for high-traffic applications.", price: "Custom", suffix: "", limit: "Unlimited events", ctaLabel: "Talk to sales" },
      ],
    },
  }),
  entry({
    id: "reactbits.social-proof-10",
    catalogKey: "pro-block:social-proof-10",
    label: "Social Proof 10",
    taxonomy: "Social Proof / Testimonials",
    sourceTier: "PRO",
    editorAdapter: "official-social-proof-10",
    publicRenderer: "official-social-proof-10",
    props: {},
    defaults: {},
  }),
  entry({
    id: "reactbits.scheduling-3",
    catalogKey: "pro-block:scheduling-3",
    label: "Scheduling 3",
    taxonomy: "Scheduling",
    sourceTier: "PRO",
    editorAdapter: "official-scheduling-3",
    publicRenderer: "official-scheduling-3",
    props: {},
    defaults: {},
  }),
  entry({
    id: "reactbits.contact-6",
    catalogKey: "pro-block:contact-6",
    label: "Contact 6",
    taxonomy: "Contact",
    sourceTier: "PRO",
    editorAdapter: "adapted-contact-6",
    publicRenderer: "adapted-contact-6",
    props: {
      heading: text(240),
      description: text(1_000),
      primaryActionLabel: text(160),
    },
    defaults: {
      heading: "Still wondering\nabout something?",
      description: "Drop us a line any time and a real person will get back to you within a business day.",
      primaryActionLabel: "hello@northwind.com",
    },
  }),
  entry({
    id: "reactbits.glow-cursor",
    catalogKey: "current-free:glow-cursor",
    label: "Glow Cursor",
    taxonomy: "Cursor / Pointer",
    sourceTier: "FREE",
    editorAdapter: "official-glow-cursor",
    publicRenderer: "official-glow-cursor",
    props: {
      color: color(),
      secondaryColor: color(),
      trailLength: { kind: "number", min: 2, max: 64 },
      trailWidth: { kind: "number", min: 0.1, max: 64 },
      followSpeed: { kind: "number", min: 0.01, max: 0.99 },
      opacity: { kind: "number", min: 0, max: 1 },
      pulseSpeed: { kind: "number", min: 0, max: 20 },
      idleFade: { kind: "boolean" },
      blendMode: choice("screen", "normal", "plus-lighter"),
      enabled: { kind: "boolean" },
    },
    defaults: {
      color: "#67E8F9",
      secondaryColor: "#A78BFA",
      trailLength: 40,
      trailWidth: 8,
      followSpeed: 0.16,
      opacity: 1,
      pulseSpeed: 1.1,
      idleFade: true,
      blendMode: "screen",
      enabled: true,
    },
  }),
] as const satisfies readonly PuckRegistryManifestEntry[];

const pilotCatalogKeys = new Set(
  PUCK_PILOT_BASELINE_MANIFEST.map((item) => item.catalogKey),
);
const runtimeExcludedIds = new Set<string>(
  PUCK_PRODUCTION_RUNTIME_EXCLUSIONS.map((item) => item.id),
);

const hero6SlidesPropRule = {
  kind: "array",
  required: true,
  maxItems: 3,
  item: {
    kind: "object",
    properties: {
      title: text(160),
      subtitle: text(160),
      description: text(1_000),
      image: url(),
      color: { kind: "string", maxLength: 80, editable: false },
    },
  },
} as const satisfies PuckPropRule;

const hero6EditorContract = {
  componentId: "RB_batch7_hero_6",
  defaultProps: { slides: hero6SlidesDefaults },
  fields: [],
  contentFields: [],
  mediaFields: [],
  actionFields: [],
  inlineFields: [],
  arrays: [
    {
      key: "slides",
      path: ["slides"],
      group: "CONTENT",
      label: "Slides",
      itemLabel: "Slide",
      defaultItems: hero6SlidesDefaults,
      itemFields: [
        {
          key: "title",
          path: ["title"],
          group: "CONTENT",
          label: "Title",
          type: "text",
          inlineEditable: true,
          mediaEligible: false,
          resettable: true,
        },
        {
          key: "subtitle",
          path: ["subtitle"],
          group: "CONTENT",
          label: "Subtitle",
          type: "text",
          inlineEditable: true,
          mediaEligible: false,
          resettable: true,
        },
        {
          key: "description",
          path: ["description"],
          group: "CONTENT",
          label: "Description",
          type: "textarea",
          inlineEditable: true,
          mediaEligible: false,
          resettable: true,
        },
        {
          key: "image",
          path: ["image"],
          group: "MEDIA",
          label: "Image",
          type: "media",
          inlineEditable: false,
          mediaEligible: true,
          resettable: true,
        },
      ],
    },
  ],
  nativePuck: { arrays: ["slides"] },
} as const satisfies ComponentEditorContract;

const HERO6_OVERRIDE = {
  props: { slides: hero6SlidesPropRule },
  defaults: { slides: hero6SlidesDefaults },
  editorContract: hero6EditorContract,
} as const;

const PUCK_PRODUCTION_EDITOR_CONTRACTS: Readonly<Partial<Record<string, ComponentEditorContract>>> = {
  ...PUCK_BATCH_1_EDITOR_CONTRACTS,
  ...PUCK_BATCH_2_EDITOR_CONTRACTS,
  ...PUCK_BATCH_3_EDITOR_CONTRACTS,
  ...PUCK_BATCH_4_EDITOR_CONTRACTS,
};

type PuckProductionManifestOverride = Partial<Pick<
  PuckRegistryManifestEntry,
  | "editorAdapter"
  | "publicRenderer"
  | "rendererSource"
  | "host"
  | "props"
  | "defaults"
  | "runtimeRealm"
  | "presentationContract"
>>;

const PUCK_PRODUCTION_MANIFEST_OVERRIDES: Readonly<Record<string, PuckProductionManifestOverride>> = {
  "control-6:text-scatter-tw": {
    // The official demo is:
    // <div className="flex min-h-[400px] items-center justify-center">
    //   <TextScatter className="text-4xl md:text-6xl font-bold text-center tracking-tighter" as="h2" />
    // </div>
    // The wrapper semantics belong on the shared presentation root;
    // the source-supported className/as props stay deliberately non-editable.
    presentationContract: {
      target: "componentRoot",
      rootLayout: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      overflow: "visible",
      provenance: "officialDemo",
      geometry: {
        kind: "minHeight",
        minHeight: presentationDimension(400, "officialDemo"),
      },
      officialExampleProps: {
        text: "Bounce Back.",
        className: "text-4xl md:text-6xl font-bold text-center tracking-tighter",
        as: "h2",
        velocity: 200,
        rotation: 90,
        scale: 1,
        duration: 2,
        returnAfter: 1,
        provenance: "officialExample",
      },
    },
    props: {
      className: nonEditableText(240),
      as: nonEditableText(16),
    },
    defaults: {
      className: "text-4xl md:text-6xl font-bold text-center tracking-tighter",
      as: "h2",
    },
  },
  // These two official sources use browser globals for their WebGL/canvas
  // runtime. Keep the capability in metadata so all render surfaces can use
  // the same iframe-native boundary without source-specific branches.
  "current-free:magic-rings": {
    runtimeRealm: "iframeNative",
  },
  "current-free:splash-cursor": {
    runtimeRealm: "iframeNative",
  },
  "pro-block:hero-8": {
    editorAdapter: "adapted-hero-8",
    publicRenderer: "adapted-hero-8",
    rendererSource: "@/components/puck-site-editor/adapted-library/hero/hero-8",
    props: {
      firstLeft: text(160),
      firstRight: text(160),
      secondLeft: text(160),
      secondRight: text(160),
      description: text(1_000),
      creatingImageAlt: text(240),
      buildingImageAlt: text(240),
      heroImageUrl: url(),
      heroImageAlt: text(240),
      creatingImages: editableArray({ url: url(), aspectRatio: numeric(0.5, 3) }, 8),
      buildingImages: editableArray({ url: url(), aspectRatio: numeric(0.5, 3) }, 8),
    },
    defaults: batch3EditorContract("pro-block:hero-8").defaultProps,
  },
  "pro-block:hero-10": {
    editorAdapter: "adapted-hero-10",
    publicRenderer: "adapted-hero-10",
    rendererSource: "@/components/puck-site-editor/adapted-library/hero/hero-10",
    props: {
      heading: text(240),
      description: text(1_000),
      buttonLabel: text(120),
      cards: editableArray({
        rotate: numeric(-180, 180),
        translateY: numeric(-500, 500),
        src: url(),
        alt: text(240),
      }, 8),
    },
    defaults: batch3EditorContract("pro-block:hero-10").defaultProps,
  },
  "pro-block:hero-20": {
    editorAdapter: "adapted-hero-20",
    publicRenderer: "adapted-hero-20",
    rendererSource: "@/components/puck-site-editor/adapted-library/hero/hero-20",
    props: {
      heading: text(240),
      description: text(1_000),
      primaryButtonLabel: text(120),
      secondaryButtonLabel: text(120),
      trustLabel: text(240),
      wordmarks: editableArray({ name: text(120), className: nonEditableText(240) }, 12),
      metrics: editableArray({ value: text(120), label: text(240) }, 8),
    },
    defaults: batch3EditorContract("pro-block:hero-20").defaultProps,
  },
  "pro-block:cta-11": {
    editorAdapter: "adapted-cta-11",
    publicRenderer: "adapted-cta-11",
    rendererSource: "@/components/puck-site-editor/adapted-library/cta/cta-11",
    props: {
      eyebrow: text(240),
      heading: text(240),
      description: text(1_000),
      primaryButtonLabel: text(120),
      primaryButtonHref: text(2_048),
      secondaryButtonLabel: text(120),
      secondaryButtonHref: text(2_048),
      helperText: text(320),
      balanceLabel: text(160),
      balanceCurrency: text(40),
      balanceValue: text(120),
      settledTodayLabel: text(160),
      moveFundsLabel: text(120),
      ledger: editableArray({ label: text(160), meta: text(160), amount: text(120), status: text(120) }, 12),
      loop: { kind: "boolean" },
    },
    defaults: batch3EditorContract("pro-block:cta-11").defaultProps,
  },
  "pro-block:cta-14": {
    editorAdapter: "adapted-cta-14",
    publicRenderer: "adapted-cta-14",
    rendererSource: "@/components/puck-site-editor/adapted-library/cta/cta-14",
    props: {
      eyebrow: text(240),
      heading: text(240),
      description: text(1_000),
      primaryButtonLabel: text(120),
      primaryButtonHref: text(2_048),
      secondaryButtonLabel: text(120),
      secondaryButtonHref: text(2_048),
      helperText: text(320),
      collaborationLabel: text(160),
      liveLabel: text(160),
      capabilities: editableArray({ label: text(160) }, 32),
      activity: editableArray({ initials: text(16), name: text(120), action: text(240), time: text(40) }, 12),
      loop: { kind: "boolean" },
    },
    defaults: batch3EditorContract("pro-block:cta-14").defaultProps,
  },
  "pro-block:navigation-5": {
    editorAdapter: "adapted-navigation-5",
    publicRenderer: "adapted-navigation-5",
    rendererSource: "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-5",
    props: {
      mainHeading: text(240),
      mainDescription: text(500),
      brandMessage: text(240),
      contactLabel: text(120),
      contactHref: text(2_048),
      openMenuLabel: text(120),
      closeMenuLabel: text(120),
      currentPageLabel: text(120),
      navItems: editableArray({ title: text(160), image: url(), href: text(2_048) }, 12),
      socialLinks: editableArray({ name: text(120), href: text(2_048) }, 12),
    },
    defaults: batch3EditorContract("pro-block:navigation-5").defaultProps,
  },
  "pro-block:navigation-6": {
    editorAdapter: "adapted-navigation-6",
    publicRenderer: "adapted-navigation-6",
    rendererSource: "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-6",
    props: {
      logoUrl: url(),
      logoAlt: text(240),
      homeAriaLabel: text(160),
      logoHref: text(2_048),
      mainNavigationLabel: text(160),
      navigationMenuLabel: text(160),
      mainMenuLabel: text(160),
      footerNavigationLabel: text(160),
      openNavigationLabel: text(160),
      closeNavigationLabel: text(160),
      menuButtonLabel: text(120),
      closeButtonLabel: text(120),
      copyright: text(240),
      technologyNote: text(240),
      menuItems: editableArray({ label: text(160), href: text(2_048), image: url() }, 12),
      topNavItems: editableArray({ label: text(160), href: text(2_048) }, 12),
      footerLinks: editableArray({ label: text(160), href: text(2_048) }, 12),
    },
    defaults: batch3EditorContract("pro-block:navigation-6").defaultProps,
  },
  "pro-block:navigation-13": {
    editorAdapter: "adapted-navigation-13",
    publicRenderer: "adapted-navigation-13",
    rendererSource: "@/components/puck-site-editor/adapted/navigation-13",
    host: {
      profile: "section",
      width: "full",
      height: "intrinsic",
      overflow: "source",
      runtimeRisk: "dom",
    },
    props: {
      brandName: text(120),
      brandHref: text(2_048),
      primaryActionLabel: text(120),
      primaryActionHref: text(2_048),
      contactEyebrow: text(120),
      contactEmail: text(320),
      secondaryActionLabel: text(120),
      secondaryActionHref: text(2_048),
      links: {
        kind: "array",
        editable: true,
        maxItems: 8,
        item: {
          kind: "object",
          properties: {
            label: text(80),
            href: text(2_048),
          },
        },
      },
    },
    defaults: navigation13EditorContract.defaultProps,
  },
  "pro-block:hero-16": {
    editorAdapter: "adapted-hero-16",
    publicRenderer: "adapted-hero-16",
    rendererSource: "@/components/puck-site-editor/adapted-library/hero/hero-16",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "none" },
    props: {
      logoUrl: url(),
      logoAlt: text(240),
      headingLine1: text(240),
      headingLine2: text(240),
      headingLine3: text(240),
      description: text(1_000),
      primaryButtonLabel: text(160),
      primaryButtonHref: text(2_048),
      secondaryButtonHref: text(2_048),
    },
    defaults: batch4EditorContract("pro-block:hero-16").defaultProps,
  },
  "pro-block:hero-17": {
    editorAdapter: "adapted-hero-17",
    publicRenderer: "adapted-hero-17",
    rendererSource: "@/components/puck-site-editor/adapted-library/hero/hero-17",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "none" },
    props: {
      badge: text(240),
      headingLine1: text(240),
      headingLine2: text(240),
      description: text(1_000),
      buttonLabel: text(160),
      heroImageUrl: url(),
      heroImageAlt: text(240),
      gallery: editableArray({ src: url(), alt: text(240) }, 8),
    },
    defaults: batch4EditorContract("pro-block:hero-17").defaultProps,
  },
  "pro-block:hero-19": {
    editorAdapter: "adapted-hero-19",
    publicRenderer: "adapted-hero-19",
    rendererSource: "@/components/puck-site-editor/adapted-library/hero/hero-19",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "dom" },
    props: {
      eyebrow: text(240),
      heading: text(240),
      description: text(1_000),
      primaryButtonLabel: text(160),
      secondaryButtonLabel: text(160),
      securityTrustLabel: text(160),
      launchTrustLabel: text(160),
      billingRunLabel: text(160),
      billingRunMeta: text(240),
      billingStatusLabel: text(120),
      recognizedLabel: text(240),
      recognizedValue: text(120),
      recognizedPercent: numeric(0, 100, true),
      recognizedPlanLabel: text(240),
      paymentReceivedLabel: text(160),
      paymentReceivedDetail: text(240),
      approvalCompleteLabel: text(160),
      approvalCompleteDetail: text(240),
      invoices: editableArray({
        initials: text(16),
        name: text(160),
        terms: text(160),
        status: text(120),
      }, 12),
    },
    defaults: batch4EditorContract("pro-block:hero-19").defaultProps,
  },
  "pro-block:navigation-4": {
    editorAdapter: "adapted-navigation-4",
    publicRenderer: "adapted-navigation-4",
    rendererSource: "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-4",
    host: { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" },
    props: {
      mobileBrandLine1: text(160),
      mobileBrandLine2: text(160),
      desktopBrandLine1: text(160),
      desktopBrandLine2: text(160),
      openMenuLabel: text(120),
      closeMenuLabel: text(120),
      navItems: editableArray({
        iconToken: choice("home", "works", "profile", "contact"),
        label: text(160),
        href: text(2_048),
      }, 8),
    },
    defaults: batch4EditorContract("pro-block:navigation-4").defaultProps,
  },
  "pro-block:cta-8": {
    editorAdapter: "adapted-cta-8",
    publicRenderer: "adapted-cta-8",
    rendererSource: "@/components/puck-site-editor/adapted-library/cta-8",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "dom" },
    props: {
      buttonLabel: text(160),
      trialLabel: text(240),
      word: text(120),
    },
    defaults: batch4EditorContract("pro-block:cta-8").defaultProps,
  },
  "pro-block:navigation-11": {
    editorAdapter: "adapted-navigation-11",
    publicRenderer: "adapted-navigation-11",
    rendererSource: "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-11",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "dom" },
    props: {
      brandName: text(120),
      loginLabel: text(120),
      loginHref: text(2_048),
      primaryActionLabel: text(160),
      primaryActionHref: text(2_048),
      openMenuLabel: text(120),
      closeMenuLabel: text(120),
      sectionGroups: editableArray({ label: text(120), heading: text(160) }, 8),
      cards: editableArray({
        sectionLabel: text(120),
        title: text(160),
        desc: text(500),
        img: url(),
        href: text(2_048),
      }, 32),
      footerPartnerLinks: editableArray({ label: text(200), href: text(2_048) }, 12),
      footerLegalLinks: editableArray({ label: text(200), href: text(2_048) }, 12),
    },
    defaults: batch4EditorContract("pro-block:navigation-11").defaultProps,
  },
  "pro-block:navigation-14": {
    editorAdapter: "adapted-navigation-14",
    publicRenderer: "adapted-navigation-14",
    rendererSource: "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-14",
    host: { profile: "section", width: "full", height: "intrinsic", overflow: "source", runtimeRisk: "dom" },
    props: {
      brandName: text(120),
      brandHref: text(2_048),
      pricingLabel: text(120),
      pricingHref: text(2_048),
      loginLabel: text(120),
      loginHref: text(2_048),
      primaryActionLabel: text(160),
      primaryActionHref: text(2_048),
      openMenuLabel: text(120),
      closeMenuLabel: text(120),
      learnMoreLabel: text(160),
      sectionGroups: editableArray({
        label: text(120),
        featuredTag: text(120),
        featuredTitle: text(240),
        featuredDescription: text(1_000),
        featuredHref: text(2_048),
      }, 8),
      items: editableArray({
        sectionLabel: text(120),
        iconToken: choice("dashboard", "log", "radar", "trend", "workflow", "compass", "book", "file", "chart"),
        title: text(200),
        description: text(500),
        href: text(2_048),
      }, 32),
    },
    defaults: batch4EditorContract("pro-block:navigation-14").defaultProps,
  },
};

const expandedEntry = (
  generated: (typeof PUCK_EXPANDED_REGISTRY_DATA)[number],
): PuckRegistryManifestEntry => {
  const override = PUCK_PRODUCTION_MANIFEST_OVERRIDES[generated.catalogKey];
  const editorContract = generated.id === "RB_batch7_hero_6"
    ? HERO6_OVERRIDE.editorContract
    : PUCK_PRODUCTION_EDITOR_CONTRACTS[generated.catalogKey];
  const presentationContract = override?.presentationContract
    ?? productionPresentationContract(generated.catalogKey);
  return {
    id: generated.id,
    catalogKey: generated.catalogKey,
    label: generated.label,
    taxonomy: generated.taxonomy,
    sourceTier: generated.sourceTier,
    sourceProvenance: "REGISTRY",
    sourceKind: generated.sourceKind,
    backgroundCapability: puckProductionBackgroundCapability(generated.catalogKey),
    textColorCapability: puckProductionTextColorCapability(generated.catalogKey),
    officialSlug: generated.officialSlug,
    physicalSource: generated.physicalSource,
    sourcePropKeys: [...new Set([
      ...Object.keys(generated.props),
      ...Object.keys(override?.props ?? {}),
    ])],
    rendererSource: override?.rendererSource ?? generated.rendererSource,
    legacyIds: generated.legacyIds,
    editorAdapter: override?.editorAdapter ?? "production-source",
    publicRenderer: override?.publicRenderer ?? "production-source",
    host: (override?.host ?? generated.host) as PuckProductionHostSpec | null,
    definiteHeight: generated.definiteHeight,
    runtimeFamily: generated.runtimeFamily,
    interactionPolicy: resolvePuckInteractionPolicy(generated.catalogKey),
    ...(override?.runtimeRealm ? { runtimeRealm: override.runtimeRealm } : {}),
    ...(presentationContract ? { presentationContract } : {}),
    documentVersions: [1],
    props: {
      ...PUCK_COMMON_PROP_RULES,
      ...(override?.props ?? (generated.id === "RB_batch7_hero_6"
        ? HERO6_OVERRIDE.props
        : generated.props as Readonly<Record<string, PuckPropRule>>)),
    },
    defaults: {
      ...PUCK_COMMON_DEFAULTS,
      ...(override?.defaults ?? (generated.id === "RB_batch7_hero_6" ? HERO6_OVERRIDE.defaults : generated.defaults)),
    },
    ...(editorContract ? { editorContract } : {}),
  };
};

export const PUCK_PRODUCTION_MANIFEST: readonly PuckRegistryManifestEntry[] = [
  ...PUCK_PILOT_BASELINE_MANIFEST,
  ...PUCK_EXPANDED_REGISTRY_DATA
    .filter((item) => !pilotCatalogKeys.has(item.catalogKey) && !runtimeExcludedIds.has(item.id))
    .map(expandedEntry),
];

export type PuckProductionComponentId = (typeof PUCK_PRODUCTION_MANIFEST)[number]["id"];

export const PUCK_PRODUCTION_MANIFEST_BY_ID = new Map(
  PUCK_PRODUCTION_MANIFEST.flatMap((item) => [
    [item.id, item] as const,
    ...item.legacyIds.map((legacyId) => [legacyId, item] as const),
  ]),
);

const duplicate = (values: readonly string[]) =>
  values.find((value, index) => values.indexOf(value) !== index);
const duplicateId = duplicate(PUCK_PRODUCTION_MANIFEST.map((item) => item.id));
const duplicateCatalogKey = duplicate(PUCK_PRODUCTION_MANIFEST.map((item) => item.catalogKey));

if (duplicateId || duplicateCatalogKey) {
  throw new Error(`Duplicate production Puck registry identity: ${duplicateId ?? duplicateCatalogKey}`);
}
