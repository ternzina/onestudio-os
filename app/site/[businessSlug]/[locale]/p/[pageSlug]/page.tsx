import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicCustomPage from "@/components/public/PublicCustomPage";
import { getPublicSite } from "@/lib/public-site/data";
import {
  createPublicPageMetadata,
  publicCustomPagePath,
} from "@/lib/public-site/metadata";

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
  const site = await getPublicSite(businessSlug, locale);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page || site.business.locale !== locale.toLowerCase()) {
    return { title: "Page not found", robots: { index: false } };
  }

  return createPublicPageMetadata(site, page, locale);
}

export default async function LocalizedCustomPage({
  params,
}: LocalizedCustomPageProps) {
  const { businessSlug, locale, pageSlug } = await params;
  const normalizedLocale = locale.toLowerCase();
  const site = await getPublicSite(businessSlug, normalizedLocale);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page || site.business.locale !== normalizedLocale) notFound();
  if (normalizedLocale === site.business.primary_locale) {
    redirect(publicCustomPagePath(site.business.slug, page.slug));
  }

  return <PublicCustomPage site={site} page={page} />;
}
