"use client";

import {
  useEffect,
} from "react";
import {
  usePathname,
} from "next/navigation";

import {
  isBookingDestination,
  trackPublicPageView,
  trackPublicSiteEvent,
} from "@/lib/public-site/analytics-client";

export default function PublicSiteAnalyticsTracker({
  businessSlug,
}: {
  businessSlug: string;
}) {
  const pathname =
    usePathname();

  useEffect(() => {
    trackPublicPageView(
      businessSlug,
      window.location.pathname ||
        pathname ||
        "/",
    );
  }, [
    businessSlug,
    pathname,
  ]);

  useEffect(() => {
    const handleClick = (
      event: MouseEvent,
    ) => {
      const target =
        event.target instanceof Element
          ? event.target
          : null;

      const anchor =
        target?.closest(
          "a[href]",
        );

      if (!anchor) {
        return;
      }

      const href =
        anchor.getAttribute("href") ||
        "";

      if (
        !isBookingDestination(
          href,
        )
      ) {
        return;
      }

      trackPublicSiteEvent({
        businessSlug,
        eventName:
          "cta_click",
        path:
          window.location.pathname ||
          "/",
      });
    };

    document.addEventListener(
      "click",
      handleClick,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true,
      );
    };
  }, [businessSlug]);

  return null;
}
