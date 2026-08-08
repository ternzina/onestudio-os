import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "./_seo/site";
import { isCanonicalPlatformHostname, isTechnicalPlatformHostname } from "@/lib/domains/normalize";
import {
  requestHostname,
  requestOrigin,
  resolvePublicSiteDomain,
} from "@/lib/public-site/domain-resolution";

export const dynamic = "force-dynamic";

const PLATFORM_DISALLOW = [
  "/admin",
  "/dashboard",
  "/api",
  "/login",
  "/register",
  "/reset-password",
  "/gallery",
];

const CUSTOM_DOMAIN_DISALLOW = [
  "/admin",
  "/dashboard",
  "/api",
  "/login",
  "/register",
  "/reset-password",
  "/gallery",
  "/site/",
];

function platformRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PLATFORM_DISALLOW,
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    host: SITE_URL.origin,
  };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const hostname = requestHostname(headerStore);

  if (hostname && isTechnicalPlatformHostname(hostname)) return { rules: { userAgent: "*", disallow: "/" } };
  if (!hostname || isCanonicalPlatformHostname(hostname) || hostname === "localhost" || hostname === "127.0.0.1") {
    return platformRobots();
  }

  const [origin, resolution] = await Promise.all([
    Promise.resolve(requestOrigin(headerStore)),
    resolvePublicSiteDomain(hostname),
  ]);

  if (!origin || !resolution) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: origin || undefined,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: CUSTOM_DOMAIN_DISALLOW,
    },
    sitemap: new URL("/sitemap.xml", origin).toString(),
    host: origin,
  };
}
