import assert from "node:assert/strict";
import test from "node:test";
import { premiumNativeActionStyleSheet } from "../lib/public-site/premium-action-style.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

test("explicit premium native button overrides outrank template CTA selectors", () => {
  const content = {
    native_action_styles: {
      "velora-event-venue:hero:velora-hero-primary-action": {
        size: "large",
        background_color: "#123456",
        text_color: "#abcdef",
      },
    },
  } as unknown as PublicSiteContent;

  const css = premiumNativeActionStyleSheet(content, "velora-event-venue");

  assert.match(css, /min-height:56px!important/);
  assert.match(css, /padding-inline:30px!important/);
  assert.match(css, /font-size:16px!important/);
  assert.match(css, /background-color:#123456!important/);
  assert.match(css, /color:#abcdef!important/);
});
