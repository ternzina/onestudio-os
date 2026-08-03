import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { hostnameWithoutPort, isPlatformHostname } from "@/lib/domains/normalize";
import { getSupabaseConfig } from "@/lib/supabase/config";

type DomainResolution = {
  business_id: string;
  business_slug: string;
  primary_locale: string;
};

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
];

function platformUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://onestudioos.com";
  const url = new URL(request.nextUrl.pathname + request.nextUrl.search, configured);
  return url;
}

function isPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

async function resolveDomain(hostname: string) {
  const { url, key } = getSupabaseConfig();
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("resolve_public_site_domain", {
    p_domain: hostname,
  });

  if (error || !Array.isArray(data) || !data[0]) return null;
  return data[0] as DomainResolution;
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
    forwardedHost || request.headers.get("host") || "",
  );

  if (!hostname || isPlatformHostname(hostname)) return null;

  if (APP_ONLY_PREFIXES.some((prefix) => isPrefix(request.nextUrl.pathname, prefix))) {
    return NextResponse.redirect(platformUrl(request), 307);
  }

  if (GLOBAL_PUBLIC_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return null;
  }

  const resolution = await resolveDomain(hostname);

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
  requestHeaders.set("x-onestudio-business-slug", resolution.business_slug);
  requestHeaders.set("x-onestudio-primary-locale", resolution.primary_locale);

  return NextResponse.rewrite(destination, {
    request: { headers: requestHeaders },
  });
}
