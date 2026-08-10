import { createPremiumTemplateManifestLookup, definePremiumTemplateManifest, validatePremiumTemplateManifests } from "./premium-template-package.ts";

const GLOSS_PACKAGE = definePremiumTemplateManifest({
  packageVersion: "1.0", templateKey: "gloss-nail-studio", name: "GLOSS",
  description: "Полный editorial-сайт nail-студии с записью, командой, клубом и портфолио.",
  category: "beauty", aliases: ["gloss"], library: { tier: "standard", visible: true, order: 10 },
  preview: {
    collectionVisible: true, group: "beauty", order: 10,
    title: { ru: "Nail-студия", en: "Nail studio" },
    description: { ru: "Полный editorial-сайт nail-студии с записью, командой, клубом и портфолио.", en: "An editorial nail studio website with booking, team, club and portfolio." },
    alt: { ru: "Интерьер и работы nail-студии GLOSS", en: "GLOSS nail studio interior and work" },
    route: "/demos/gloss-nail-studio", image: "/templates/gloss/gloss-hero.webp", accent: "#9d3151", dark: "#321722", surface: "#fff7f5",
  },
  persistence: { schemaVersion: "1.0", compatibleSince: "gloss-1.0", contentNamespace: false },
  capabilities: { customerCreatable: true, editorSelectable: true, previewRenderable: true, publicHome: true, customPages: true, seoMetadata: true, nativeSections: true, customBlocks: true },
  nativeSectionIds: ["services", "portfolio", "team", "booking", "membership", "safety", "reviews", "gift", "faq", "about", "contact"],
  assets: ["/templates/gloss/gloss-hero.webp", "/templates/gloss/gloss-gallery-1.webp"],
});

const NOIR_PACKAGE = definePremiumTemplateManifest({
  packageVersion: "1.0", templateKey: "premium-studio", name: "NOIR FRAME — Premium Photo Studio",
  description: "Премиальная фотостудия с portfolio viewer, 3D-туром и before/after.",
  category: "studio", aliases: ["noir", "noir-frame"], library: { tier: "premium", visible: true, order: 30 },
  preview: {
    collectionVisible: true, group: "studio", order: 30,
    title: { ru: "Фотостудия", en: "Photo studio" },
    description: { ru: "Премиальная фотостудия с portfolio viewer, 3D-туром и before/after.", en: "A premium photo studio with a portfolio viewer, 3D tour and before/after." },
    alt: { ru: "Светлый зал фотостудии NOIR FRAME", en: "Bright NOIR FRAME photo studio" },
    route: "/demos/premium-studio", image: "/images/demos/premium-studio/bright/hero.webp", accent: "#b58b57", dark: "#111111", surface: "#f3efe8",
  },
  persistence: { schemaVersion: "1.0", compatibleSince: "noir-phase-1", contentNamespace: true },
  capabilities: { customerCreatable: true, editorSelectable: true, previewRenderable: true, publicHome: true, customPages: true, seoMetadata: true, nativeSections: true, customBlocks: true },
  nativeSectionIds: ["hero", "manifest", "light", "services", "portfolio", "retouch", "film", "team", "process", "equipment", "tour", "reviews", "faq", "contact", "footer"],
  assets: ["/images/demos/premium-studio/bright/hero.webp"],
});

/** The only canonical registration of universal premium package identities. */
export const PREMIUM_TEMPLATE_PACKAGE_MANIFESTS = [GLOSS_PACKAGE, NOIR_PACKAGE] as const;
/** Compatibility name: entries are now serializable manifests, never runtime bindings. */
export const PREMIUM_TEMPLATE_PACKAGES = PREMIUM_TEMPLATE_PACKAGE_MANIFESTS;
export type PremiumTemplateKey = (typeof PREMIUM_TEMPLATE_PACKAGE_MANIFESTS)[number]["templateKey"];

const errors = validatePremiumTemplateManifests(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS);
if (errors.length) throw new Error(`Invalid Premium Template Package catalog: ${errors.join("; ")}`);

export const getPremiumTemplatePackage = createPremiumTemplateManifestLookup(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS);
