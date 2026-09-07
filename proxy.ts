import { NextResponse, type NextRequest } from "next/server";
import { routeCustomDomain } from "@/lib/public-site/domain-routing";
import { updateSession } from "@/lib/supabase/proxy";
import { isTechnicalPlatformHostname, hostnameWithoutPort } from "@/lib/domains/normalize";
import { localeFromTenantPath } from "@/lib/seo/request";

export async function proxy(request: NextRequest) {
  const indexNowMatch = request.nextUrl.pathname.match(/^\/([A-Za-z0-9-]{8,128})\.txt$/);
  if (indexNowMatch) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-onestudio-indexnow-key", indexNowMatch[1]);
    return NextResponse.rewrite(new URL("/api/public/indexnow-key", request.url), { request: { headers: requestHeaders } });
  }
  const domainResponse = await routeCustomDomain(request);
  if (domainResponse) return domainResponse;
  const hostname = hostnameWithoutPort(request.headers.get("x-forwarded-host") || request.headers.get("host") || "");
  if (request.nextUrl.pathname.startsWith("/site/")) {
    request.headers.set("x-onestudio-tenant-route", "1");
    const businessSlug = request.nextUrl.pathname.split("/").filter(Boolean)[1];
    if (businessSlug) request.headers.set("x-onestudio-business-slug", businessSlug);
    const locale = localeFromTenantPath(request.nextUrl.pathname, false);
    if (locale) request.headers.set("x-onestudio-request-locale", locale);
  }
  const response = await updateSession(request);
  if (isTechnicalPlatformHostname(hostname)) response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
