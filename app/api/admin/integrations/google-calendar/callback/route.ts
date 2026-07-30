import { NextRequest, NextResponse } from "next/server";
import { currentGoogleCalendarAdmin } from "@/lib/server/integrations/google-calendar-auth";
import {
  connectGoogleCalendar,
  exchangeGoogleCalendarCode,
  syncGoogleCalendarForBusiness,
} from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirect(request: NextRequest, result: string) {
  const response = NextResponse.redirect(
    new URL(`/admin/integrations/google-calendar?${result}`, request.url),
  );
  response.cookies.delete("onestudio_gcal_state");
  response.cookies.delete("onestudio_gcal_business");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") || "";
  const state = request.nextUrl.searchParams.get("state") || "";
  const expectedState = request.cookies.get("onestudio_gcal_state")?.value || "";
  const businessId =
    request.cookies.get("onestudio_gcal_business")?.value || "";
  if (!code || !state || !expectedState || state !== expectedState || !businessId) {
    return redirect(request, "error=invalid_callback");
  }

  const access = await currentGoogleCalendarAdmin(businessId);
  if (!access.ok) return redirect(request, "error=access_denied");

  try {
    const token = await exchangeGoogleCalendarCode(code);
    await connectGoogleCalendar(businessId, access.userId, token);
    await syncGoogleCalendarForBusiness(businessId, { force: true });
    return redirect(request, "connected=1");
  } catch (error) {
    console.error("Google Calendar callback failed", error);
    return redirect(request, "error=connection_failed");
  }
}
