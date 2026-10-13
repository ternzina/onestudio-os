import { NextResponse, type NextRequest } from "next/server";
import { hostnameWithoutPort } from "@/lib/domains/normalize";
import { indexNowKey } from "@/lib/public-site/indexnow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOST = "cashpath.org";
const PROJECT_ID = "prj_FHof1waLZckf0uSKH0bz5cX5VpLL";
const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

/**
 * Read-only identity of the release actually serving CashPath's public domain.
 * The verification-file URL is public by the IndexNow protocol, not an API
 * credential. No submission endpoint, privileged token or DB access is exposed.
 */
export function GET(request: NextRequest) {
  const host = hostnameWithoutPort(
    (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
      .split(",")[0].trim(),
  );
  if (host !== HOST || process.env.VERCEL_ENV !== "production") {
    return new NextResponse("Not found", { status: 404, headers: responseHeaders });
  }
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || "";
  const deployment = process.env.VERCEL_URL || "";
  const project = process.env.VERCEL_PROJECT_ID;
  const key = indexNowKey();
  if (!/^[0-9a-f]{40}$/.test(commit) || !key || !deployment.endsWith(".vercel.app") ||
      (project && project !== PROJECT_ID)) {
    return NextResponse.json({ status: "release_metadata_unavailable" }, {
      status: 503, headers: responseHeaders,
    });
  }
  return NextResponse.json({
    version: 1,
    host: HOST,
    projectId: PROJECT_ID,
    environment: "production",
    commit,
    deployment,
    sitemapUrl: `https://${HOST}/sitemap.xml`,
    keyLocation: `https://${HOST}/${key}.txt`,
  }, { headers: responseHeaders });
}
