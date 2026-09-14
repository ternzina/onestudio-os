import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CashPathGuidesHub from "@/components/public/cashpath/CashPathGuidesHub";
import { getPublicSite } from "@/lib/public-site/data";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Personal Loan Guides & Financial Education | CashPath", description: "Educational personal loan guides from CashPath.", alternates: { canonical: "/p/guides" } };
export default async function CashPathGuidesPage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = await params;
  const [site, context] = await Promise.all([getPublicSite(businessSlug), getPublicSiteRequestContext()]);
  if (!site || site.content.template_id !== "cashpath") notFound();
  return <CashPathGuidesHub site={site} basePath={context.cleanUrls ? "/" : `/site/${businessSlug}`} />;
}
