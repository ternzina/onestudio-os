import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { dispatchQueuedNotificationsBestEffort } from "@/lib/server/notifications/immediate-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_REQUEST_BYTES = 16 * 1024;
const IP_LIMIT = 20;
const IP_WINDOW_SECONDS = 15 * 60;
const EMAIL_LIMIT = 6;
const EMAIL_WINDOW_SECONDS = 60 * 60;
const BUSINESS_LIMIT = 180;
const BUSINESS_WINDOW_SECONDS = 15 * 60;

type BookingBody = {
  businessSlug?: unknown;
  serviceId?: unknown;
  startsAt?: unknown;
  durationMinutes?: unknown;
  partySize?: unknown;
  clientName?: unknown;
  clientEmail?: unknown;
  clientPhone?: unknown;
  locale?: unknown;
  customerNotes?: unknown;
  requestKey?: unknown;
};

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

async function readBody(request: Request): Promise<BookingBody | null> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) return null;

  const raw = await request.text();
  if (!raw || Buffer.byteLength(raw, "utf8") > MAX_REQUEST_BYTES) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as BookingBody)
      : null;
  } catch {
    return null;
  }
}

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function integer(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : Number.NaN;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function errorCode(message: string) {
  const known = [
    "booking_slot_unavailable",
    "booking_slot_conflict",
    "invalid_public_booking_client_name",
    "invalid_public_booking_client_email",
    "invalid_public_booking_client_phone",
    "invalid_public_booking_duration",
    "invalid_public_booking_party_size",
    "invalid_public_booking_locale",
    "public_booking_service_not_found",
    "public_booking_business_not_found",
  ];
  return known.find((value) => message.includes(value)) || "public_booking_failed";
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    if (!body) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const businessSlug = text(body.businessSlug, 120).toLowerCase();
    const serviceId = text(body.serviceId, 64);
    const startsAt = text(body.startsAt, 80);
    const durationMinutes = integer(body.durationMinutes);
    const partySize = integer(body.partySize);
    const clientName = text(body.clientName, 160);
    const clientEmail = text(body.clientEmail, 254).toLowerCase();
    const clientPhone = text(body.clientPhone, 40);
    const locale = text(body.locale, 16).toLowerCase();
    const customerNotes = text(body.customerNotes, 4000);
    const requestKey = text(body.requestKey, 64);

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(businessSlug) ||
      !isUuid(serviceId) ||
      !isUuid(requestKey) ||
      Number.isNaN(Date.parse(startsAt)) ||
      !Number.isInteger(durationMinutes) ||
      !Number.isInteger(partySize) ||
      !clientName ||
      !clientEmail
    ) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Public booking gateway is not configured", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasSupabaseSecretKey: Boolean(supabaseSecretKey),
      });
      return NextResponse.json(
        { ok: false, error: "booking_gateway_unavailable" },
        { status: 503 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const rateLimitSecret =
      process.env.BOOKING_EMAIL_RATE_LIMIT_SECRET || supabaseSecretKey;
    const ip = getClientIp(request);

    const [ipAllowed, emailAllowed, businessAllowed] = await Promise.all([
      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(rateLimitSecret, "public-booking-ip", ip),
        IP_LIMIT,
        IP_WINDOW_SECONDS,
      ),
      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(rateLimitSecret, "public-booking-email", clientEmail),
        EMAIL_LIMIT,
        EMAIL_WINDOW_SECONDS,
      ),
      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(rateLimitSecret, "public-booking-business", businessSlug),
        BUSINESS_LIMIT,
        BUSINESS_WINDOW_SECONDS,
      ),
    ]);

    if (!ipAllowed || !emailAllowed || !businessAllowed) {
      return NextResponse.json({ ok: false, error: "booking_rate_limited" }, { status: 429 });
    }

    const { data, error } = await supabaseAdmin.rpc("create_public_booking", {
      p_business_slug: businessSlug,
      p_service_id: serviceId,
      p_starts_at: startsAt,
      p_duration_minutes: durationMinutes,
      p_party_size: partySize,
      p_client_name: clientName,
      p_client_email: clientEmail,
      p_client_phone: clientPhone || null,
      p_locale: locale || null,
      p_customer_notes: customerNotes,
      p_request_key: requestKey,
    });

    if (error) {
      const code = errorCode(error.message);
      const status = code.includes("not_found") ? 404 : code.startsWith("invalid_") ? 400 : 409;
      return NextResponse.json({ ok: false, error: code }, { status });
    }

    const confirmation = Array.isArray(data) ? data[0] : data;
    if (!confirmation?.booking_id) {
      return NextResponse.json({ ok: false, error: "public_booking_failed" }, { status: 500 });
    }

    const origin = new URL(request.url).origin;
    const { data: managementData, error: managementError } =
      await supabaseAdmin.rpc("ensure_public_booking_management_link", {
        p_booking_id: confirmation.booking_id,
        p_request_key: requestKey,
        p_base_url: origin,
      });
    const management =
      managementData &&
      typeof managementData === "object" &&
      !Array.isArray(managementData)
        ? (managementData as { token?: unknown; manage_url?: unknown })
        : null;
    const managementToken =
      typeof management?.token === "string" ? management.token : "";
    const manageUrl =
      typeof management?.manage_url === "string"
        ? management.manage_url
        : "";
    const calendarUrl = managementToken
      ? `${origin}/api/public/bookings/manage/calendar?token=${encodeURIComponent(
          managementToken,
        )}`
      : "";

    if (managementError || !managementToken || !manageUrl) {
      console.error("Public booking management link could not be prepared", {
        bookingId: confirmation.booking_id,
        message:
          managementError?.message || "booking_management_link_missing",
      });
    }

    const notificationDispatch =
      await dispatchQueuedNotificationsBestEffort("public-booking-created");

    const [{ data: payment }, { count: queuedCount }] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("payment_required,payment_status,total_minor,paid_minor,refunded_minor")
        .eq("id", confirmation.booking_id)
        .single(),
      supabaseAdmin
        .from("notification_jobs")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", confirmation.booking_id)
        .in("event_type", ["booking_confirmed", "booking_pending"]),
    ]);

    const dueMinor = payment
      ? Math.max(
          0,
          Number(payment.total_minor || 0) -
            Math.max(0, Number(payment.paid_minor || 0) - Number(payment.refunded_minor || 0)),
        )
      : Number(confirmation.total_minor || 0);

    return NextResponse.json({
      ok: true,
      confirmation: {
        ...confirmation,
        payment_required: Boolean(payment?.payment_required),
        payment_status: payment?.payment_status || "not_required",
        due_minor: dueMinor,
        email_queued: Number(queuedCount || 0) > 0,
        email_dispatch_attempted: true,
        email_dispatch_ok: notificationDispatch.ok,
        manage_url:
          managementError || !manageUrl ? null : manageUrl,
        calendar_url:
          managementError || !calendarUrl ? null : calendarUrl,
      },
    });
  } catch (error) {
    console.error("Public booking gateway failed", error);
    return NextResponse.json(
      { ok: false, error: "booking_gateway_unavailable" },
      { status: 503 },
    );
  }
}
