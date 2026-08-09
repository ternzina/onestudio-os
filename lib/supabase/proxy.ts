import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CoreModuleKey } from "@/lib/modules/contracts";
import { getSupabaseConfig } from "./config";
import { safeAuthReturnPath } from "@/lib/auth/return-path";

export type AdminAccessState =
  | "signed_out"
  | "bootstrap_required"
  | "ready"
  | "denied";

type AdminAccessRow = {
  access_state: AdminAccessState;
  business_id: string | null;
  business_role: string | null;
};

function safeNextPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function authNextPath(request: NextRequest) {
  return safeAuthReturnPath(request.nextUrl.searchParams.get("next"), "") || null;
}

function moduleForAdminPath(pathname: string): CoreModuleKey | null {
  const prefixes: Array<[string, CoreModuleKey]> = [
    ["/admin/settings/company", "documents"],
    ["/admin/availability", "scheduling"],
    ["/admin/bookings", "scheduling"],
    ["/admin/calendar", "scheduling"],
    ["/admin/catalog", "catalog"],
    ["/admin/clients", "crm"],
    ["/admin/payments", "payments"],
    ["/admin/notifications", "notifications"],
    ["/admin/media", "media"],
    ["/admin/portfolio", "portfolio"],
    ["/admin/legal", "documents"],
    ["/admin/documents", "documents"],
    ["/admin/analytics", "analytics"],
  ];
  return prefixes.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? null;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAuthPath = pathname === "/login" || pathname === "/register";

  if (!isAdminPath && !isPublicAuthPath) {
    await supabase.auth.getUser();
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!isAdminPath) return response;

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", safeNextPath(request));
    return NextResponse.redirect(loginUrl);
  }

  const { data, error } = await supabase.rpc("get_admin_access_state");
  const access = !error && Array.isArray(data)
    ? (data[0] as AdminAccessRow | undefined)
    : undefined;
  const state = access?.access_state ?? "denied";

  if (isPublicAuthPath) {
    const next = authNextPath(request);
    if (state === "ready") return redirectTo(request, next ?? "/admin");
    if (state === "bootstrap_required") {
      return redirectTo(request, next ?? "/new-site");
    }
    if (next?.startsWith("/new-site")) return redirectTo(request, next);
    if (state === "denied") return redirectTo(request, "/dashboard");
    return response;
  }

  if (state === "bootstrap_required") {
    return pathname === "/admin/bootstrap"
      ? response
      : redirectTo(request, "/new-site");
  }

  if (state === "ready") {
    if (pathname === "/admin/bootstrap") return redirectTo(request, "/admin");

    const moduleKey = moduleForAdminPath(pathname);
    if (moduleKey && access?.business_id) {
      const { data: moduleAccess, error: moduleError } = await supabase
        .from("business_modules")
        .select("enabled")
        .eq("business_id", access.business_id)
        .eq("module_key", moduleKey)
        .maybeSingle();

      if (!moduleError && moduleAccess?.enabled !== true) {
        return redirectTo(request, "/admin/modules");
      }
    }

    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("error", "admin_access");
  return NextResponse.redirect(loginUrl);
}
