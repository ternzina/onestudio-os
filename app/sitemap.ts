import type { MetadataRoute } from "next";
import { SITE_URL } from "./_seo/site";
import { listPublicSitePaths } from "@/lib/public-site/data";
import { publicSitePath } from "@/lib/public-site/metadata";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicSites = await listPublicSitePaths();
  const workspacePages: MetadataRoute.Sitemap = publicSites.map((entry) => ({
    url: new URL(
      publicSitePath(
        entry.business_slug,
        entry.is_primary ? null : entry.locale,
      ),
      SITE_URL,
    ).toString(),
    lastModified: new Date(entry.updated_at),
    changeFrequency: "weekly",
    priority: entry.is_primary ? 0.9 : 0.8,
  }));

  return [
    {
      url: SITE_URL.toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...workspacePages,
  ];
}
