import type { NextRequest } from "next/server";
import { routeCustomDomain } from "@/lib/public-site/domain-routing";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const domainResponse = await routeCustomDomain(request);
  if (domainResponse) return domainResponse;

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
