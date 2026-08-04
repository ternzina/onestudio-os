import { NextResponse, type NextRequest } from "next/server";
import {
  hostnameWithoutPort,
  isPlatformHostname,
} from "@/lib/domains/normalize";
import { resolvePublicSiteDomain } from "@/lib/public-site/domain-resolution";

const APP_ONLY_PREFIXES = [
  "/admin",
  "/dashboard",
  "/login",
  "/register",
  "/launch",
  "/demos",
  "/configure",
];

const GLOBAL_PUBLIC_PREFIXES = [
  "/api/",
  "/auth/",
  "/book/",
  "/request/",
  "/domain-not-connected",
  "/robots.txt",
  "/sitemap.xml",
  "/ads.txt",
];

function platformUrl(request: NextRequest) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || "https://onestudioos.com";
  return new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    configured,
  );
}

function isPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function cleanCustomPath(pathname: string, businessSlug: string) {
  const base = `/site/${businessSlug}`;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length) || "/";
  }
  return null;
}

export async function routeCustomDomain(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostname = hostnameWithoutPort(
    forwardedHost?.split(",")[0]?.trim() ||
      request.headers.get("host") ||
      "",
  );

  if (!hostname || isPlatformHostname(hostname)) return null;

  if (
    APP_ONLY_PREFIXES.some((prefix) =>
      isPrefix(request.nextUrl.pathname, prefix),
    )
  ) {
    return NextResponse.redirect(platformUrl(request), 307);
  }

  if (
    GLOBAL_PUBLIC_PREFIXES.some((prefix) =>
      request.nextUrl.pathname.startsWith(prefix),
    )
  ) {
    return null;
  }

  const resolution = await resolvePublicSiteDomain(hostname);

  if (!resolution) {
    if (request.nextUrl.pathname === "/domain-not-connected") return null;

    const unavailable = request.nextUrl.clone();
    unavailable.pathname = "/domain-not-connected";
    unavailable.search = "";
    unavailable.searchParams.set("host", hostname);
    return NextResponse.rewrite(unavailable);
  }

  const cleanPath = cleanCustomPath(
    request.nextUrl.pathname,
    resolution.business_slug,
  );

  if (cleanPath) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = cleanPath;
    return NextResponse.redirect(redirect, 308);
  }

  const destination = request.nextUrl.clone();
  destination.pathname = `/site/${resolution.business_slug}${
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  }`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-onestudio-custom-domain", hostname);
  requestHeaders.set(
    "x-onestudio-business-slug",
    resolution.business_slug,
  );
  requestHeaders.set(
    "x-onestudio-primary-locale",
    resolution.primary_locale,
  );

  return NextResponse.rewrite(destination, {
    request: { headers: requestHeaders },
  });
}
