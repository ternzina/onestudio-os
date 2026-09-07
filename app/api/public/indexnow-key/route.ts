import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isCanonicalPlatformHostname, isTechnicalPlatformHostname, hostnameWithoutPort } from "@/lib/domains/normalize";
import { resolvePublicSiteDomain } from "@/lib/public-site/domain-resolution";
import { indexNowKey } from "@/lib/public-site/indexnow";

export const dynamic = "force-dynamic";
export async function GET() {
  const key = indexNowKey(); const headerStore = await headers();
  const requested = headerStore.get("x-onestudio-indexnow-key");
  const host = hostnameWithoutPort(headerStore.get("host") ?? "");
  const validHost = host && !isTechnicalPlatformHostname(host) && (isCanonicalPlatformHostname(host) || Boolean(await resolvePublicSiteDomain(host)));
  if (!key || requested !== key || !validHost) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(key, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" } });
}
