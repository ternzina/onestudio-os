import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicCustomPage from "@/components/public/PublicCustomPage";
import { getPublicSite } from "@/lib/public-site/data";
import {
  createPublicPageMetadata,
} from "@/lib/public-site/metadata";

export const dynamic = "force-dynamic";

type CustomPageProps = {
  params: Promise<{ businessSlug: string; pageSlug: string }>;
};

export async function generateMetadata({
  params,
}: CustomPageProps): Promise<Metadata> {
  const { businessSlug, pageSlug } = await params;
  const site = await getPublicSite(businessSlug);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page) {
    return { title: "Page not found", robots: { index: false } };
  }

  return createPublicPageMetadata(site, page);
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { businessSlug, pageSlug } = await params;
  const site = await getPublicSite(businessSlug);
  const page = site?.content.pages?.find(
    (item) =>
      item.type === "custom" &&
      item.slug === pageSlug &&
      item.is_visible !== false,
  );

  if (!site || !page) notFound();
  return <PublicCustomPage site={site} page={page} />;
}
