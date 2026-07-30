import { NextResponse } from "next/server";
import { currentGoogleCalendarAdmin } from "@/lib/server/integrations/google-calendar-auth";
import { disconnectGoogleCalendar } from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const access = await currentGoogleCalendarAdmin();
  if (!access.ok) {
    return NextResponse.json(
      { ok: false, error: access.error },
      { status: access.status },
    );
  }
  try {
    await disconnectGoogleCalendar(access.businessId);
    return NextResponse.json({ ok: true });
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
