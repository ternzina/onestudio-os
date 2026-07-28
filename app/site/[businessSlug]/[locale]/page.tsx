import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicBusinessSite from "@/components/public/PublicBusinessSite";
import PublicSiteStructuredData from "@/components/public/PublicSiteStructuredData";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicSiteMetadata } from "@/lib/public-site/metadata";

export const dynamic = "force-dynamic";

type LocalizedPublicSitePageProps = {
  params: Promise<{ businessSlug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedPublicSitePageProps): Promise<Metadata> {
  const { businessSlug, locale } = await params;
  const site = await getPublicSite(businessSlug, locale);

  if (!site || site.business.locale !== locale.toLowerCase()) {
    return { title: "Site not found", robots: { index: false } };
  }
  return createPublicSiteMetadata(site, locale);
}

export default async function LocalizedPublicSitePage({
  params,
}: LocalizedPublicSitePageProps) {
  const { businessSlug, locale } = await params;
  const normalizedLocale = locale.toLowerCase();
  const site = await getPublicSite(businessSlug, normalizedLocale);

  if (!site || site.business.locale !== normalizedLocale) notFound();
  if (normalizedLocale === site.business.primary_locale) {
    redirect(`/site/${site.business.slug}`);
  }

  return (
    <>
      <PublicSiteStructuredData site={site} />
      <PublicBusinessSite site={site} />
    </>
  );
}
