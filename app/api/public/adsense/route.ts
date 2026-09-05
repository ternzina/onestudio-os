import { NextRequest, NextResponse } from "next/server";
import { resolvePublicSiteAdSense } from "@/lib/public-site/adsense";

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
  const config = await resolvePublicSiteAdSense(hostname);

  return NextResponse.json(
    {
      enabled: config.enabled,
      publisherId: config.publisherId,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
