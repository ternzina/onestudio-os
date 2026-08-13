import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { publicSiteButtonAppearanceStyle } from "../lib/public-site/button-style.ts";
import { resolvePremiumKidsContent } from "../lib/public-site/premium-kids-content.ts";
import { PREMIUM_KIDS_NATIVE_BUTTON_KEYS } from "../lib/public-site/premium-kids-buttons.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

test("native button appearance only overrides fields the client changed", () => {
  assert.deepEqual(publicSiteButtonAppearanceStyle({ backgroundColor: "#123456" }), { backgroundColor: "#123456" });
  assert.deepEqual(publicSiteButtonAppearanceStyle({ size: "small", textColor: "#abcdef" }), {
    minHeight: 40,
    paddingInline: 16,
    fontSize: 12,
    color: "#abcdef",
  });
});

test("BEMBI native button config survives template normalization", () => {
  const content = {
    template_content: {
      "premium-kids-center": {
        blocks: [{
          id: "bembi-hero",
          type: "hero",
          visible: true,
          props: {
            native_buttons: {
              primary_cta_label: {
                size: "small",
                backgroundColor: "#123456",
                textColor: "#abcdef",
                href: "#schedule",
              },
            },
          },
        }],
      },
    },
  } as unknown as PublicSiteContent;
  const resolved = resolvePremiumKidsContent(content);
  const hero = resolved.blocks.find(block => block.type === "hero");
  assert.deepEqual(hero?.props.native_buttons?.primary_cta_label, {
    size: "small",
    backgroundColor: "#123456",
    textColor: "#abcdef",
    href: "#schedule",
  });
});

test("native BEMBI actions use shared editor and public bridge", async () => {
  const [editor, home, motion, center] = await Promise.all([
    readFile(new URL("../components/admin/PremiumTemplateEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demos/premium-kids-center/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demos/premium-kids-center/PremiumMotion.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demos/premium-kids-center/CenterExperience.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(editor, /appearance:\s*\{/);
  assert.match(editor, /onHrefChange: next => updateNativeButton/);
  assert.match(home, /NativeButtonOverrides/);
  assert.match(home, /native_buttons\?\.primary_cta_label/);
  assert.match(motion, /primaryHref/);
  assert.match(center, /buttonHref/);
  assert.deepEqual(PREMIUM_KIDS_NATIVE_BUTTON_KEYS, [
    "primary_cta_label",
    "secondary_cta_label",
    "final_cta_label",
  ]);
  for (const key of PREMIUM_KIDS_NATIVE_BUTTON_KEYS) {
    assert.match(editor, new RegExp(key));
    assert.match(home, new RegExp(`native_buttons\\?\\.${key}`));
  }
});
