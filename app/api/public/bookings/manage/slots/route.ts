import { NextResponse } from "next/server";
import {
  bookingManagementErrorCode,
  claimPublicBookingManagementRateLimit,
  getPublicBookingAdminClient,
  isManagementToken,
  type PublicBookingManagementSlot,
} from "@/lib/booking/public-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token")?.trim() || "";
    const date = url.searchParams.get("date")?.trim() || "";

    if (!isManagementToken(token) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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
      80,
      60 * 60,
    );
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "booking_management_rate_limited" },
        { status: 429 },
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "get_public_booking_management_slots",
      {
        p_token: token,
        p_date: date,
      },
    );

    if (error) {
      const code = bookingManagementErrorCode(error.message);
      return NextResponse.json(
        { ok: false, error: code },
        { status: code.includes("not_found") ? 404 : 409 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        slots: (data ?? []) as PublicBookingManagementSlot[],
      },
      {
        headers: {
          "cache-control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Public booking management slots failed", error);
    return NextResponse.json(
      { ok: false, error: "booking_management_gateway_unavailable" },
      { status: 503 },
    );
  }
}
