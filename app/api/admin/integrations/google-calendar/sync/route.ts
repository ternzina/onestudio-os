import { NextResponse } from "next/server";
import { currentGoogleCalendarAdmin } from "@/lib/server/integrations/google-calendar-auth";
import { syncGoogleCalendarForBusiness } from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const access = await currentGoogleCalendarAdmin();
  if (!access.ok) {
    return NextResponse.json(
      { ok: false, error: access.error },
      { status: access.status },
    );
  }
  try {
    const result = await syncGoogleCalendarForBusiness(access.businessId, {
      force: true,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
