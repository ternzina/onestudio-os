import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SITE_URL } from "@/app/_seo/site";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicSiteStructuredData from "@/components/public/PublicSiteStructuredData";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicSiteMetadata } from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";
import {
  createPremiumPublicRouteMetadata,
  resolvePremiumPublicRoute,
} from "@/lib/public-site/premium-route-metadata";

export const dynamic = "force-dynamic";

type LocalizedPublicSitePageProps = {
  params: Promise<{ businessSlug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedPublicSitePageProps): Promise<Metadata> {
  const { businessSlug, locale } = await params;
  const [localizedSite, context] = await Promise.all([
    getPublicSite(businessSlug, locale),
    getPublicSiteRequestContext(),
  ]);
  const site = localizedSite ?? await getPublicSite(businessSlug);

  if (!localizedSite && site) {
    const route = resolvePremiumPublicRoute(site, [locale.toLowerCase()]);
    if (route) {
      return createPremiumPublicRouteMetadata(
        site,
        route,
        site.business.locale,
        { origin: context.origin || SITE_URL, cleanUrls: context.cleanUrls },
      );
    }
  }

  if (!localizedSite || localizedSite.business.locale !== locale.toLowerCase()) {
    return { title: "Site not found", robots: { index: false } };
  }
  return createPublicSiteMetadata(localizedSite, locale, context);
}

export default async function LocalizedPublicSitePage({
  params,
}: LocalizedPublicSitePageProps) {
  const { businessSlug, locale } = await params;
  const normalizedLocale = locale.toLowerCase();
  const [localizedSite, context] = await Promise.all([
    getPublicSite(businessSlug, normalizedLocale),
    getPublicSiteRequestContext(),
  ]);

  if (!localizedSite) {
    const site = await getPublicSite(businessSlug);
    if (!site) notFound();
    const templatePage = renderPublicSiteTemplatePath({
      site,
      path: [normalizedLocale],
      basePath: context.cleanUrls ? "/" : `/site/${businessSlug}`,
    });
    if (templatePage) return templatePage;
    notFound();
  }
  const site = localizedSite;

  if (!site || site.business.locale !== normalizedLocale) notFound();
  if (normalizedLocale === site.business.primary_locale) {
    redirect(context.cleanUrls ? "/" : `/site/${site.business.slug}`);
  }

  return (
    <>
      <PublicSiteStructuredData site={site} />
      <PublicSiteTemplateRuntime site={site} basePath={`/site/${businessSlug}/${normalizedLocale}`} />
    </>
  );
}
