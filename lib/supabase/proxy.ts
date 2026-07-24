import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

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
    if (state === "ready") return redirectTo(request, "/admin");
    if (state === "bootstrap_required") {
      return redirectTo(request, "/admin/bootstrap");
    }
    return response;
  }

  if (state === "bootstrap_required") {
    return pathname === "/admin/bootstrap"
      ? response
      : redirectTo(request, "/admin/bootstrap");
  }

  if (state === "ready") {
    return pathname === "/admin/bootstrap"
      ? redirectTo(request, "/admin")
      : response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("error", "admin_access");
  return NextResponse.redirect(loginUrl);
}
