import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicBusinessSite from "@/components/public/PublicBusinessSite";
import PublicSiteStructuredData from "@/components/public/PublicSiteStructuredData";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicSiteMetadata } from "@/lib/public-site/metadata";

export const dynamic = "force-dynamic";

type PublicSitePageProps = {
  params: Promise<{ businessSlug: string }>;
};

export async function generateMetadata({
  params,
}: PublicSitePageProps): Promise<Metadata> {
  const { businessSlug } = await params;
  const site = await getPublicSite(businessSlug);

  if (!site) return { title: "Site not found", robots: { index: false } };
  return createPublicSiteMetadata(site);
}

export default async function PublicSitePage({
  params,
}: PublicSitePageProps) {
  const { businessSlug } = await params;
  const site = await getPublicSite(businessSlug);
  if (!site) notFound();

  return (
    <>
      <PublicSiteStructuredData site={site} />
      <PublicBusinessSite site={site} />
    </>
  );
}
