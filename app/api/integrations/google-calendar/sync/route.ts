import { NextResponse } from "next/server";
import {
  businessIdForPublicSlug,
  syncGoogleCalendarForBusiness,
} from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  try {
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
