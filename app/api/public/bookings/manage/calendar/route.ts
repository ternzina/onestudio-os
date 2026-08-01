import { NextResponse } from "next/server";
import {
  claimPublicBookingManagementRateLimit,
  getPublicBookingAdminClient,
  isManagementToken,
  type PublicBookingManagementContext,
} from "@/lib/booking/public-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function icsUtc(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "booking";
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
      60,
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
      return NextResponse.json(
        { ok: false, error: "booking_management_link_not_found" },
        { status: 404 },
      );
    }

    const context = data as PublicBookingManagementContext;
    const statusText =
      context.booking.status === "cancelled"
        ? "Cancelled"
        : context.booking.status === "pending"
          ? "Awaiting confirmation"
          : "Confirmed";
    const description = [
      `Booking: ${context.booking.reference}`,
      `Status: ${statusText}`,
      `Business: ${context.business.name}`,
    ].join("\n");
    const host = new URL(request.url).hostname || "onestudioos.com";

    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//OneStudio OS//Public Booking//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:booking-${context.booking.id}@${host}`,
      `DTSTAMP:${icsUtc(new Date())}`,
      `DTSTART:${icsUtc(context.booking.starts_at)}`,
      `DTEND:${icsUtc(context.booking.ends_at)}`,
      `SUMMARY:${icsEscape(`${context.service.title} · ${context.business.name}`)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      `STATUS:${context.booking.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": "text/calendar; charset=utf-8",
        "content-disposition": `attachment; filename="${safeFilePart(
          context.booking.reference,
        )}.ics"`,
        "cache-control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Public booking calendar export failed", error);
    return NextResponse.json(
      { ok: false, error: "booking_management_gateway_unavailable" },
      { status: 503 },
    );
  }
}
