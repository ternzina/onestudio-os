import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { translateAdmin } from "../lib/i18n/admin.ts";
import {
  createPublicSiteCustomBlock,
  publicSiteCustomBlockVisualCapabilities,
} from "../lib/public-site/custom-block-registry.ts";
import { buildMediaLayoutInspectorFields } from "../lib/public-site/media-layout-inspector.ts";
import { publicSiteMediaVariables } from "../lib/public-site/visual-tokens.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical media variables expose bounded desktop and mobile values", () => {
  const style = publicSiteMediaVariables({
    media_aspect: "classic",
    media_height: "medium",
    media_fit: "contain",
    media_focal_x: 120,
    media_focal_y: -10,
    media_opacity: 72,
    media_overlay: 35,
    media_radius: "rounded",
    media_gap: "airy",
    media_columns: 3,
    media_mobile_aspect: "square",
    media_mobile_height: "auto",
    media_mobile_fit: "cover",
    media_mobile_focal_x: 25,
    media_mobile_focal_y: 75,
    media_mobile_columns: 1,
  });

  assert.equal(style["--os-media-fit"], "contain");
  assert.equal(style["--os-media-position"], "100% 0%");
  assert.equal(style["--os-media-opacity"], "0.72");
  assert.equal(style["--os-media-overlay-opacity"], "0.35");
  assert.equal(style["--os-media-radius"], "28px");
  assert.equal(style["--os-media-gap"], "32px");
  assert.equal(style["--os-media-columns"], "3");
  assert.equal(style["--os-media-mobile-fit"], "cover");
  assert.equal(style["--os-media-mobile-position"], "25% 75%");
  assert.equal(style["--os-media-mobile-aspect"], "1 / 1");
  assert.equal(style["--os-media-mobile-columns"], "1");
});

test("new media blocks receive coherent defaults and explicit capabilities", () => {
  const collage = createPublicSiteCustomBlock("collage", "gallery-grid");
  const mediaText = createPublicSiteCustomBlock("media_text", "story-media");
  const capabilities = publicSiteCustomBlockVisualCapabilities("collage", "premium");

  assert.equal(collage.media_radius, "soft");
  assert.equal(collage.media_columns, 4);
  assert.equal(collage.media_mobile_columns, 2);
  assert.equal(mediaText.media_mobile_position, "after");
  assert.equal(capabilities.mediaFocalPoint, true);
  assert.equal(capabilities.mediaSurface, true);
  assert.equal(capabilities.responsiveMedia, true);
  assert.equal(capabilities.multiMediaLayout, true);
});

test("shared inspector emits responsive surface and multi-image controls", () => {
  const changes: Array<[string, unknown]> = [];
  const fields = buildMediaLayoutInspectorFields({
    value: createPublicSiteCustomBlock("collage", "inspector-grid"),
    disabled: false,
    t: (message) => message,
    capabilities: {
      size: true,
      aspect: true,
      height: true,
      fit: true,
      frame: true,
      radius: true,
      focalPoint: true,
      opacity: true,
      overlay: true,
      placement: "align",
      responsive: true,
      multiMedia: true,
    },
    onChange: (key, value) => changes.push([key, value]),
  });
  const ids = fields.map((field) => field.id);

  for (const suffix of ["focal-x", "radius", "opacity", "overlay", "columns", "gap", "mobile-fit", "mobile-focal-y", "mobile-columns"]) {
    assert.ok(ids.includes(`media-${suffix}`), `missing ${suffix}`);
  }
  const opacity = fields.find((field) => field.id === "media-opacity");
  assert.equal(opacity?.type, "number");
  if (opacity?.type === "number") opacity.onChange("240");
  assert.deepEqual(changes.at(-1), ["media_opacity", 100]);
});

test("system backgrounds bridge legacy settings into the shared media variables", async () => {
  const source = await read("../lib/public-site/system-sections.ts");
  assert.match(source, /settings\.background_position === "bottom" \? 100 : 50/);
  assert.match(source, /settings\.background_overlay === "strong" \? 62/);
  assert.match(source, /\.\.\.publicSiteMediaVariables\(settings\)/);
  assert.match(source, /"--os-system-media-image"/);
});

test("Standard, Premium, preview and public runtime share the 2.9 contract", async () => {
  const [standard, premium, runtime, slider, globals, migration] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/PremiumUniversalBlockSettings.tsx"),
    read("../components/public/PublicCustomBlock.tsx"),
    read("../components/public/PublicSliderBlock.tsx"),
    read("../app/globals.css"),
    read("../supabase/migrations/20260811223000_site_editor_media_layout_controls_2_9.sql"),
  ]);

  assert.match(standard, /buildMediaLayoutInspectorFields/);
  assert.match(standard, /<MediaListEditor/);
  assert.match(premium, /buildMediaLayoutInspectorFields/);
  assert.match(premium, /type: "mediaList"/);
  assert.match(runtime, /os-managed-media-grid/);
  assert.match(runtime, /data-os-media-mobile-position/);
  assert.match(slider, /publicSiteMediaContainerStyle/);
  assert.match(globals, /--os-media-mobile-position/);
  assert.match(migration, /normalize_public_site_media_layout/);
  assert.match(migration, /normalize_public_site_system_section_settings_v29_base/);
  assert.equal(translateAdmin("ru", "Mobile media"), "Медиа на телефоне");
  assert.equal(translateAdmin("en", "Mobile media"), "Mobile media");
});
