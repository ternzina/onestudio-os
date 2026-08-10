import { createElement } from "react";
import dynamic from "next/dynamic.js";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "./gloss-premium-template-contract.ts";
import { GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "./gloss-premium-template-editor-adapter.ts";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "./noir-premium-template-editor-adapter.ts";
import { definePremiumTemplatePackage, validatePremiumTemplatePackages } from "./premium-template-package.ts";
import type { PremiumTemplateCustomPageRendererProps } from "./premium-template-custom-page-runtime-adapter.ts";
import type { PremiumTemplatePublicHomeRendererProps } from "./premium-template-runtime-adapter.ts";
import { createPremiumStudioSeed, withPremiumStudioContent } from "./premium-studio-content.ts";
import { GLOSS_TEMPLATE, applySiteTemplate } from "./templates.ts";
import type { PublicSiteContent } from "./types.ts";

const emptyContent = (): PublicSiteContent => ({
  brand_name: "", hero_eyebrow: "", hero_title: "", hero_text: "", about_title: "", about_text: "",
  services_title: "", portfolio_title: "", contact_title: "", booking_label: "", services_label: "",
  portfolio_label: "", about_label: "", contact_label: "",
  show_services: false, show_portfolio: false, show_about: false, show_contact: false,
  seo_title: "", seo_description: "",
});

const GlossHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/GlossBusinessSite"));
const NoirHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/app/demos/premium-studio/PremiumStudioExperience"));
const GlossPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/PublicCustomPage"));
const NoirPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/NoirCustomPage"));

export const GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey, definition: GLOSS_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: GlossHome };
export const NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, definition: NOIR_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: NoirHome };
export const GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: (props: PremiumTemplateCustomPageRendererProps) => createElement(GlossPage, { ...props, brandTagline: "NAIL STUDIO" } as PremiumTemplateCustomPageRendererProps),
};
export const NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, definition: NOIR_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: NoirPage };

const GLOSS_PACKAGE = definePremiumTemplatePackage({
  manifest: {
    packageVersion: "1.0", templateKey: "gloss-nail-studio", name: "GLOSS",
    description: "Полный editorial-сайт nail-студии с записью, командой, клубом и портфолио.",
    category: "beauty", aliases: ["gloss"], legacyAdapter: "gloss", library: { tier: "standard", visible: true, order: 10 },
    preview: { route: "/demos/gloss-nail-studio", image: "/templates/gloss/gloss-hero.webp", accent: "#9d3151", dark: "#321722", surface: "#fff7f5" },
    persistence: { schemaVersion: "1.0", compatibleSince: "gloss-1.0", contentNamespace: false },
    capabilities: { customerCreatable: true, editorSelectable: true, previewRenderable: true, publicHome: true, customPages: true, seoMetadata: true, nativeSections: true, customBlocks: true },
    nativeSectionIds: GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id),
    assets: ["/templates/gloss/gloss-hero.webp", "/templates/gloss/gloss-gallery-1.webp"],
  },
  bindings: {
    contract: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
    createDefaultContent: () => applySiteTemplate(emptyContent(), GLOSS_TEMPLATE),
    editor: GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER,
    publicHome: GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER,
    customPage: GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER,
  },
});

const NOIR_PACKAGE = definePremiumTemplatePackage({
  manifest: {
    packageVersion: "1.0", templateKey: "premium-studio", name: "NOIR FRAME — Premium Photo Studio",
    description: "Премиальная фотостудия с portfolio viewer, 3D-туром и before/after.",
    category: "studio", aliases: ["noir", "noir-frame"], legacyAdapter: "noir", library: { tier: "premium", visible: true, order: 30 },
    preview: { route: "/demos/premium-studio", image: "/images/demos/premium-studio/bright/hero.webp", accent: "#b58b57", dark: "#111111", surface: "#f3efe8" },
    persistence: { schemaVersion: "1.0", compatibleSince: "noir-phase-1", contentNamespace: true },
    capabilities: { customerCreatable: true, editorSelectable: true, previewRenderable: true, publicHome: true, customPages: true, seoMetadata: true, nativeSections: true, customBlocks: true },
    nativeSectionIds: NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id),
    assets: ["/images/demos/premium-studio/bright/hero.webp"],
  },
  bindings: {
    contract: NOIR_PREMIUM_TEMPLATE_CONTRACT,
    createDefaultContent: () => withPremiumStudioContent({ ...emptyContent(), brand_name: "NOIR FRAME" }, createPremiumStudioSeed(), { preserveEditorState: false }),
    editor: NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER,
    publicHome: NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER,
    customPage: NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER,
  },
});

/** The only registration point for universal premium templates. */
export const PREMIUM_TEMPLATE_PACKAGES = [GLOSS_PACKAGE, NOIR_PACKAGE] as const;

const packageErrors = validatePremiumTemplatePackages(PREMIUM_TEMPLATE_PACKAGES);
if (packageErrors.length) throw new Error(`Invalid Premium Template Package catalog: ${packageErrors.join("; ")}`);

const packagesByKey = new Map<string, (typeof PREMIUM_TEMPLATE_PACKAGES)[number]>(
  PREMIUM_TEMPLATE_PACKAGES.map((entry) => [entry.manifest.templateKey, entry]),
);
export function getPremiumTemplatePackage(templateKey: string | null | undefined) {
  return templateKey ? packagesByKey.get(templateKey) : undefined;
}
