import type { MetadataRoute } from "next";
import { resolvePublicSiteBrand } from "../public-site/identity.ts";
import type { PublicSiteData } from "../public-site/types.ts";
import { safeLocale } from "./request.ts";

export function platformManifest(): MetadataRoute.Manifest {
  return {
    name: "OneStudio OS",
    short_name: "OneStudio OS",
    description: "A digital operating system for service businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    lang: "en",
    icons: [{ src: "/onestudio-icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

export function tenantManifest(input: { name: string; locale: string; favicon?: string | null }): MetadataRoute.Manifest {
  return {
    name: input.name,
    short_name: input.name,
    description: input.name,
    start_url: "/",
    display: "standalone",
    lang: safeLocale(input.locale),
    icons: input.favicon ? [{ src: input.favicon, sizes: "any" }] : undefined,
  };
}

export function tenantSiteManifest(site: PublicSiteData): MetadataRoute.Manifest {
  return tenantManifest({
    name: resolvePublicSiteBrand(site),
    locale: site.business.primary_locale,
    favicon: site.content.favicon_url,
  });
}
