import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicCustomPage from "@/components/public/PublicCustomPage";
import { getPublicSite } from "@/lib/public-site/data";
import {
  cleanPublicPagePath,
  createPublicPageMetadata,
  publicCustomPagePath,
} from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

type LocalizedCustomPageProps = {
  params: Promise<{
    businessSlug: string;
    locale: string;
    pageSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: LocalizedCustomPageProps): Promise<Metadata> {
  const { businessSlug, locale, pageSlug } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug, locale),
    getPublicSiteRequestContext(),
  ]);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page || site.business.locale !== locale.toLowerCase()) {
    return { title: "Page not found", robots: { index: false } };
  }

  return createPublicPageMetadata(site, page, locale, context);
}

export default async function LocalizedCustomPage({
  params,
}: LocalizedCustomPageProps) {
  const { businessSlug, locale, pageSlug } = await params;
  const normalizedLocale = locale.toLowerCase();
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug, normalizedLocale),
    getPublicSiteRequestContext(),
  ]);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page || site.business.locale !== normalizedLocale) notFound();
  if (normalizedLocale === site.business.primary_locale) {
    redirect(
      context.cleanUrls
        ? cleanPublicPagePath(page.slug, null, true)
        : publicCustomPagePath(site.business.slug, page.slug),
    );
  }

  return <PublicCustomPage site={site} page={page} />;
}
