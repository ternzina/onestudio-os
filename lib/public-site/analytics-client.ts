"use client";

export type PublicSiteAnalyticsEventName =
  | "page_view"
  | "cta_click"
  | "form_submit"
  | "booking_started"
  | "booking_completed"
  | "booking_cancelled"
  | "payment_started"
  | "payment_succeeded";

type Attribution = {
  referrerHost: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

type AnalyticsSession = {
  id: string;
  attribution: Attribution;
  lastSeenAt: number;
};

type TrackEventInput = {
  businessSlug: string;
  eventName: PublicSiteAnalyticsEventName;
  path?: string;
  bookingId?: string;
};

const SESSION_IDLE_MS =
  30 * 60 * 1000;

const PAGE_DEDUPE_MS =
  1500;

const STORAGE_PREFIX =
  "onestudio_analytics_session_v1:";

const runtimeSessions =
  new Map<string, AnalyticsSession>();

const recentPages =
  new Map<string, {
    path: string;
    at: number;
  }>();

function storageKey(
  businessSlug: string,
) {
  return `${STORAGE_PREFIX}${businessSlug}`;
}

function createSessionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto
      .randomUUID()
      .replaceAll("-", "_");
  }

  return `s_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

function currentAttribution(): Attribution {
  const params =
    new URLSearchParams(
      window.location.search,
    );

  let referrerHost = "";

  try {
    if (document.referrer) {
      const candidate =
        new URL(
          document.referrer,
        ).hostname.toLowerCase();

      if (
        candidate &&
        candidate !==
          window.location.hostname.toLowerCase()
      ) {
        referrerHost =
          candidate;
      }
    }
  } catch {
    referrerHost = "";
  }

  return {
    referrerHost,
    utmSource:
      params.get("utm_source") || "",
    utmMedium:
      params.get("utm_medium") || "",
    utmCampaign:
      params.get("utm_campaign") || "",
  };
}

function validSession(
  value: unknown,
): value is AnalyticsSession {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<AnalyticsSession>;

  return (
    typeof candidate.id === "string" &&
    /^[A-Za-z0-9_-]{8,96}$/.test(
      candidate.id,
    ) &&
    typeof candidate.lastSeenAt ===
      "number" &&
    Number.isFinite(
      candidate.lastSeenAt,
    ) &&
    Boolean(
      candidate.attribution &&
      typeof candidate.attribution ===
        "object",
    )
  );
}

function readStoredSession(
  businessSlug: string,
) {
  try {
    const raw =
      window.sessionStorage.getItem(
        storageKey(businessSlug),
      );

    if (!raw) return null;

    const parsed: unknown =
      JSON.parse(raw);

    return validSession(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function writeStoredSession(
  businessSlug: string,
  session: AnalyticsSession,
) {
  try {
    window.sessionStorage.setItem(
      storageKey(businessSlug),
      JSON.stringify(session),
    );
  } catch {
    // Analytics still works in memory when
    // sessionStorage is unavailable.
  }
}

function sessionForBusiness(
  businessSlug: string,
) {
  const now =
    Date.now();

  const runtime =
    runtimeSessions.get(
      businessSlug,
    );

  if (
    runtime &&
    now - runtime.lastSeenAt <
      SESSION_IDLE_MS
  ) {
    runtime.lastSeenAt = now;

    writeStoredSession(
      businessSlug,
      runtime,
    );

    return runtime;
  }

  const stored =
    readStoredSession(
      businessSlug,
    );

  if (
    stored &&
    now - stored.lastSeenAt <
      SESSION_IDLE_MS
  ) {
    stored.lastSeenAt = now;

    runtimeSessions.set(
      businessSlug,
      stored,
    );

    writeStoredSession(
      businessSlug,
      stored,
    );

    return stored;
  }

  const created: AnalyticsSession = {
    id: createSessionId(),
    attribution:
      currentAttribution(),
    lastSeenAt: now,
  };

  runtimeSessions.set(
    businessSlug,
    created,
  );

  writeStoredSession(
    businessSlug,
    created,
  );

  return created;
}

function deviceClass() {
  const width =
    window.innerWidth;

  if (width <= 767) {
    return "mobile";
  }

  if (width <= 1100) {
    return "tablet";
  }

  return "desktop";
}

function currentPath() {
  return (
    window.location.pathname ||
    "/"
  );
}

export function trackPublicSiteEvent(
  input: TrackEventInput,
) {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  const businessSlug =
    input.businessSlug
      .trim()
      .toLowerCase();

  if (!businessSlug) {
    return;
  }

  const session =
    sessionForBusiness(
      businessSlug,
    );

  const locale =
    document.documentElement.lang ||
    navigator.language ||
    "";

  const payload = {
    businessSlug,
    eventName:
      input.eventName,
    sessionId:
      session.id,
    path:
      input.path ||
      currentPath(),
    referrerHost:
      session.attribution
        .referrerHost,
    utmSource:
      session.attribution
        .utmSource,
    utmMedium:
      session.attribution
        .utmMedium,
    utmCampaign:
      session.attribution
        .utmCampaign,
    deviceClass:
      deviceClass(),
    locale,
    ...(input.bookingId
      ? {
          bookingId:
            input.bookingId,
        }
      : {}),
  };

  void fetch(
    "/api/public/site-event",
    {
      method: "POST",
      cache: "no-store",
      keepalive: true,
      credentials: "omit",
      headers: {
        "Content-Type":
          "application/json",
      },
      body:
        JSON.stringify(payload),
    },
  ).catch(() => {
    // Analytics must never affect
    // the public site or booking flow.
  });
}

export function trackPublicPageView(
  businessSlug: string,
  path?: string,
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const visiblePath =
    path ||
    currentPath();

  const now =
    Date.now();

  const previous =
    recentPages.get(
      businessSlug,
    );

  if (
    previous?.path ===
      visiblePath &&
    now - previous.at <
      PAGE_DEDUPE_MS
  ) {
    return;
  }

  recentPages.set(
    businessSlug,
    {
      path: visiblePath,
      at: now,
    },
  );

  trackPublicSiteEvent({
    businessSlug,
    eventName: "page_view",
    path: visiblePath,
  });
}

export function isBookingDestination(
  href: string,
) {
  if (
    typeof window === "undefined" ||
    !href
  ) {
    return false;
  }

  try {
    const url =
      new URL(
        href,
        window.location.href,
      );

    return (
      url.origin ===
        window.location.origin &&
      /^\/book\/[^/]+/.test(
        url.pathname,
      )
    );
  } catch {
    return false;
  }
}
