import { NextResponse } from "next/server";
import {
  bookingManagementErrorCode,
  claimPublicBookingManagementRateLimit,
  getPublicBookingAdminClient,
  isManagementToken,
  type PublicBookingManagementContext,
} from "@/lib/booking/public-management";
import { dispatchQueuedNotificationsBestEffort } from "@/lib/server/notifications/immediate-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_REQUEST_BYTES = 8 * 1024;

type ManagementBody = {
  token?: unknown;
  action?: unknown;
  startsAt?: unknown;
  reason?: unknown;
};

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

async function readBody(request: Request): Promise<ManagementBody | null> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return null;
  }

  const raw = await request.text();
  if (!raw || Buffer.byteLength(raw, "utf8") > MAX_REQUEST_BYTES) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as ManagementBody)
      : null;
  } catch {
    return null;
  }
}

function errorStatus(code: string) {
  if (code.includes("not_found")) return 404;
  if (code.startsWith("invalid_")) return 400;
  if (
    code.includes("not_allowed") ||
    code.includes("limit") ||
    code.includes("unavailable") ||
    code.includes("conflict")
  ) {
    return 409;
  }
  return 500;
}

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token")?.trim() || "";
    if (!isManagementToken(token)) {
      return NextResponse.json(
        { ok: false, error: "invalid_booking_management_token" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getPublicBookingAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "booking_management_gateway_unavailable" },
        { status: 503 },
      );
    }

    const allowed = await claimPublicBookingManagementRateLimit(
      supabaseAdmin,
      request,
      token,
      120,
      60 * 60,
    );
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "booking_management_rate_limited" },
        { status: 429 },
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "get_public_booking_management_context",
      { p_token: token },
    );

    if (error || !data) {
      const code = bookingManagementErrorCode(
        error?.message || "booking_management_link_not_found",
      );
      return NextResponse.json(
        { ok: false, error: code },
        { status: errorStatus(code) },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        context: data as PublicBookingManagementContext,
      },
      {
        headers: {
          "cache-control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Public booking management read failed", error);
    return NextResponse.json(
      { ok: false, error: "booking_management_gateway_unavailable" },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await readBody(request);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "invalid_booking_management_request" },
        { status: 400 },
      );
    }

    const token = text(body.token, 64);
    const action = text(body.action, 32);
    const startsAt = text(body.startsAt, 80);
    const reason = text(body.reason, 1000);

    if (
      !isManagementToken(token) ||
      !["reschedule", "cancel"].includes(action) ||
      (action === "reschedule" && Number.isNaN(Date.parse(startsAt)))
    ) {
      return NextResponse.json(
        { ok: false, error: "invalid_booking_management_request" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getPublicBookingAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "booking_management_gateway_unavailable" },
        { status: 503 },
      );
    }

    const allowed = await claimPublicBookingManagementRateLimit(
      supabaseAdmin,
      request,
      token,
      20,
      60 * 60,
    );
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "booking_management_rate_limited" },
        { status: 429 },
      );
    }

    const mutation =
      action === "reschedule"
        ? supabaseAdmin.rpc("reschedule_public_booking", {
            p_token: token,
            p_starts_at: startsAt,
          })
        : supabaseAdmin.rpc("cancel_public_booking", {
            p_token: token,
            p_reason: reason,
          });

    const { data, error } = await mutation;
    if (error || !data) {
      const code = bookingManagementErrorCode(
        error?.message || "booking_management_failed",
      );
      return NextResponse.json(
        { ok: false, error: code },
        { status: errorStatus(code) },
      );
    }

    const notificationDispatch = await dispatchQueuedNotificationsBestEffort(
      action === "reschedule"
        ? "public-booking-rescheduled"
        : "public-booking-cancelled",
    );

    return NextResponse.json(
      {
        ok: true,
        context: data as PublicBookingManagementContext,
        notification_dispatch: {
          attempted: true,
          ok: notificationDispatch.ok,
        },
      },
      {
        headers: {
          "cache-control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Public booking management mutation failed", error);
    return NextResponse.json(
      { ok: false, error: "booking_management_gateway_unavailable" },
      { status: 503 },
    );
  }
}
