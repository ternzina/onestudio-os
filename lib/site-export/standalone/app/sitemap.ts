import type { MetadataRoute } from "next";
import sitemapEntries from "../data/sitemap.json";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries as MetadataRoute.Sitemap;
}
