import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicPageMetadata } from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";
import { publishedCashPathGuidePage } from "@/lib/public-site/cashpath-guides";

export const dynamic = "force-dynamic";

type CustomPageProps = {
  params: Promise<{ businessSlug: string; pageSlug: string }>;
};

export async function generateMetadata({
  params,
}: CustomPageProps): Promise<Metadata> {
  const { businessSlug, pageSlug } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page) {
    return { title: "Page not found", robots: { index: false } };
  }

  return createPublicPageMetadata(
    site,
    publishedCashPathGuidePage(site.content, page),
    null,
    context,
  );
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { businessSlug, pageSlug } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page) notFound();
  const resolvedPage = publishedCashPathGuidePage(site.content, page);
  return (
    <PublicCustomPageRuntime
      site={site}
      page={resolvedPage}
      basePath={context.cleanUrls ? "/" : `/site/${businessSlug}`}
    />
  );
}
