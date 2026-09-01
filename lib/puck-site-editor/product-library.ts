export const PRODUCT_LIBRARY_CATEGORY_ORDER = [
  "Hero",
  "Navigation",
  "CTA",
  "Features",
  "Content",
  "Pricing",
  "Contact",
  "Forms",
  "Cards",
  "Lists",
  "Social Proof / Testimonials",
  "Showcase / Gallery",
  "Blog",
  "Ecommerce",
  "Scheduling",
  "App UI",
  "Backgrounds",
  "Animations",
  "Text Effects",
  "Cursor / Pointer",
  "Carousel / Slider",
] as const;

export type ProductLibraryCategory = (typeof PRODUCT_LIBRARY_CATEGORY_ORDER)[number];
export type ProductLibrarySourceTier = "FREE" | "PRO";

export type ProductLibraryBlockInput = {
  type: string;
  displayName: string;
  catalogKey: string;
  sourceKind: "component" | "pro-block";
  category?: string;
  tags?: readonly string[];
  sourceTier?: ProductLibrarySourceTier;
};

export type ProductLibraryMetadata = {
  displayName: string;
  category: ProductLibraryCategory;
  sourceTier: ProductLibrarySourceTier;
  officialSlug: string;
  searchAliases: readonly string[];
};

const CATEGORY_FAMILIES: Readonly<Record<ProductLibraryCategory, readonly string[]>> = {
  Hero: ["hero"],
  Navigation: ["navigation", "navbar"],
  CTA: ["cta", "download"],
  Features: ["features", "how-it-works", "stats"],
  Content: ["about", "faq", "footer"],
  Pricing: ["pricing"],
  Contact: ["contact"],
  Forms: ["auth", "forms", "settings-form", "waitlist"],
  Cards: [
    "card",
    "card-spread",
    "click-stack",
    "credit-card",
    "depth-card",
    "modal-cards",
    "parallax-cards",
    "rotating-cards",
    "tilted-tiles",
  ],
  Lists: ["animated-list", "list"],
  "Social Proof / Testimonials": ["social-proof"],
  "Showcase / Gallery": ["circle-gallery", "infinite-gallery", "reel-gallery", "showcase"],
  Blog: ["blog"],
  Ecommerce: ["ecommerce"],
  Scheduling: ["scheduling"],
  "App UI": [
    "app-dialog",
    "app-shell",
    "app-sidebar",
    "command-menu",
    "comments",
    "empty-state",
    "feedback",
    "mobile",
    "notifications",
    "onboarding",
    "support",
  ],
  Backgrounds: [
    "aurora-beam",
    "blinking-dots",
    "blinking-squares",
    "center-flow",
    "chroma-blinds",
    "chroma-waves",
    "dither-wave",
    "dot-shift",
    "flicker",
    "floating-lines",
    "frame-border",
    "glue-dots",
    "grid-rise",
    "halftone-vortex",
    "light-droplets",
    "lightspeed",
    "liquid-ascii",
    "magic-rings",
    "minimal-ripple",
    "portal",
    "radial-liquid",
    "shader-waves",
    "strands",
    "vortex",
  ],
  Animations: [
    "3d-letter-swap",
    "circle-stack",
    "circles",
    "device",
    "draggable-grid",
    "hover-preview",
    "magic-transform",
    "parallax-pills",
    "pixel-magnet",
    "pixel-reveal",
    "preloader",
    "scroll-mask",
    "scroll-stack",
    "simple-graph",
  ],
  "Text Effects": [
    "3d-text-reveal",
    "bending-marquee",
    "blur-highlight",
    "glitch-text",
    "particle-text",
    "speeding-text",
    "staggered-text",
    "text-cube",
    "text-path",
    "text-scatter",
  ],
  "Cursor / Pointer": [
    "cursor-wave",
    "custom-cursor",
    "dither-cursor",
    "glass-cursor",
    "glow-cursor",
    "smooth-cursor",
    "splash-cursor",
    "user-cursor",
  ],
  "Carousel / Slider": [
    "comparison-slider",
    "gradient-carousel",
    "lenticular-carousel",
    "page-flip",
    "parallax-carousel",
    "skewed-carousel",
    "tumble-carousel",
  ],
};

const CATEGORY_SEARCH_ALIASES: Readonly<Record<ProductLibraryCategory, readonly string[]>> = {
  Hero: ["landing", "header"],
  Navigation: ["menu", "navbar", "header"],
  CTA: ["call to action", "conversion", "button"],
  Features: ["benefits", "how it works", "stats"],
  Content: ["about", "faq", "footer", "content"],
  Pricing: ["plans", "subscriptions"],
  Contact: ["contact us", "support"],
  Forms: ["form", "auth", "waitlist", "input"],
  Cards: ["card", "tiles"],
  Lists: ["list", "feed"],
  "Social Proof / Testimonials": ["social proof", "testimonial", "reviews", "customers"],
  "Showcase / Gallery": ["showcase", "gallery", "portfolio"],
  Blog: ["articles", "posts", "news"],
  Ecommerce: ["shop", "store", "products"],
  Scheduling: ["schedule", "calendar", "booking"],
  "App UI": ["application ui", "dashboard", "dialog", "settings"],
  Backgrounds: ["background", "visual", "scene"],
  Animations: ["animated", "motion", "interactive"],
  "Text Effects": ["text", "typography", "animated text"],
  "Cursor / Pointer": ["cursor", "pointer", "mouse", "trail"],
  "Carousel / Slider": ["carousel", "slider", "slides"],
};

const INTERNAL_PROVENANCE = /^(?:React Bits(?: Fast Batch \d+| Control \d+| Free Showcase)?|Fast Batch \d+|Control \d+)$/i;

export function cleanReactBitsDisplayName(value: string) {
  return value.replace(/^React Bits\s+/i, "").trim();
}

export function officialSlugFromCatalogKey(catalogKey: string) {
  return (catalogKey.split(":").pop() || catalogKey).replace(/-tw$/i, "");
}

function familyFromSlug(slug: string) {
  return slug.replace(/-\d+$/, "");
}

function categoryFromTags(tags: readonly string[]): ProductLibraryCategory | null {
  const normalized = tags.map((tag) => tag.toLocaleLowerCase());
  if (normalized.some((tag) => tag === "application ui")) return "App UI";
  if (normalized.some((tag) => tag.includes("cursor") || tag.includes("pointer"))) return "Cursor / Pointer";
  if (normalized.some((tag) => tag.includes("carousel") || tag.includes("slider"))) return "Carousel / Slider";
  if (normalized.some((tag) => tag.includes("gallery") || tag.includes("portfolio"))) return "Showcase / Gallery";
  if (normalized.some((tag) => tag.includes("background"))) return "Backgrounds";
  if (normalized.some((tag) => tag.includes("text effect"))) return "Text Effects";
  if (normalized.some((tag) => tag.includes("card"))) return "Cards";
  if (normalized.some((tag) => tag.includes("animated") || tag.includes("interactive"))) return "Animations";
  return null;
}

export function productCategoryForBlock(block: ProductLibraryBlockInput): ProductLibraryCategory {
  const family = familyFromSlug(officialSlugFromCatalogKey(block.catalogKey));
  for (const category of PRODUCT_LIBRARY_CATEGORY_ORDER) {
    if (CATEGORY_FAMILIES[category].includes(family)) return category;
  }
  return categoryFromTags(block.tags ?? []) ?? (block.sourceKind === "pro-block" ? "Content" : "Animations");
}

export function productSourceTierForBlock(block: ProductLibraryBlockInput): ProductLibrarySourceTier {
  if (block.sourceTier === "FREE" || block.sourceTier === "PRO") return block.sourceTier;
  return /^(?:starter|current-free):/.test(block.catalogKey) ? "FREE" : "PRO";
}

export function createProductLibraryMetadata(block: ProductLibraryBlockInput): ProductLibraryMetadata {
  const displayName = cleanReactBitsDisplayName(block.displayName);
  const category = productCategoryForBlock(block);
  const sourceTier = productSourceTierForBlock(block);
  const officialSlug = officialSlugFromCatalogKey(block.catalogKey);
  const publicTags = (block.tags ?? []).filter((tag) => !INTERNAL_PROVENANCE.test(tag));
  return {
    displayName,
    category,
    sourceTier,
    officialSlug,
    searchAliases: [...new Set([
      displayName,
      category,
      sourceTier,
      officialSlug,
      officialSlug.replace(/-/g, " "),
      ...CATEGORY_SEARCH_ALIASES[category],
      ...publicTags,
    ].map((value) => value.toLocaleLowerCase()))],
  };
}

export function withProductLibraryMetadata<Block extends ProductLibraryBlockInput>(block: Block) {
  const productLibrary = createProductLibraryMetadata(block);
  return {
    ...block,
    displayName: productLibrary.displayName,
    category: productLibrary.category,
    sourceTier: productLibrary.sourceTier,
    productLibrary,
    devProvenance: {
      displayName: block.displayName,
      category: block.category ?? null,
      tags: [...(block.tags ?? [])],
    },
  };
}

export type ProductizedLibraryBlock = ReturnType<typeof withProductLibraryMetadata<ProductLibraryBlockInput>>;

export function matchesProductLibrarySearch(
  metadata: ProductLibraryMetadata,
  query: string,
) {
  const normalized = query.trim().toLocaleLowerCase();
  return !normalized || metadata.searchAliases.some((alias) => alias.includes(normalized));
}

export function sortProductLibraryBlocks<Block extends { displayName: string }>(blocks: readonly Block[]) {
  return [...blocks].sort((left, right) => left.displayName.localeCompare(right.displayName, undefined, { numeric: true }));
}

export function buildProductLibraryCategories<
  Block extends { type: string; category: ProductLibraryCategory; displayName: string },
>(blocks: readonly Block[]) {
  return Object.fromEntries(
    PRODUCT_LIBRARY_CATEGORY_ORDER.flatMap((category) => {
      const components = sortProductLibraryBlocks(blocks.filter((block) => block.category === category))
        .map((block) => block.type);
      if (!components.length) return [];
      const key = `product-${category.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      return [[key, { title: category, defaultExpanded: false, components }]];
    }),
  );
}
