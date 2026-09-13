import {
  PUCK_PRODUCTION_MANIFEST,
  type PuckRegistryManifestEntry,
} from "./puck-site-editor/registry-manifest";

export const PUBLIC_COMPONENT_CATEGORIES = [
  "Hero",
  "Navigation",
  "Features",
  "Galleries / Media",
  "Social Proof",
  "Forms",
  "CTA",
  "Pricing",
  "FAQ / Content",
  "Typography",
  "Backgrounds",
  "Motion",
  "Interactive",
  "App Shell / Layout",
] as const;

export type PublicComponentCategory = (typeof PUBLIC_COMPONENT_CATEGORIES)[number];

export type PublicPreviewMode = "runtime" | "fallback";

export type PublicComponentVariant = Pick<
  PuckRegistryManifestEntry,
  "id" | "catalogKey" | "label" | "officialSlug" | "taxonomy" | "sourceTier" | "defaults"
> & {
  category: PublicComponentCategory;
  previewMode: PublicPreviewMode;
  previewReason?: string;
};

export type PublicComponentFamily = {
  id: string;
  name: string;
  category: PublicComponentCategory;
  variants: readonly PublicComponentVariant[];
  defaultVariant: PublicComponentVariant;
};

function categoryForTaxonomy(taxonomy: PuckRegistryManifestEntry["taxonomy"]): PublicComponentCategory {
  if (taxonomy === "Hero") return "Hero";
  if (taxonomy === "Navigation") return "Navigation";
  if (taxonomy === "Features" || taxonomy === "Lists" || taxonomy === "Cards") return "Features";
  if (taxonomy === "Showcase / Gallery" || taxonomy === "Blog" || taxonomy === "Ecommerce") return "Galleries / Media";
  if (taxonomy === "Social Proof / Testimonials") return "Social Proof";
  if (taxonomy === "Forms" || taxonomy === "Contact" || taxonomy === "Scheduling") return "Forms";
  if (taxonomy === "CTA") return "CTA";
  if (taxonomy === "Pricing") return "Pricing";
  if (taxonomy === "Content") return "FAQ / Content";
  if (taxonomy === "Text Effects") return "Typography";
  if (taxonomy === "Backgrounds") return "Backgrounds";
  if (taxonomy === "Animations") return "Motion";
  if (taxonomy === "Cursor / Pointer" || taxonomy === "Carousel / Slider") return "Interactive";
  return "App Shell / Layout";
}

function familyId(officialSlug: string) {
  return officialSlug.replace(/-\d+$/, "");
}

function previewMetadata(entry: PuckRegistryManifestEntry): Pick<PublicComponentVariant, "previewMode" | "previewReason"> {
  if (entry.runtimeRealm === "iframeNative") {
    return { previewMode: "fallback", previewReason: "Requires an isolated runtime" };
  }
  if (entry.host?.runtimeRisk === "webgl") {
    return { previewMode: "fallback", previewReason: "Requires a WebGL preview surface" };
  }
  return { previewMode: "runtime" };
}

const variants = PUCK_PRODUCTION_MANIFEST.map((entry): PublicComponentVariant => ({
  id: entry.id,
  catalogKey: entry.catalogKey,
  label: entry.label,
  officialSlug: entry.officialSlug,
  taxonomy: entry.taxonomy,
  sourceTier: entry.sourceTier,
  defaults: entry.defaults,
  category: categoryForTaxonomy(entry.taxonomy),
  ...previewMetadata(entry),
}));

const families = new Map<string, PublicComponentVariant[]>();
for (const variant of variants) {
  const id = familyId(variant.officialSlug);
  families.set(id, [...(families.get(id) ?? []), variant]);
}

export const publicComponentCatalog: readonly PublicComponentFamily[] = [...families]
  .map(([id, familyVariants]) => {
    const defaultVariant = familyVariants[0];
    if (!defaultVariant) throw new Error(`Public component family ${id} has no variants.`);
    return {
      id,
      name: defaultVariant.label.replace(/\s+\d+$/, ""),
      category: defaultVariant.category,
      variants: familyVariants,
      defaultVariant,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const publicComponentPreviewExclusionCount = variants.filter(
  (variant) => variant.previewMode === "fallback",
).length;
