import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import test from "node:test";

const client =
  readFileSync(
    "lib/public-site/analytics-client.ts",
    "utf8",
  );

const tracker =
  readFileSync(
    "components/public/PublicSiteAnalyticsTracker.tsx",
    "utf8",
  );

const glossBooking =
  readFileSync(
    "components/public/GlossBookingPanel.tsx",
    "utf8",
  );

const booking =
  readFileSync(
    "app/book/[businessSlug]/PublicBookingClient.tsx",
    "utf8",
  );

const route =
  readFileSync(
    "app/api/public/analytics/route.ts",
    "utf8",
  );

test(
  "analytics session survives full page navigation inside one tab",
  () => {
    assert.match(
      client,
      /sessionStorage/,
    );

    assert.match(
      client,
      /30 \* 60 \* 1000/,
    );

    assert.doesNotMatch(
      client,
      /localStorage|document\.cookie/,
    );
  },
);

test(
  "booking CTA is tracked across shared public runtimes",
  () => {
    assert.match(
      tracker,
      /cta_click/,
    );

    assert.match(
      tracker,
      /isBookingDestination/,
    );

    assert.match(
      glossBooking,
      /cta_click/,
    );
  },
);

test(
  "public booking emits the canonical funnel events",
  () => {
    assert.match(
      booking,
      /trackPublicPageView/,
    );

    assert.match(
      booking,
      /booking_started/,
    );

    assert.match(
      booking,
      /form_submit/,
    );

    assert.match(
      booking,
      /booking_completed/,
    );

    assert.match(
      booking,
      /bookingId:\s*confirmationResult\.booking_id/,
    );
  },
);

test(
  "booking id is validated and tenant-bound at the analytics gateway",
  () => {
    assert.match(
      route,
      /bookingId/,
    );

    assert.match(
      route,
      /\.from\("bookings"\)/,
    );

    assert.match(
      route,
      /\.eq\(\s*"business_id",\s*business\.id/,
    );

    assert.match(
      route,
      /booking_id:\s*canonicalBookingId/,
    );
  },
);

test(
  "browser does not invent successful payment events",
  () => {
    assert.doesNotMatch(
      booking,
      /eventName:\s*"payment_succeeded"/,
    );
  },
);
