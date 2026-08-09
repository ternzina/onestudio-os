export const DEFAULT_SITE_TEMPLATE_KEY = "standard" as const;

export type SiteTemplateTier = "standard" | "premium";

export type SiteTemplateDefinition = {
  key: string;
  name: string;
  category: string;
  tier: SiteTemplateTier;
  previewRoute: string | null;
  capabilities: readonly string[];
  description: string;
  runtime: { editorSelectable: boolean; previewSelectable: boolean; publicRenderable: boolean; legacy: boolean };
  contentNamespace: boolean;
};

export const SITE_TEMPLATE_REGISTRY: readonly SiteTemplateDefinition[] = [
  {
    key: DEFAULT_SITE_TEMPLATE_KEY,
    name: "Base OneStudio design",
    category: "business",
    tier: "standard",
    previewRoute: null,
    capabilities: ["services", "portfolio", "booking", "custom-pages"],
    description: "Текущий универсальный сайт OneStudio.",
    runtime: { editorSelectable: true, previewSelectable: true, publicRenderable: true, legacy: false },
    contentNamespace: false,
  },
  {
    key: "gloss-nail-studio",
    name: "GLOSS",
    category: "beauty",
    tier: "standard",
    previewRoute: null,
    capabilities: ["services", "portfolio", "booking", "custom-pages"],
    description: "Редакционный шаблон для nail-студии.",
    runtime: { editorSelectable: true, previewSelectable: true, publicRenderable: true, legacy: false },
    contentNamespace: false,
  },
  {
    key: "premium-kids-center",
    name: "BEMBI",
    category: "kids-education",
    tier: "premium",
    previewRoute: "/demos/premium-kids-center",
    capabilities: [
      "tasks",
      "workbooks",
      "experiments",
      "articles",
      "programs",
      "schedule",
    ],
    description: "Premium Kids Center: занятия, материалы и журнал для родителей.",
    runtime: { editorSelectable: true, previewSelectable: true, publicRenderable: true, legacy: false },
    contentNamespace: true,
  },
] as const;

export function getSiteTemplateDefinition(key?: string | null) {
  return SITE_TEMPLATE_REGISTRY.find((template) => template.key === key) ?? null;
}

export function isExecutableSiteTemplate(key?: string | null) {
  const template = getSiteTemplateDefinition(key);
  return Boolean(template?.runtime.editorSelectable && template.runtime.previewSelectable && template.runtime.publicRenderable && !template.runtime.legacy);
}

export function isPublicRenderableSiteTemplate(key?: string | null) {
  return Boolean(getSiteTemplateDefinition(key)?.runtime.publicRenderable);
}

export function getActiveEditorDesigns() {
  return SITE_TEMPLATE_REGISTRY.filter((template) => template.runtime.editorSelectable);
}

export function resolveSiteTemplateKey(key?: string | null) {
  return getSiteTemplateDefinition(key)?.key ?? DEFAULT_SITE_TEMPLATE_KEY;
}

export function isPremiumSiteTemplate(key?: string | null) {
  return getSiteTemplateDefinition(key)?.tier === "premium";
}
