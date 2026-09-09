import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  hostnameWithoutPort,
  isTechnicalPlatformHostname,
} from "@/lib/domains/normalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 8 * 1024;

const IP_LIMIT = 120;
const IP_WINDOW_SECONDS = 10 * 60;

const BUSINESS_LIMIT = 3000;
const BUSINESS_WINDOW_SECONDS = 10 * 60;

const EVENT_NAMES = new Set([
  "page_view",
  "cta_click",
  "form_submit",
  "booking_started",
  "booking_completed",
  "booking_cancelled",
  "payment_started",
  "payment_succeeded",
]);

type AnalyticsBody = {
  businessSlug?: unknown;
  eventName?: unknown;
  sessionId?: unknown;
  path?: unknown;
  referrerHost?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  deviceClass?: unknown;
  locale?: unknown;
};

function text(value: unknown, maximum: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maximum)
    : "";
}

async function readBody(
  request: Request,
): Promise<AnalyticsBody | null> {
  const contentLength = Number(
    request.headers.get("content-length") || "0",
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BYTES
  ) {
    return null;
  }

  const raw = await request.text();

  if (
    !raw ||
    Buffer.byteLength(raw, "utf8") >
      MAX_REQUEST_BYTES
  ) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as AnalyticsBody)
      : null;
  } catch {
    return null;
  }
}

function headerText(
  request: Request,
  name: string,
  maximum: number,
) {
  const raw = request.headers.get(name) || "";

  try {
    return text(
      decodeURIComponent(raw),
      maximum,
    );
  } catch {
    return text(raw, maximum);
  }
}

function getClientIp(request: Request) {
  const forwarded =
    request.headers.get("x-forwarded-for");

  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  ).slice(0, 100);
}

function hashRateLimitValue(
  secret: string,
  kind: string,
  value: string,
) {
  return createHash("sha256")
    .update(`${secret}:${kind}:${value}`)
    .digest("hex");
}

async function claimRateLimit(
  supabaseAdmin: SupabaseClient,
  keyHash: string,
  limit: number,
  windowSeconds: number,
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "claim_booking_email_rate_limit",
      {
        p_ip_hash: keyHash,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      },
    );

  if (error) throw error;

  return data === true;
}

function isLikelyBot(request: Request) {
  const userAgent =
    request.headers.get("user-agent") || "";

  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|meta-externalagent|twitterbot|linkedinbot|pinterestbot|googleother|headlesschrome|lighthouse/i.test(
    userAgent,
  );
}

export async function POST(request: Request) {
  try {
    if (isLikelyBot(request)) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const body = await readBody(request);

    if (!body) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_analytics_event",
        },
        { status: 400 },
      );
    }

    const businessSlug = text(
      body.businessSlug,
      120,
    ).toLowerCase();

    const eventName =
      text(body.eventName, 40);

    const sessionId =
      text(body.sessionId, 96);

    const path =
      text(body.path, 512);

    const referrerHost =
      text(
        body.referrerHost,
        253,
      ).toLowerCase() || null;

    const utmSource =
      text(body.utmSource, 160) || null;

    const utmMedium =
      text(body.utmMedium, 160) || null;

    const utmCampaign =
      text(body.utmCampaign, 240) || null;

    const deviceClass =
      text(body.deviceClass, 16) ||
      "unknown";

    const locale =
      text(
        body.locale,
        16,
      ).toLowerCase() || null;

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        businessSlug,
      ) ||
      !EVENT_NAMES.has(eventName) ||
      !/^[A-Za-z0-9_-]{8,96}$/.test(
        sessionId,
      ) ||
      !path.startsWith("/") ||
      ![
        "desktop",
        "tablet",
        "mobile",
        "unknown",
      ].includes(deviceClass)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_analytics_event",
        },
        { status: 400 },
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;

    if (
      !supabaseUrl ||
      !supabaseSecretKey
    ) {
      console.error(
        "Site analytics gateway is not configured",
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "analytics_gateway_unavailable",
        },
        { status: 503 },
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    const rateLimitSecret =
      process.env
        .ANALYTICS_RATE_LIMIT_SECRET ||
      process.env
        .BOOKING_EMAIL_RATE_LIMIT_SECRET ||
      supabaseSecretKey;

    const ip = getClientIp(request);

    const [
      ipAllowed,
      businessAllowed,
    ] = await Promise.all([
      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(
          rateLimitSecret,
          "site-analytics-ip",
          ip,
        ),
        IP_LIMIT,
        IP_WINDOW_SECONDS,
      ),

      claimRateLimit(
        supabaseAdmin,
        hashRateLimitValue(
          rateLimitSecret,
          "site-analytics-business",
          businessSlug,
        ),
        BUSINESS_LIMIT,
        BUSINESS_WINDOW_SECONDS,
      ),
    ]);

    if (
      !ipAllowed ||
      !businessAllowed
    ) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const {
      data: business,
      error: businessError,
    } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("slug", businessSlug)
      .neq("status", "archived")
      .maybeSingle();

    if (businessError) {
      throw businessError;
    }

    if (!business?.id) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const {
      data: analyticsModule,
      error: moduleError,
    } = await supabaseAdmin
      .from("business_modules")
      .select("enabled")
      .eq(
        "business_id",
        business.id,
      )
      .eq(
        "module_key",
        "analytics",
      )
      .maybeSingle();

    if (moduleError) {
      throw moduleError;
    }

    if (
      analyticsModule?.enabled !== true
    ) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const host =
      hostnameWithoutPort(
        request.headers.get(
          "x-forwarded-host",
        ) ||
          request.headers.get("host") ||
          "",
      );

    const isTechnicalHost =
      isTechnicalPlatformHostname(host) ||
      host === "localhost" ||
      host === "127.0.0.1";

    const countryCode =
      headerText(
        request,
        "x-vercel-ip-country",
        8,
      ).toUpperCase() || null;

    const region =
      headerText(
        request,
        "x-vercel-ip-country-region",
        120,
      ) || null;

    const city =
      headerText(
        request,
        "x-vercel-ip-city",
        160,
      ) || null;

    const { error: insertError } =
      await supabaseAdmin
        .from(
          "site_analytics_events",
        )
        .insert({
          business_id: business.id,
          event_name: eventName,
          session_id: sessionId,
          path,
          host: host || null,
          referrer_host:
            referrerHost,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign:
            utmCampaign,
          device_class:
            deviceClass,
          locale,
          country_code:
            countryCode,
          region,
          city,
          is_technical_host:
            isTechnicalHost,
          metadata: {},
        });

    if (insertError) {
      throw insertError;
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control":
          "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Site analytics collection failed",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "analytics_gateway_unavailable",
      },
      { status: 503 },
    );
  }
}
