import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { currentGoogleCalendarAdmin } from "@/lib/server/integrations/google-calendar-auth";
import {
  getGoogleCalendarAdapterStatus,
  googleCalendarAuthorizationUrl,
} from "@/lib/server/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await currentGoogleCalendarAdmin();
  if (!access.ok) {
    return NextResponse.redirect(
      new URL(`/login?next=/admin/integrations/google-calendar`, request.url),
    );
  }
  const adapter = getGoogleCalendarAdapterStatus();
  if (!adapter.configured) {
    return NextResponse.redirect(
      new URL(
        `/admin/integrations/google-calendar?error=not_configured`,
        request.url,
      ),
    );
  }

  const state = randomBytes(24).toString("base64url");
  const response = NextResponse.redirect(googleCalendarAuthorizationUrl(state));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/api/admin/integrations/google-calendar",
    maxAge: 10 * 60,
  };
  response.cookies.set("onestudio_gcal_state", state, cookieOptions);
  response.cookies.set(
    "onestudio_gcal_business",
    access.businessId,
    cookieOptions,
  );
  return response;
}
