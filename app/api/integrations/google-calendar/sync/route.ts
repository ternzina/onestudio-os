import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  businessIdForPublicSlug,
  syncGoogleCalendarForBusiness,
} from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  ).slice(0, 100);
}

function hashRateLimitValue(secret: string, kind: string, value: string) {
  return createHash("sha256")
    .update(`${secret}:${kind}:${value}`)
    .digest("hex");
}

async function claimRateLimit(
  supabaseAdmin: SupabaseClient,
  keyHash: string,
  limit: number,
  windowSeconds: number,
) {
  const { data, error } = await supabaseAdmin.rpc(
    "claim_booking_email_rate_limit",
    {
      p_ip_hash: keyHash,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    },
  );
  if (error) throw error;
  return data === true;
}

export async function POST(request: Request) {
  let body: { businessSlug?: unknown; bookingId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }
  const businessSlug =
    typeof body.businessSlug === "string"
      ? body.businessSlug.toLowerCase().trim()
      : "";
  const bookingId =
    typeof body.bookingId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(body.bookingId)
      ? body.bookingId
      : undefined;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(businessSlug)) {
    return NextResponse.json(
      { ok: false, error: "invalid_business_slug" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { ok: false, error: "sync_unavailable" },
      { status: 503 },
    );
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const secret = process.env.BOOKING_EMAIL_RATE_LIMIT_SECRET || supabaseSecretKey;
    const ip = getClientIp(request);
    const [ipAllowed, businessAllowed] = await Promise.all([
      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(secret, "public-calendar-ip", `${ip}:${businessSlug}`),
        10,
        5 * 60,
      ),
      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(secret, "public-calendar-business", businessSlug),
        60,
        10 * 60,
      ),
    ]);

    if (!ipAllowed || !businessAllowed) {
      return NextResponse.json(
        { ok: false, error: "sync_rate_limited" },
        { status: 429 },
      );
    }

    const businessId = await businessIdForPublicSlug(businessSlug);
    if (!businessId) {
      return NextResponse.json(
        { ok: false, error: "business_not_found" },
        { status: 404 },
      );
    }
    const result = await syncGoogleCalendarForBusiness(businessId, {
      bookingId,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Public Google Calendar sync failed", error);
    return NextResponse.json(
      { ok: false, error: "sync_unavailable" },
      { status: 503 },
    );
  }
}
