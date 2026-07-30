import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicPortfolioPage from "@/components/public/PublicPortfolioPage";
import { getPublicSite } from "@/lib/public-site/data";
import {
  createPublicPageMetadata,
} from "@/lib/public-site/metadata";

export const dynamic = "force-dynamic";

type PortfolioPageProps = {
  params: Promise<{ businessSlug: string }>;
};

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { businessSlug } = await params;
  const site = await getPublicSite(businessSlug);
  const page = site?.content.pages?.find(
    (item) => item.type === "portfolio" && item.is_visible !== false,
  );

  if (!site || !page) {
    return { title: "Page not found", robots: { index: false } };
  }

  return createPublicPageMetadata(site, page);
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { businessSlug } = await params;
  const site = await getPublicSite(businessSlug);
  const page = site?.content.pages?.find(
    (item) => item.type === "portfolio" && item.is_visible !== false,
  );

  if (!site || !page) notFound();
  return <PublicPortfolioPage site={site} page={page} />;
}
