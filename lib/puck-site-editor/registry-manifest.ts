import { PUCK_EXPANDED_REGISTRY_DATA } from "./generated-registry-data.ts";
import type { ComponentEditorContract } from "./builder-contract.ts";
import { hero6SlidesDefaults } from "../../components/puck-site-editor/adapted/hero-6-contract.ts";
import type { ProductLibraryCategory } from "./product-library.ts";
import { PUCK_PRODUCTION_RUNTIME_EXCLUSIONS } from "./runtime-exclusions.ts";

export const PUCK_REGISTRY_VERSION = "onestudio-puck-1" as const;

export type PuckProductTaxonomy = ProductLibraryCategory;

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
  officialSlug: string;
  physicalSource: string;
  rendererSource: string;
  legacyIds: readonly string[];
  editorAdapter: string;
  publicRenderer: string;
  host: PuckProductionHostSpec | null;
  definiteHeight: number | null;
  runtimeFamily: string | null;
  documentVersions: readonly [1];
  props: Readonly<Record<string, PuckPropRule>>;
  defaults: Readonly<Record<string, unknown>>;
  editorContract?: ComponentEditorContract;
};

const text = (maxLength = 2_000): PrimitivePuckPropRule => ({ kind: "string", maxLength });
const url = (): PrimitivePuckPropRule => ({ kind: "string", maxLength: 2_048, format: "url" });
const color = (): PrimitivePuckPropRule => ({ kind: "string", maxLength: 32, format: "color" });
const choice = (...values: string[]): PrimitivePuckPropRule => ({ kind: "enum", values });

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

type PilotManifestEntry = Omit<
  PuckRegistryManifestEntry,
  | "documentVersions"
  | "sourceProvenance"
  | "sourceKind"
  | "officialSlug"
  | "physicalSource"
  | "rendererSource"
  | "legacyIds"
  | "host"
  | "definiteHeight"
  | "runtimeFamily"
>;

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
} as const satisfies ComponentEditorContract;

const entry = (input: PilotManifestEntry): PuckRegistryManifestEntry => {
  const generated = generatedByCatalogKey.get(input.catalogKey);
  if (!generated) throw new Error(`Missing generated production source metadata: ${input.catalogKey}`);
  return {
  ...input,
  documentVersions: [1],
  sourceProvenance: "REGISTRY",
  sourceKind: generated.sourceKind,
  officialSlug: generated.officialSlug,
  physicalSource: generated.physicalSource,
  rendererSource: generated.rendererSource,
  legacyIds: generated.legacyIds,
  host: generated.host as PuckProductionHostSpec | null,
  definiteHeight: generated.definiteHeight,
  runtimeFamily: generated.runtimeFamily,
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
      links: {
        kind: "array",
        maxItems: 8,
        item: { kind: "object", properties: { label: text(80) } },
      },
    },
    defaults: {
      links: [
        { label: "Overview" },
        { label: "Product" },
        { label: "Customers" },
        { label: "Pricing" },
      ],
    },
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
    props: {
      heading: text(240),
      description: text(1_000),
      buttonLabel: text(120),
    },
    defaults: {
      heading: "Ready to make the switch?",
      description: "Bring your workspace over in minutes — we’ll handle the heavy lifting.",
      buttonLabel: "Request a free migration",
    },
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
} as const satisfies ComponentEditorContract;

const HERO6_OVERRIDE = {
  props: { slides: hero6SlidesPropRule },
  defaults: { slides: hero6SlidesDefaults },
  editorContract: hero6EditorContract,
} as const;

const expandedEntry = (
  generated: (typeof PUCK_EXPANDED_REGISTRY_DATA)[number],
): PuckRegistryManifestEntry => ({
  id: generated.id,
  catalogKey: generated.catalogKey,
  label: generated.label,
  taxonomy: generated.taxonomy,
  sourceTier: generated.sourceTier,
  sourceProvenance: "REGISTRY",
  sourceKind: generated.sourceKind,
  officialSlug: generated.officialSlug,
  physicalSource: generated.physicalSource,
  rendererSource: generated.rendererSource,
  legacyIds: generated.legacyIds,
  editorAdapter: "production-source",
  publicRenderer: "production-source",
  host: generated.host as PuckProductionHostSpec | null,
  definiteHeight: generated.definiteHeight,
  runtimeFamily: generated.runtimeFamily,
  documentVersions: [1],
  props: {
    ...PUCK_COMMON_PROP_RULES,
    ...(generated.id === "RB_batch7_hero_6"
      ? HERO6_OVERRIDE.props
      : generated.props as Readonly<Record<string, PuckPropRule>>),
  },
  defaults: {
    ...PUCK_COMMON_DEFAULTS,
    ...(generated.id === "RB_batch7_hero_6" ? HERO6_OVERRIDE.defaults : generated.defaults),
  },
  ...(generated.id === "RB_batch7_hero_6" ? { editorContract: HERO6_OVERRIDE.editorContract } : {}),
});

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
