import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicBusinessSite from "@/components/public/PublicBusinessSite";
import PublicSiteStructuredData from "@/components/public/PublicSiteStructuredData";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicSiteMetadata } from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

type LocalizedPublicSitePageProps = {
  params: Promise<{ businessSlug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedPublicSitePageProps): Promise<Metadata> {
  const { businessSlug, locale } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug, locale),
    getPublicSiteRequestContext(),
  ]);

  if (!site || site.business.locale !== locale.toLowerCase()) {
    return { title: "Site not found", robots: { index: false } };
  }
  return createPublicSiteMetadata(site, locale, context);
}

export default async function LocalizedPublicSitePage({
  params,
}: LocalizedPublicSitePageProps) {
  const { businessSlug, locale } = await params;
  const normalizedLocale = locale.toLowerCase();
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug, normalizedLocale),
    getPublicSiteRequestContext(),
  ]);

  if (!site || site.business.locale !== normalizedLocale) notFound();
  if (normalizedLocale === site.business.primary_locale) {
    redirect(context.cleanUrls ? "/" : `/site/${site.business.slug}`);
  }

  return (
    <>
      <PublicSiteStructuredData site={site} />
      <PublicBusinessSite site={site} />
    </>
  );
}
