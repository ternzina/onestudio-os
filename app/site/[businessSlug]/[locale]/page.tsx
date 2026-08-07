import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicSiteStructuredData from "@/components/public/PublicSiteStructuredData";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicSiteMetadata } from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";

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
    const templatePage = renderPublicSiteTemplatePath({
      site,
      path: [locale],
      basePath: `/site/${businessSlug}`,
    });
    if (templatePage) {
      return { title: `${locale} | ${site.content.brand_name || site.business.name}`, robots: { index: false } };
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
