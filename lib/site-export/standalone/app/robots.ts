import type { MetadataRoute } from "next";
import { readSite } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = readSite();
  if (site.noIndex) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.canonicalOrigin}/sitemap.xml`,
    host: site.canonicalOrigin,
  };
}
