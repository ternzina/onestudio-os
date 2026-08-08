import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/app/_seo/site";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";
import { getPublicSite } from "@/lib/public-site/data";
import {
  createPremiumPublicRouteMetadata,
  resolvePremiumPublicRoute,
} from "@/lib/public-site/premium-route-metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

type TemplatePathParams = {
  businessSlug: string;
  locale: string;
  templatePath: string[];
};

async function resolveTemplatePath(params: TemplatePathParams) {
  const { businessSlug, locale, templatePath } = params;
  const normalizedLocale = locale.toLowerCase();
  const [localizedSite, context] = await Promise.all([
    getPublicSite(businessSlug, normalizedLocale),
    getPublicSiteRequestContext(),
  ]);

  if (localizedSite?.business.locale === normalizedLocale) {
    return {
      site: localizedSite,
      context,
      locale: normalizedLocale,
      path: templatePath,
    };
  }

  const site = await getPublicSite(businessSlug);
  return site
    ? {
        site,
        context,
        locale: site.business.locale,
        path: [normalizedLocale, ...templatePath],
      }
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<TemplatePathParams>;
}): Promise<Metadata> {
  const resolved = await resolveTemplatePath(await params);
  if (!resolved) return { title: "Site not found", robots: { index: false } };

  const route = resolvePremiumPublicRoute(resolved.site, resolved.path);
  if (!route) return { title: "Site not found", robots: { index: false } };

  return createPremiumPublicRouteMetadata(
    resolved.site,
    route,
    resolved.locale,
    {
      origin: resolved.context.origin || SITE_URL,
      cleanUrls: resolved.context.cleanUrls,
    },
  );
}

export default async function PublicTemplatePathPage({
  params,
}: {
  params: Promise<TemplatePathParams>;
}) {
  const resolved = await resolveTemplatePath(await params);
  if (!resolved) notFound();

  const page = renderPublicSiteTemplatePath({
    site: resolved.site,
    path: resolved.path,
    basePath: resolved.context.cleanUrls
      ? resolved.locale === resolved.site.business.primary_locale
        ? "/"
        : `/${resolved.locale}`
      : `/site/${resolved.site.business.slug}${
          resolved.locale === resolved.site.business.primary_locale
            ? ""
            : `/${resolved.locale}`
        }`,
  });
  if (!page) notFound();
  return page;
}
