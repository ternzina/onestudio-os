import { NextResponse } from "next/server";
import { currentGoogleCalendarAdmin } from "@/lib/server/integrations/google-calendar-auth";
import { googleCalendarConnectionStatus } from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const access = await currentGoogleCalendarAdmin();
  if (!access.ok) {
    return NextResponse.json(
      { ok: false, error: access.error },
      { status: access.status },
    );
  }
  try {
    const connection = await googleCalendarConnectionStatus(access.businessId);
    return NextResponse.json({ ok: true, connection });
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
