import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

function requestHostname(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const rawHost = forwarded?.split(",")[0]?.trim()
    || request.headers.get("host")
    || new URL(request.url).hostname;

  return rawHost.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

export async function GET(request: NextRequest) {
  const hostname = requestHostname(request);
  const { url, key } = getSupabaseConfig();

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("resolve_public_site_adsense", {
    p_domain: hostname,
  });

  if (error || !data || typeof data !== "object") {
    return NextResponse.json(
      { enabled: false, publisherId: null },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const record = data as { enabled?: unknown; publisher_id?: unknown };
  const publisherId =
    typeof record.publisher_id === "string"
      && /^ca-pub-[0-9]{16}$/.test(record.publisher_id)
      ? record.publisher_id
      : null;

  return NextResponse.json(
    {
      enabled: record.enabled === true && Boolean(publisherId),
      publisherId,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
