import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { submitIndexNow } from "@/lib/public-site/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PLATFORM_ORIGIN = "https://onestudioos.com";

type GuideCronRow = {
  article_id: string;
  slug: string;
};

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function authorized(request: Request) {
  const secret = (process.env.CRON_SECRET || "").trim();
  if (secret.length < 16) {
    return { ok: false, status: 503, reason: "cron_secret_not_configured" };
  }
  const expected = `Bearer ${secret}`;
  const authorization = request.headers.get("authorization") || "";
  return safeEqual(authorization, expected)
    ? { ok: true, status: 200, reason: "" }
    : { ok: false, status: 401, reason: "cron_unauthorized" };
}

function createCronSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  ).trim();

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing Supabase server secret");

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function liveGuide(slug: string) {
  const response = await fetch(
    `${PLATFORM_ORIGIN}/guides/${slug}?guide_cron=${Date.now()}`,
    {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
      headers: { "user-agent": "OneStudio-Guide-Auto-Publisher/1.0" },
    },
  );
  return response.ok;
}

async function sitemapGuideSlugs() {
  const response = await fetch(
    `${PLATFORM_ORIGIN}/sitemap.xml?guide_cron=${Date.now()}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { "user-agent": "OneStudio-Guide-Auto-Publisher/1.0" },
    },
  );
  if (!response.ok) return new Set<string>();

  const xml = await response.text();
  const slugs = new Set<string>();
  for (const match of xml.matchAll(
    /<loc>https:\/\/onestudioos\.com\/guides\/([a-z0-9-]+)<\/loc>/g,
  )) {
    slugs.add(match[1]);
  }
  return slugs;
}

async function handle(request: Request) {
  const auth = authorized(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.reason },
      { status: auth.status },
    );
  }

  try {
    const supabase = createCronSupabase();

    const { data: publishedData, error: publishError } = await supabase.rpc(
      "publish_review_guides_for_cron",
      { p_limit: 20 },
    );
    if (publishError) throw publishError;
    const published = (publishedData ?? []) as GuideCronRow[];

    const { data: pendingData, error: pendingError } = await supabase.rpc(
      "pending_guide_indexnow_for_cron",
      { p_limit: 50 },
    );
    if (pendingError) throw pendingError;
    const pending = (pendingData ?? []) as GuideCronRow[];

    if (!pending.length) {
      return NextResponse.json({
        ok: true,
        published: published.map((row) => row.slug),
        pendingIndexNow: 0,
        submitted: [],
        deferred: [],
        indexNow: "skipped",
      });
    }

    const sitemapSlugs = await sitemapGuideSlugs();
    const ready: GuideCronRow[] = [];
    const deferred: GuideCronRow[] = [];

    for (const row of pending) {
      if ((await liveGuide(row.slug)) && sitemapSlugs.has(row.slug)) {
        ready.push(row);
      } else {
        deferred.push(row);
      }
    }

    if (!ready.length) {
      return NextResponse.json(
        {
          ok: false,
          published: published.map((row) => row.slug),
          pendingIndexNow: pending.length,
          submitted: [],
          deferred: deferred.map((row) => row.slug),
          indexNow: "deferred_live_verification",
        },
        { status: 503 },
      );
    }

    const urls = [
      `${PLATFORM_ORIGIN}/`,
      `${PLATFORM_ORIGIN}/guides`,
      ...ready.map((row) => `${PLATFORM_ORIGIN}/guides/${row.slug}`),
    ];

    const indexNow = await submitIndexNow(urls);
    const accepted = [
      "accepted",
      "accepted_pending",
      "submitted",
    ].includes(indexNow.status);

    if (!accepted) {
      return NextResponse.json(
        {
          ok: false,
          published: published.map((row) => row.slug),
          pendingIndexNow: pending.length,
          submitted: [],
          deferred: pending.map((row) => row.slug),
          indexNow,
        },
        { status: 503 },
      );
    }

    const articleIds = ready.map((row) => row.article_id);
    const { data: marked, error: markError } = await supabase.rpc(
      "mark_guide_indexnow_submitted_for_cron",
      { p_article_ids: articleIds },
    );
    if (markError) throw markError;

    return NextResponse.json({
      ok: true,
      published: published.map((row) => row.slug),
      pendingIndexNow: pending.length,
      submitted: ready.map((row) => row.slug),
      deferred: deferred.map((row) => row.slug),
      marked,
      indexNow,
    });
  } catch (error) {
    console.error("Guide publisher cron failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
