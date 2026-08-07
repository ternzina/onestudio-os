import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicSiteStructuredData from "@/components/public/PublicSiteStructuredData";
import { getPublicSite } from "@/lib/public-site/data";
import { createPublicSiteMetadata } from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

type PublicSitePageProps = {
  params: Promise<{ businessSlug: string }>;
};

export async function generateMetadata({
  params,
}: PublicSitePageProps): Promise<Metadata> {
  const { businessSlug } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);

  if (!site) return { title: "Site not found", robots: { index: false } };
  return createPublicSiteMetadata(site, null, context);
}

export default async function PublicSitePage({
  params,
}: PublicSitePageProps) {
  const { businessSlug } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  if (!site) notFound();

  return (
    <>
      <PublicSiteStructuredData site={site} />
      <PublicSiteTemplateRuntime site={site} basePath={context.cleanUrls ? "/" : `/site/${businessSlug}`} />
    </>
  );
}
