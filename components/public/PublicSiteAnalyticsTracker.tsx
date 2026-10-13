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

      if (businessSlug === "cashpath") {
        const action = target?.closest("a[href], button");
        const label = action?.textContent?.replace(/\s+/g, " ").trim().toLowerCase();
        if (label?.replace(/[→←➜➔]/g, "").trim() === "start your request") {
          trackPublicSiteEvent({
            businessSlug,
            eventName: "cta_click",
            path: window.location.pathname || "/",
          });
          return;
        }
      }

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

  useEffect(() => {
    if (businessSlug !== "cashpath") return;

    const formBlock = document.querySelector<HTMLElement>(
      '[data-public-custom-block-id="cashpath-request"]',
    );
    if (!formBlock) return;

    let recorded = false;
    const recordProviderReady = () => {
      const target = formBlock.querySelector<HTMLElement>("#_lg_form_");
      if (!target || target.childElementCount === 0 || recorded) return;
      recorded = true;
      trackPublicSiteEvent({
        businessSlug,
        eventName: "leadsgate_form_ready",
        path: window.location.pathname || "/",
      });
      observer.disconnect();
    };

    const observer = new MutationObserver(() => {
      recordProviderReady();
    });
    observer.observe(formBlock, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id"],
    });
    recordProviderReady();

    return () => observer.disconnect();
  }, [businessSlug]);

  return null;
}
