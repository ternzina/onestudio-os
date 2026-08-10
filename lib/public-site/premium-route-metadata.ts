import type { Metadata } from "next";
import { articles } from "../../app/demos/premium-kids-center/content.ts";
import { resolvePublicSiteBrand } from "./identity.ts";
import { getSiteTemplateDefinition } from "./template-registry.ts";
import type { PublicSiteData } from "./types.ts";

export const PREMIUM_PUBLIC_INDEX_ROUTES = [
  "tasks",
  "workbooks",
  "experiments",
  "articles",
] as const;

type PremiumIndexRoute = (typeof PREMIUM_PUBLIC_INDEX_ROUTES)[number];
export type PremiumPublicArticle = (typeof articles)[number];

export type PremiumPublicRoute =
  | { kind: "index"; route: PremiumIndexRoute }
  | { kind: "article"; route: "articles"; article: PremiumPublicArticle };

const routeCopy: Record<PremiumIndexRoute, { title: string; description: string }> = {
  tasks: {
    title: "Задания",
    description: "Практические задания для последовательного обучения и развития навыков.",
  },
  workbooks: {
    title: "Рабочие тетради",
    description: "Последовательные учебные маршруты, программы и рабочие тетради.",
  },
  experiments: {
    title: "Эксперименты и творчество",
    description: "Домашние эксперименты, творческие практики и семейные проекты.",
  },
  articles: {
    title: "Журнал для родителей",
    description: "Практические статьи о развитии, обучении и поддержке ребёнка.",
  },
};

function supportsPremiumRoute(site: PublicSiteData, route: string) {
  const template = getSiteTemplateDefinition(site.content.template_id);
  return template?.integration.kind === "core" && template.integration.adapter === "bembi" && ["tasks", "workbooks", "experiments", "articles"].includes(route);
}

export function resolvePremiumPublicRoute(
  site: PublicSiteData,
  path: readonly string[],
): PremiumPublicRoute | null {
  if (path.length === 1) {
    const route = path[0] as PremiumIndexRoute;
    return PREMIUM_PUBLIC_INDEX_ROUTES.includes(route) && supportsPremiumRoute(site, route)
      ? { kind: "index", route }
      : null;
  }

  if (path.length === 2 && path[0] === "articles" && supportsPremiumRoute(site, "articles")) {
    const article = articles.find((candidate) => candidate.slug === path[1]);
    // The current Premium template has one article with a complete public page.
    if (article?.slug === "add-subtract-within-100") {
      return { kind: "article", route: "articles", article };
    }
  }

  return null;
}

function premiumRoutePath(
  site: PublicSiteData,
  route: PremiumPublicRoute,
  locale: string,
  cleanUrls: boolean,
) {
  const localePrefix = locale === site.business.primary_locale
    ? ""
    : `/${encodeURIComponent(locale)}`;
  const suffix = route.kind === "article"
    ? `/articles/${encodeURIComponent(route.article.slug)}`
    : `/${route.route}`;
  return cleanUrls
    ? `${localePrefix}${suffix}`
    : `/site/${encodeURIComponent(site.business.slug)}${localePrefix}${suffix}`;
}

function absoluteMediaUrl(value: string | null | undefined, origin: string | URL) {
  if (!value) return undefined;
  try {
    return new URL(value, origin).toString();
  } catch {
    return undefined;
  }
}

export function createPremiumPublicRouteMetadata(
  site: PublicSiteData,
  route: PremiumPublicRoute,
  locale: string,
  options: { origin: string | URL; cleanUrls: boolean },
): Metadata {
  const brand = resolvePublicSiteBrand(site);
  const copy = route.kind === "article"
    ? { title: route.article.title, description: route.article.subtitle }
    : routeCopy[route.route];
  const title = `${copy.title} | ${brand}`;
  const url = new URL(premiumRoutePath(site, route, locale, options.cleanUrls), options.origin);
  const image = absoluteMediaUrl(
    route.kind === "article"
      ? route.article.image
      : undefined,
    options.origin,
  );
  const languages = Object.fromEntries(site.available_locales.map((availableLocale) => [
    availableLocale,
    new URL(
      premiumRoutePath(site, route, availableLocale, options.cleanUrls),
      options.origin,
    ).toString(),
  ]));

  return {
    title: { absolute: title },
    description: copy.description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: route.kind === "article" ? "article" : "website",
      url,
      siteName: brand,
      title,
      description: copy.description,
      locale: locale.replace("-", "_"),
      images: image ? [{ url: image, alt: copy.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: copy.description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: site.content.seo_no_index !== true,
      follow: site.content.seo_no_index !== true,
    },
  };
}

export function premiumPublicSitemapPaths(
  site: PublicSiteData,
  locale: string,
  cleanUrls: boolean,
) {
  const paths = PREMIUM_PUBLIC_INDEX_ROUTES.flatMap((route) => {
    const resolved = resolvePremiumPublicRoute(site, [route]);
    return resolved ? [premiumRoutePath(site, resolved, locale, cleanUrls)] : [];
  });
  for (const article of articles) {
    const resolved = resolvePremiumPublicRoute(site, ["articles", article.slug]);
    if (resolved) paths.push(premiumRoutePath(site, resolved, locale, cleanUrls));
  }
  return paths;
}
