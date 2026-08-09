import { createTemplateSeed } from "./template-seeds.ts";

export const TEMPLATE_KEYS = ["standard", "gloss-nail-studio", "premium-kids-center", "premium-studio"] as const;
export type TemplateKey = typeof TEMPLATE_KEYS[number];
export type TemplateCreationMode = "blank" | "template";
export type TemplateCatalogRecord = {
  key: TemplateKey; aliases: readonly string[]; name: string; category: string; tier: "standard" | "premium";
  gallery: { visible: boolean; previewRoute: string | null; previewImage: string | null; description: string };
  capabilities: { customerCreatable: boolean; createFromScratch: boolean; editorSelectable: boolean; previewRenderable: boolean; publicRenderable: boolean; customPages: boolean };
  adapter: "base" | "gloss" | "bembi" | "noir"; contentNamespace: boolean;
  seed: () => ReturnType<typeof createTemplateSeed>;
};

export const TEMPLATE_CATALOG: readonly TemplateCatalogRecord[] = [
  { key: "standard", aliases: ["base", "base-onestudio"], name: "Base OneStudio", category: "business", tier: "standard", gallery: { visible: false, previewRoute: null, previewImage: null, description: "Нейтральный универсальный сайт OneStudio." }, capabilities: { customerCreatable: true, createFromScratch: true, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, adapter: "base", contentNamespace: false, seed: () => createTemplateSeed("standard") },
  { key: "gloss-nail-studio", aliases: ["gloss"], name: "GLOSS", category: "beauty", tier: "standard", gallery: { visible: true, previewRoute: "/demos/gloss-nail-studio", previewImage: "/templates/gloss/gloss-hero.webp", description: "Полный editorial-сайт nail-студии с записью, командой, клубом и портфолио." }, capabilities: { customerCreatable: true, createFromScratch: false, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, adapter: "gloss", contentNamespace: false, seed: () => createTemplateSeed("gloss-nail-studio") },
  { key: "premium-kids-center", aliases: ["bembi"], name: "BEMBI", category: "kids-education", tier: "premium", gallery: { visible: true, previewRoute: "/demos/premium-kids-center", previewImage: "/images/demos/premium-kids-center/hero-platform.webp", description: "Kids Discovery Center с программами, заданиями и материалами." }, capabilities: { customerCreatable: true, createFromScratch: false, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, adapter: "bembi", contentNamespace: true, seed: () => createTemplateSeed("premium-kids-center") },
  { key: "premium-studio", aliases: ["noir", "noir-frame"], name: "NOIR FRAME — Premium Photo Studio", category: "studio", tier: "premium", gallery: { visible: true, previewRoute: "/demos/premium-studio", previewImage: "/images/demos/premium-studio/bright/hero.webp", description: "Премиальная фотостудия с portfolio viewer, 3D-туром и before/after." }, capabilities: { customerCreatable: true, createFromScratch: false, editorSelectable: true, previewRenderable: true, publicRenderable: true, customPages: true }, adapter: "noir", contentNamespace: true, seed: () => createTemplateSeed("premium-studio") },
] as const;

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
