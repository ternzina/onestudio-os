import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getResendAdapterStatus,
  isResendConfigurationError,
  processResendQueue,
} from "@/lib/server/notifications/resend-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type AccessRow = {
  access_state?: string;
  business_role?: string | null;
};

function readableError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const value = error as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
    };

    const parts = [
      typeof value.message === "string" ? value.message : "",
      typeof value.code === "string" ? `code: ${value.code}` : "",
      typeof value.details === "string" && value.details
        ? `details: ${value.details}`
        : "",
      typeof value.hint === "string" && value.hint
        ? `hint: ${value.hint}`
        : "",
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown notification adapter error";
    }
  }

  return String(error);
}

async function adminAccess() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, status: 401, role: null };

  const { data, error } = await supabase.rpc("get_admin_access_state");
  const access = !error && Array.isArray(data)
    ? (data[0] as AccessRow | undefined)
    : undefined;

  if (access?.access_state !== "ready") {
    return { ok: false, status: 403, role: access?.business_role ?? null };
  }

  return { ok: true, status: 200, role: access.business_role ?? null };
}

export async function GET() {
  const access = await adminAccess();
  if (!access.ok) {
    return NextResponse.json({ ok: false, error: "notification_adapter_forbidden" }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    canProcess: ["owner", "admin", "manager"].includes(access.role || ""),
    adapter: getResendAdapterStatus(),
  });
}

export async function POST() {
  const access = await adminAccess();
  if (!access.ok || !["owner", "admin", "manager"].includes(access.role || "")) {
    return NextResponse.json({ ok: false, error: "notification_adapter_forbidden" }, { status: access.ok ? 403 : access.status });
  }

  try {
    const result = await processResendQueue("admin");
    return NextResponse.json({
      ok: true,
      adapter: getResendAdapterStatus(),
      result,
    });
  } catch (error) {
    console.error("Manual notification delivery failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: readableError(error),
        adapter: getResendAdapterStatus(),
      },
      { status: isResendConfigurationError(error) ? 503 : 500 },
    );
  }
}
