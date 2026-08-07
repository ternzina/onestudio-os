import { notFound } from "next/navigation";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";
import { getPublicSite } from "@/lib/public-site/data";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

export default async function PublicTemplatePathPage({
  params,
}: {
  params: Promise<{
    businessSlug: string;
    locale: string;
    templatePath: string[];
  }>;
}) {
  const { businessSlug, locale, templatePath } = await params;
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  if (!site) notFound();

  const page = renderPublicSiteTemplatePath({
    site,
    path: [locale, ...templatePath],
    basePath: context.cleanUrls ? "/" : `/site/${businessSlug}`,
  });
  if (!page) notFound();
  return page;
}
