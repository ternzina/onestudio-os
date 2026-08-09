import { TEMPLATE_CATALOG, getTemplateCatalogRecord } from "./template-catalog.ts";

export const DEFAULT_SITE_TEMPLATE_KEY = "standard" as const;
/** Compatibility view. Every field is derived from TEMPLATE_CATALOG. */
export const SITE_TEMPLATE_REGISTRY = TEMPLATE_CATALOG.map(item => ({ ...item, description: item.gallery.description, previewRoute: item.gallery.previewRoute, runtime: { editorSelectable: item.capabilities.editorSelectable, previewSelectable: item.capabilities.previewRenderable, publicRenderable: item.capabilities.publicRenderable, legacy: false as const } }));
export type SiteTemplateDefinition = (typeof SITE_TEMPLATE_REGISTRY)[number];
export function getSiteTemplateDefinition(key?: string | null) { const canonical = getTemplateCatalogRecord(key); return canonical ? SITE_TEMPLATE_REGISTRY.find(item => item.key === canonical.key) ?? null : null; }
export function isExecutableSiteTemplate(key?: string | null) { const item = getTemplateCatalogRecord(key); return Boolean(item?.capabilities.editorSelectable && item.capabilities.previewRenderable && item.capabilities.publicRenderable); }
export function isPublicRenderableSiteTemplate(key?: string | null) { return Boolean(getTemplateCatalogRecord(key)?.capabilities.publicRenderable); }
export function getActiveEditorDesigns() { return SITE_TEMPLATE_REGISTRY.filter(item => item.capabilities.editorSelectable); }
export function resolveSiteTemplateKey(key?: string | null) { const item = getTemplateCatalogRecord(key); if (item) return item.key; if (process.env.NODE_ENV !== "production" && key) throw new Error(`No canonical template adapter: ${key}`); return DEFAULT_SITE_TEMPLATE_KEY; }
export function isPremiumSiteTemplate(key?: string | null) { return getTemplateCatalogRecord(key)?.tier === "premium"; }
