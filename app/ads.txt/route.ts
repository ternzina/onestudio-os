import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  hostnameWithoutPort,
  isPlatformHostname,
} from "@/lib/domains/normalize";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostname = hostnameWithoutPort(
    forwardedHost || request.headers.get("host") || "",
  );

  if (!hostname || isPlatformHostname(hostname)) {
    return new NextResponse("Not found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const { url, key } = getSupabaseConfig();
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc(
    "resolve_public_site_ads_txt",
    { p_domain: hostname },
  );

  if (error || typeof data !== "string" || !data.trim()) {
    return new NextResponse("Not found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const content = data.endsWith("\n") ? data : `${data}\n`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
