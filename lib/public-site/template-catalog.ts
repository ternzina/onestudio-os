import { PREMIUM_TEMPLATE_PACKAGE_MANIFESTS, type PremiumTemplateKey } from "./premium-template-package-catalog.ts";
import type { PremiumTemplatePackageManifest } from "./premium-template-package.ts";

type CoreTemplateKey = "standard" | "premium-kids-center";
export type TemplateKey = CoreTemplateKey | PremiumTemplateKey;
export type TemplateCreationMode = "blank" | "template";
export type TemplateAccess = "free" | "premium";
export type CustomerLocale = "ru" | "en";
export type TemplateCatalogRecord = {
  key: TemplateKey; aliases: readonly string[]; name: string; category: string; tier: "standard" | "premium"; access: TemplateAccess;
  gallery: { visible: boolean; previewRoute: string | null; previewImage: string | null; group: "studio" | "beauty" | "wellness" | "education" | "events" | "business"; title: { ru: string; en: string }; description: string; localizedDescription: { ru: string; en: string }; alt: { ru: string; en: string } };
  capabilities: { customerCreatable: boolean; createFromScratch: boolean; editorSelectable: boolean; previewRenderable: boolean; publicRenderable: boolean; customPages: boolean };
  integration: { kind: "core"; adapter: "base" | "bembi" } | { kind: "premium-package" }; contentNamespace: boolean;
};

const CORE_TEMPLATE_CATALOG: readonly TemplateCatalogRecord[] = [
  { key: "standard", aliases: ["base", "base-onestudio"], name: "Base OneStudio", category: "business", tier: "standard", access: "free", gallery: { visible: false, previewRoute: null, previewImage: null, group: "business", title: { ru: "Базовый сайт", en: "Base website" }, description: "Нейтральный универсальный сайт OneStudio.", localizedDescription: { ru: "Нейтральный универсальный сайт OneStudio.", en: "A neutral, universal OneStudio website." }, alt: { ru: "Base OneStudio", en: "Base OneStudio" } }, capabilities: { customerCreatable: true, createFromScratch: true, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, integration: { kind: "core", adapter: "base" }, contentNamespace: false },
  { key: "premium-kids-center", aliases: ["bembi"], name: "BEMBI", category: "kids-education", tier: "premium", access: "premium", gallery: { visible: true, previewRoute: "/demos/premium-kids-center", previewImage: "/images/demos/premium-kids-center/hero-platform.webp", group: "education", title: { ru: "Детский развивающий центр", en: "Kids discovery center" }, description: "Kids Discovery Center с программами, заданиями и материалами.", localizedDescription: { ru: "Kids Discovery Center с программами, заданиями и материалами.", en: "Kids Discovery Center with programs, activities and learning materials." }, alt: { ru: "Детский развивающий центр BEMBI", en: "BEMBI kids discovery center" } }, capabilities: { customerCreatable: true, createFromScratch: false, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, integration: { kind: "core", adapter: "bembi" }, contentNamespace: true },
] as const;

export function createPremiumPackageTemplateCatalog(manifests: readonly PremiumTemplatePackageManifest[]): readonly TemplateCatalogRecord[] {
  return manifests.map((manifest) => ({
    key: manifest.templateKey,
    aliases: manifest.aliases,
    name: manifest.name,
    category: manifest.category,
    tier: manifest.library.tier,
    access: manifest.access,
    gallery: { visible: manifest.library.visible, previewRoute: manifest.preview.route, previewImage: manifest.preview.image, group: manifest.preview.group, title: manifest.preview.title, description: manifest.description, localizedDescription: manifest.preview.description, alt: manifest.preview.alt },
    capabilities: { customerCreatable: manifest.capabilities.customerCreatable, createFromScratch: false, editorSelectable: manifest.capabilities.editorSelectable, previewRenderable: manifest.capabilities.previewRenderable, publicRenderable: manifest.capabilities.publicHome, customPages: manifest.capabilities.customPages },
    integration: { kind: "premium-package" },
    contentNamespace: manifest.persistence.contentNamespace,
  })) as readonly TemplateCatalogRecord[];
}

const PACKAGE_TEMPLATE_CATALOG = createPremiumPackageTemplateCatalog(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS);

const catalogOrder = new Map<string, number>([["standard", 0], ["premium-kids-center", 20], ...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.map((manifest) => [manifest.templateKey, manifest.library.order] as const)]);
export const TEMPLATE_CATALOG: readonly TemplateCatalogRecord[] = [...CORE_TEMPLATE_CATALOG, ...PACKAGE_TEMPLATE_CATALOG]
  .sort((left, right) => (catalogOrder.get(left.key) ?? 0) - (catalogOrder.get(right.key) ?? 0));
/** Runtime key view derived from the canonical core records and package manifests. */
export const TEMPLATE_KEYS: readonly TemplateKey[] = TEMPLATE_CATALOG.map(({ key }) => key);

export function getTemplateCatalogRecord(value?: string | null) { return TEMPLATE_CATALOG.find(item => item.key === value || item.aliases.includes(value ?? "")) ?? null; }
export function getCustomerTemplateChoices() { return TEMPLATE_CATALOG.filter(item => item.gallery.visible && item.capabilities.customerCreatable); }
export function getEditorTemplateChoices() { return TEMPLATE_CATALOG.filter(item => item.capabilities.editorSelectable); }
export function templateAccessLabel(access: TemplateAccess, locale: CustomerLocale) { return access === "premium" ? "Premium" : locale === "ru" ? "Бесплатно" : "Free"; }
export function newSitePathForTemplate(key: TemplateKey) { return `/new-site?template=${encodeURIComponent(key)}&mode=${key === "standard" ? "blank" : "template"}`; }
