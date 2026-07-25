import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getResendAdapterStatus,
  isResendConfigurationError,
  processResendQueue,
} from "@/lib/server/notifications/resend-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function authorized(request: Request) {
  const secret = (process.env.CRON_SECRET || "").trim();
  if (secret.length < 16) return { ok: false, status: 503, reason: "cron_secret_not_configured" };

  const authorization = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  return safeEqual(authorization, expected)
    ? { ok: true, status: 200, reason: "" }
    : { ok: false, status: 401, reason: "cron_unauthorized" };
}

async function handle(request: Request) {
  const auth = authorized(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.reason }, { status: auth.status });
  }

  try {
    const result = await processResendQueue("cron");
    return NextResponse.json({ ok: true, adapter: getResendAdapterStatus(), result });
  } catch (error) {
    console.error("Notification cron failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: isResendConfigurationError(error) ? 503 : 500 },
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
