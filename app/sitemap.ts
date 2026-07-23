import type { MetadataRoute } from "next";
import { SITE_URL } from "./_seo/site";

const pages = [
  { path: "/", changeFrequency: "weekly", priority: 1, lastModified: "2026-07-14" },
  { path: "/wynajem-studia", changeFrequency: "weekly", priority: 0.95, lastModified: "2026-07-14" },
  { path: "/sesje-zdjeciowe", changeFrequency: "weekly", priority: 0.95, lastModified: "2026-07-14" },
  { path: "/portfolio", changeFrequency: "weekly", priority: 0.9, lastModified: "2026-07-14" },
  { path: "/wynajem-studia/cyklorama", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-14" },
  { path: "/wynajem-studia/cieple-wnetrze", changeFrequency: "monthly", priority: 0.75, lastModified: "2026-07-14" },
  { path: "/wynajem-studia/loft", changeFrequency: "monthly", priority: 0.75, lastModified: "2026-07-14" },
  { path: "/szkolenia", changeFrequency: "monthly", priority: 0.75, lastModified: "2026-07-14" },
  { path: "/kontakt", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-14" },
  { path: "/regulamin", changeFrequency: "yearly", priority: 0.2, lastModified: "2026-07-14" },
  { path: "/polityka-prywatnosci", changeFrequency: "yearly", priority: 0.2, lastModified: "2026-07-14" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: new Date(`${lastModified}T00:00:00+02:00`),
    changeFrequency,
    priority,
  }));
}
