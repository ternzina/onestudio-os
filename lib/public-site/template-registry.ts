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
};

export const SITE_TEMPLATE_REGISTRY: readonly SiteTemplateDefinition[] = [
  {
    key: DEFAULT_SITE_TEMPLATE_KEY,
    name: "OneStudio Standard",
    category: "business",
    tier: "standard",
    previewRoute: null,
    capabilities: ["services", "portfolio", "booking", "custom-pages"],
    description: "Текущий универсальный сайт OneStudio.",
  },
  {
    key: "gloss-nail-studio",
    name: "GLOSS",
    category: "beauty",
    tier: "standard",
    previewRoute: null,
    capabilities: ["services", "portfolio", "booking", "custom-pages"],
    description: "Редакционный шаблон для nail-студии.",
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
  },
] as const;

export function getSiteTemplateDefinition(key?: string | null) {
  return SITE_TEMPLATE_REGISTRY.find((template) => template.key === key) ?? null;
}

export function resolveSiteTemplateKey(key?: string | null) {
  return getSiteTemplateDefinition(key)?.key ?? DEFAULT_SITE_TEMPLATE_KEY;
}

export function isPremiumSiteTemplate(key?: string | null) {
  return getSiteTemplateDefinition(key)?.tier === "premium";
}
