import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  getPremiumKidsNativeMediaSlots,
  normalizePremiumKidsNativeMedia,
  premiumKidsNativeMediaUrl,
} from "../lib/public-site/premium-kids-native-media.ts";
import {
  replacePremiumKidsBlocks,
  resetPremiumKidsBlock,
  resolvePremiumKidsContent,
  withPremiumKidsContent,
} from "../lib/public-site/premium-kids-content.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const draft = (): PublicSiteContent => ({
  brand_name: "BEMBI",
  template_id: "premium-kids-center",
  template_content: { "premium-kids-center": { brand_name: "BEMBI" } },
} as unknown as PublicSiteContent);

test("BEMBI native media registry covers every image-bearing home block", () => {
  assert.equal(getPremiumKidsNativeMediaSlots("hero").length, 1);
  assert.equal(getPremiumKidsNativeMediaSlots("intro").length, 23);
  assert.equal(getPremiumKidsNativeMediaSlots("approach").length, 1);
  assert.equal(getPremiumKidsNativeMediaSlots("teachers").length, 5);
  assert.equal(getPremiumKidsNativeMediaSlots("gallery").length, 5);
  assert.equal(getPremiumKidsNativeMediaSlots("programs").length, 1);
  assert.equal(getPremiumKidsNativeMediaSlots("faq").length, 0);
});

test("native image replacement and layout settings survive the template-content round trip", () => {
  const original = resolvePremiumKidsContent(draft());
  const blocks = original.blocks.map((block) => block.type === "hero" ? {
    ...block,
    props: {
      ...block.props,
      native_media: {
        urls: { hero: "https://cdn.example.test/new-hero.webp", unknown: "https://example.test/nope.webp" },
        media_size: "compact" as const,
        media_fit: "contain" as const,
        media_focal_x: 140,
        media_opacity: 72,
      },
    },
  } : block);
  const saved = withPremiumKidsContent(draft(), replacePremiumKidsBlocks(original, blocks));
  const reloaded = resolvePremiumKidsContent(JSON.parse(JSON.stringify(saved)) as PublicSiteContent);
  const media = reloaded.blocks.find((block) => block.type === "hero")?.props.native_media;

  assert.equal(media?.urls?.hero, "https://cdn.example.test/new-hero.webp");
  assert.equal(media?.urls?.unknown, undefined);
  assert.equal(media?.media_size, "compact");
  assert.equal(media?.media_fit, "contain");
  assert.equal(media?.media_focal_x, 100);
  assert.equal(media?.media_opacity, 72);
  assert.equal(premiumKidsNativeMediaUrl(media, "hero", "/demo.webp"), "https://cdn.example.test/new-hero.webp");
});

test("normalization is bounded and resetting a native block restores demo media", () => {
  assert.equal(normalizePremiumKidsNativeMedia({ urls: { hero: "javascript:bad" } }, "faq"), undefined);
  const original = resolvePremiumKidsContent(draft());
  const edited = replacePremiumKidsBlocks(original, original.blocks.map((block) => block.type === "gallery" ? {
    ...block,
    props: { ...block.props, native_media: { urls: { "gallery-0": "https://cdn.example.test/gallery.webp" }, media_fit: "contain" } },
  } : block));
  const reset = resetPremiumKidsBlock(edited, "bembi-gallery");
  assert.equal(reset.blocks.find((block) => block.id === "bembi-gallery")?.props.native_media, undefined);
});

test("BEMBI inspector and preview/public runtime share native media controls", async () => {
  const [editor, home, center, motion, interactions, image, css, persistence] = await Promise.all([
    read("../components/admin/PremiumTemplateEditor.tsx"),
    read("../app/demos/premium-kids-center/HomeExperience.tsx"),
    read("../app/demos/premium-kids-center/CenterExperience.tsx"),
    read("../app/demos/premium-kids-center/PremiumMotion.tsx"),
    read("../app/demos/premium-kids-center/InteractiveBlocks.tsx"),
    read("../app/demos/premium-kids-center/BembiTemplateImage.tsx"),
    read("../app/demos/premium-kids-center/Platform.module.css"),
    read("../supabase/migrations/20260808143000_premium_template_editor_runtime_1_0.sql"),
  ]);

  assert.match(editor, /type: "media"/);
  assert.doesNotMatch(editor, /PremiumKidsNativeMediaEditor/);
  assert.match(editor, /buildMediaLayoutInspectorFields/);
  for (const source of [home, center, motion, interactions]) assert.match(source, /BembiTemplateImage/);
  assert.match(image, /media_mobile_fit/);
  assert.match(css, /templateImageManaged/);
  assert.match(persistence, /normalize_public_site_template_content/);
});
