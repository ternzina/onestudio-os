import { createHash } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PublicBookingManagementContext = {
  business: {
    id: string;
    slug: string;
    name: string;
    timezone: string;
    default_locale: string;
  };
  service: {
    id: string;
    slug: string;
    title: string;
  };
  client: {
    name: string;
    email: string;
  };
  booking: {
    id: string;
    reference: string;
    status: string;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
    party_size: number;
    total_minor: number;
    currency: string;
    locale: string;
    cancellation_reason: string;
  };
  date_bounds: {
    minimum_date: string;
    maximum_date: string;
  };
  actions: {
    can_reschedule: boolean;
    can_cancel: boolean;
    reschedules_remaining: number;
  };
  manage_url: string;
  expires_at: string;
};

export type PublicBookingManagementSlot = {
  starts_at: string;
  ends_at: string;
  local_start_time: string;
  local_end_time: string;
  timezone: string;
};

export function isManagementToken(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  ).slice(0, 100);
}

export function getPublicBookingAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) return null;

  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function rateLimitHash(secret: string, kind: string, value: string) {
  return createHash("sha256")
    .update(`${secret}:${kind}:${value}`)
    .digest("hex");
}

export async function claimPublicBookingManagementRateLimit(
  supabaseAdmin: SupabaseClient,
  request: Request,
  token: string,
  limit: number,
  windowSeconds: number,
) {
  const secret =
    process.env.BOOKING_EMAIL_RATE_LIMIT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!secret) return false;

  const ip = getClientIp(request);
  const key = rateLimitHash(
    secret,
    "public-booking-management",
    `${ip}:${token}`,
  );
  const { data, error } = await supabaseAdmin.rpc(
    "claim_booking_email_rate_limit",
    {
      p_ip_hash: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    },
  );

  if (error) throw error;
  return data === true;
}

export function bookingManagementErrorCode(message: string) {
  const known = [
    "booking_management_link_not_found",
    "booking_management_reschedule_not_allowed",
    "booking_management_reschedule_limit",
    "booking_management_cancel_not_allowed",
    "booking_slot_unavailable",
    "booking_slot_conflict",
    "invalid_booking_management_request",
    "invalid_booking_management_token",
  ];

  return (
    known.find((value) => message.includes(value)) ||
    "booking_management_failed"
  );
}
