import { createTemplateSeed } from "./template-seeds.ts";
import { PREMIUM_TEMPLATE_PACKAGE_MANIFESTS, type PremiumTemplateKey } from "./premium-template-package-catalog.ts";

type CoreTemplateKey = "standard" | "premium-kids-center";
export type TemplateKey = CoreTemplateKey | PremiumTemplateKey;
export type TemplateCreationMode = "blank" | "template";
export type TemplateCatalogRecord = {
  key: TemplateKey; aliases: readonly string[]; name: string; category: string; tier: "standard" | "premium";
  gallery: { visible: boolean; previewRoute: string | null; previewImage: string | null; description: string };
  capabilities: { customerCreatable: boolean; createFromScratch: boolean; editorSelectable: boolean; previewRenderable: boolean; publicRenderable: boolean; customPages: boolean };
  integration: { kind: "core"; adapter: "base" | "bembi" } | { kind: "premium-package" }; contentNamespace: boolean;
  seed: () => ReturnType<typeof createTemplateSeed>;
};

const CORE_TEMPLATE_CATALOG: readonly TemplateCatalogRecord[] = [
  { key: "standard", aliases: ["base", "base-onestudio"], name: "Base OneStudio", category: "business", tier: "standard", gallery: { visible: false, previewRoute: null, previewImage: null, description: "Нейтральный универсальный сайт OneStudio." }, capabilities: { customerCreatable: true, createFromScratch: true, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, integration: { kind: "core", adapter: "base" }, contentNamespace: false, seed: () => createTemplateSeed("standard") },
  { key: "premium-kids-center", aliases: ["bembi"], name: "BEMBI", category: "kids-education", tier: "premium", gallery: { visible: true, previewRoute: "/demos/premium-kids-center", previewImage: "/images/demos/premium-kids-center/hero-platform.webp", description: "Kids Discovery Center с программами, заданиями и материалами." }, capabilities: { customerCreatable: true, createFromScratch: false, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, integration: { kind: "core", adapter: "bembi" }, contentNamespace: true, seed: () => createTemplateSeed("premium-kids-center") },
] as const;

const PACKAGE_TEMPLATE_CATALOG: readonly TemplateCatalogRecord[] = PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.map((manifest) => ({
  key: manifest.templateKey,
  aliases: manifest.aliases,
  name: manifest.name,
  category: manifest.category,
  tier: manifest.library.tier,
  gallery: { visible: manifest.library.visible, previewRoute: manifest.preview.route, previewImage: manifest.preview.image, description: manifest.description },
  capabilities: { customerCreatable: manifest.capabilities.customerCreatable, createFromScratch: false, editorSelectable: manifest.capabilities.editorSelectable, previewRenderable: manifest.capabilities.previewRenderable, publicRenderable: manifest.capabilities.publicHome, customPages: manifest.capabilities.customPages },
  integration: { kind: "premium-package" },
  contentNamespace: manifest.persistence.contentNamespace,
  seed: () => createTemplateSeed(manifest.templateKey),
}));

const catalogOrder = new Map<string, number>([["standard", 0], ["premium-kids-center", 20], ...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.map((manifest) => [manifest.templateKey, manifest.library.order] as const)]);
export const TEMPLATE_CATALOG: readonly TemplateCatalogRecord[] = [...CORE_TEMPLATE_CATALOG, ...PACKAGE_TEMPLATE_CATALOG]
  .sort((left, right) => (catalogOrder.get(left.key) ?? 0) - (catalogOrder.get(right.key) ?? 0));
/** Runtime key view derived from the canonical core records and package manifests. */
export const TEMPLATE_KEYS: readonly TemplateKey[] = TEMPLATE_CATALOG.map(({ key }) => key);

export function getTemplateCatalogRecord(value?: string | null) { return TEMPLATE_CATALOG.find(item => item.key === value || item.aliases.includes(value ?? "")) ?? null; }
export function getCustomerTemplateChoices() { return TEMPLATE_CATALOG.filter(item => item.gallery.visible && item.capabilities.customerCreatable); }
export function getEditorTemplateChoices() { return TEMPLATE_CATALOG.filter(item => item.capabilities.editorSelectable); }
export function newSitePathForTemplate(key: TemplateKey) { return `/new-site?template=${encodeURIComponent(key)}&mode=${key === "standard" ? "blank" : "template"}`; }

export function resolveCreationContract(input: { creation_mode: TemplateCreationMode; template_key?: string | null }) {
  const key = input.creation_mode === "blank" ? "standard" : input.template_key;
  const template = getTemplateCatalogRecord(key);
  if (!template || !template.capabilities.customerCreatable || (input.creation_mode === "blank" && !template.capabilities.createFromScratch)) throw new Error("invalid_template_creation_contract");
  return { creation_mode: input.creation_mode, template_key: template.key, seed: template.seed() } as const;
}
