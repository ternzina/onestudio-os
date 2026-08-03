import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicPortfolioPage from "@/components/public/PublicPortfolioPage";
import { getPublicSite } from "@/lib/public-site/data";
import {
  cleanPublicPagePath,
  createPublicPageMetadata,
  publicSitePagePath,
} from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

type LocalizedPortfolioPageProps = {
  params: Promise<{ businessSlug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedPortfolioPageProps): Promise<Metadata> {
  const { businessSlug, locale } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug, locale),
    getPublicSiteRequestContext(),
  ]);
  const page = site?.content.pages?.find(
    (item) => item.type === "portfolio" && item.is_visible !== false,
  );

  if (!site || !page || site.business.locale !== locale.toLowerCase()) {
    return { title: "Page not found", robots: { index: false } };
  }

  return createPublicPageMetadata(site, page, locale, context);
}

export default async function LocalizedPortfolioPage({
  params,
}: LocalizedPortfolioPageProps) {
  const { businessSlug, locale } = await params;
  const normalizedLocale = locale.toLowerCase();
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug, normalizedLocale),
    getPublicSiteRequestContext(),
  ]);
  const page = site?.content.pages?.find(
    (item) => item.type === "portfolio" && item.is_visible !== false,
  );

  if (!site || !page || site.business.locale !== normalizedLocale) notFound();
  if (normalizedLocale === site.business.primary_locale) {
    redirect(
      context.cleanUrls
        ? cleanPublicPagePath(page.slug)
        : publicSitePagePath(site.business.slug, page.slug),
    );
  }

  return <PublicPortfolioPage site={site} page={page} />;
}
