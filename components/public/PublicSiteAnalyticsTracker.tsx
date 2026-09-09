"use client";

import {
  useEffect,
} from "react";
import { usePathname } from "next/navigation";

const PAGE_DEDUPE_MS = 1500;

type Attribution = {
  referrerHost: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

type RuntimeSession = {
  id: string;
  attribution: Attribution;
};

const runtimeSessions =
  new Map<string, RuntimeSession>();

const recentPages =
  new Map<string, {
    path: string;
    at: number;
  }>();

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

function sessionForBusiness(
  businessSlug: string,
) {
  const existing =
    runtimeSessions.get(
      businessSlug,
    );

  if (existing) {
    return existing;
  }

  const created: RuntimeSession = {
    id: createSessionId(),
    attribution:
      currentAttribution(),
  };

  runtimeSessions.set(
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

function recentlyTracked(
  businessSlug: string,
  path: string,
) {
  const now = Date.now();

  const previous =
    recentPages.get(
      businessSlug,
    );

  if (
    previous?.path === path &&
    now - previous.at <
      PAGE_DEDUPE_MS
  ) {
    return true;
  }

  recentPages.set(
    businessSlug,
    {
      path,
      at: now,
    },
  );

  return false;
}

export default function PublicSiteAnalyticsTracker({
  businessSlug,
}: {
  businessSlug: string;
}) {
  const pathname =
    usePathname();

  useEffect(() => {
    const visiblePath =
      window.location.pathname ||
      pathname ||
      "/";

    if (
      recentlyTracked(
        businessSlug,
        visiblePath,
      )
    ) {
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
        body: JSON.stringify({
          businessSlug,
          eventName:
            "page_view",
          sessionId:
            session.id,
          path: visiblePath,
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
        }),
      },
    ).catch(() => {
      // Analytics must never affect the public site.
    });
  }, [
    businessSlug,
    pathname,
  ]);

  return null;
}
