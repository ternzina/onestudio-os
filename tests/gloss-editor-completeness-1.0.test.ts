import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { buildGlossInspectorFields, GLOSS_EDITOR_EDITABLE_PATHS } from "../lib/public-site/gloss-editor-schema.ts";
import { glossHeroImageMediaTarget, glossIndexedMediaTarget, glossSectionBackgroundMediaTarget, mutateGlossIndexedCards, setGlossServiceCardImage } from "../lib/public-site/gloss-card-editor-model.ts";
import { GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/gloss-premium-template-editor-adapter.ts";
import { canMovePremiumEditorLayoutItem, getPremiumEditorSection, getPremiumEditorSectionByAnchor } from "../lib/public-site/premium-template-editor-adapter.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const requiredPaths = {
  hero: ["show_announcement", "announcement_text", "header_sticky", "header_logo_size", "header_logo_position", "hero_layout", "hero_image_fit", "hero_image_placement", "hero_eyebrow", "hero_title", "hero_text", "hero_primary_label", "hero_primary_url", "show_hero_secondary", "hero_secondary_label", "hero_secondary_url", "hero_image_url"],
  services: ["services_label", "services_title", "services_button_label", "services_layout", "services_columns", "services_show_description", "services_show_price", "services_show_duration", "service_image_urls", "service_card_images"],
  portfolio: ["portfolio_label", "portfolio_title", "popular_title", "work_filters", "portfolio_layout", "portfolio_columns", "portfolio_card_aspect", "portfolio_show_filters", "portfolio_lightbox", "portfolio_show_category", "portfolio_show_title", "portfolio_show_description", "portfolio_home_limit"],
  team: ["team_label", "team_title", "team_items", "team_image_urls"],
  booking: ["booking_label", "booking_title", "booking_text"],
  membership: ["membership_label", "membership_title", "membership_text", "membership_items", "membership_image_url", "membership_image_urls"],
  safety: ["safety_label", "safety_title", "safety_items"],
  reviews: ["reviews_label", "reviews_title", "reviews_items", "reviews"],
  gift: ["gift_label", "gift_title", "gift_text", "gift_items", "gift_image_url", "gift_image_urls"],
  faq: ["faq_label", "faq_title", "faq_items"],
  about: ["about_label", "about_title", "about_text", "about_facts", "about_button_label", "about_button_url", "about_image_url"],
  contact: ["contact_label", "contact_title", "contact_address", "contact_phone", "contact_email", "contact_hours", "contact_note", "contact_route_label", "map_query", "footer_note"],
} as const;

test("GLOSS inspector covers every editable capability of the pre-Phase-5 native editor", () => {
  for (const [section, paths] of Object.entries(requiredPaths)) {
    const actual = new Set(GLOSS_EDITOR_EDITABLE_PATHS[section as keyof typeof GLOSS_EDITOR_EDITABLE_PATHS]);
    for (const path of paths) assert.ok(actual.has(path), `${section} must edit ${path}`);
    for (const suffix of ["layout", "content_width", "text_align", "padding_top", "padding_bottom", "section_height", "heading_typography", "background_mode", "background_image_url", "background_position", "background_overlay", "animation", "animate_on_mobile", "hide_on_desktop", "hide_on_tablet", "hide_on_mobile"]) {
      assert.ok(actual.has(`system_section_settings.${section}.${suffix}`), `${section} must edit nested ${suffix}`);
    }
    for (const color of ["mode", "background", "text", "accent"]) assert.ok(actual.has(`section_colors.${section}.${color}`), `${section} must edit ${color} color`);
  }
});

test("GLOSS Hero is selectable fixed editor chrome outside persisted composition", () => {
  const adapter = GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER;
  const hero = getPremiumEditorSection(adapter, "hero");
  assert.equal(hero?.label, "Обложка");
  assert.equal(getPremiumEditorSectionByAnchor(adapter, "hero")?.id, "hero");
  assert.equal(adapter.fixedEditorSections?.[0]?.id, "hero");
  assert.equal(hero?.capabilities.reorder, false);
  assert.equal(adapter.nativeToken("hero"), "fixed:hero");
  assert.equal(adapter.nativeSectionId("fixed:hero"), null);

  const seed = createTemplateSeed("gloss-nail-studio");
  const hidden = adapter.setSectionVisibility(seed, "hero", false);
  assert.equal(hidden.show_hero, false);
  assert.deepEqual(hidden.layout_order, seed.layout_order);
  const original = [...(seed.layout_order ?? [])];
  const normalized = adapter.normalizeLayout(["fixed:hero", "section:hero", ...original], []);
  assert.deepEqual(normalized, original);
  assert.ok(!normalized.includes("section:hero"));
  assert.equal(canMovePremiumEditorLayoutItem(adapter, { tokens: original, customBlockIds: [], fromIndex: -1, direction: 1 }), false);
});

test("GLOSS generic fields edit nested settings without flattening unknown legacy data", () => {
  let content = {
    ...createTemplateSeed("gloss-nail-studio"),
    legacy_compatible_extension: { retained: true },
    system_section_settings: { membership: { layout: "default", future_setting: "keep" } },
    service_card_images: { manicure: "/old.webp" },
  } as PublicSiteContent & { legacy_compatible_extension: { retained: boolean } };
  const change = (next: PublicSiteContent) => { content = next as typeof content; };
  const edit = (section: keyof typeof GLOSS_EDITOR_EDITABLE_PATHS, id: string, value: string | boolean) => {
    const editor = buildGlossInspectorFields(content, section, false, change).find(field => field.id === `gloss-${section}-${id}`) as EditorInspectorPlacedField;
    assert.ok(editor, `${id} is editable`);
    if (editor.type === "toggle") editor.onChange(Boolean(value));
    else if (editor.type !== "notice" && editor.type !== "button" && editor.type !== "custom" && editor.type !== "composition" && editor.type !== "typography" && editor.type !== "richText" && editor.type !== "mediaList") editor.onChange(String(value));
  };

  edit("contact", "map", "Киев, Крещатик 1");
  edit("contact", "route", "Построить маршрут");
  edit("membership", "section-layout", "panel");

  assert.deepEqual(content.service_card_images, { manicure: "/old.webp" });
  assert.equal(content.system_section_settings?.membership?.layout, "panel");
  assert.equal((content.system_section_settings?.membership as Record<string, unknown>).future_setting, "keep");
  assert.deepEqual(content.legacy_compatible_extension, { retained: true });
});

test("GLOSS inspector uses human Russian labels instead of technical object keys", () => {
  const content = createTemplateSeed("gloss-nail-studio");
  const fields = GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER.contract.nativeSections.flatMap(({ id }) => buildGlossInspectorFields(content, id, false, () => undefined));
  const labels = fields.flatMap(item => "label" in item && typeof item.label === "string" ? [item.label] : []);
  assert.ok(labels.length > 80);
  assert.ok(labels.some(label => label.includes("маршрут")));
  assert.ok(labels.some(label => label.includes("Цвет фона")));
  for (const label of labels) {
    assert.doesNotMatch(label, /\b(?:services|portfolio|membership|gift|about|contact|map|label|items|image|url|show)[ _-]/i, `technical label leaked: ${label}`);
    assert.doesNotMatch(label, /^[a-z][a-z ]+$/i, `unlocalized label leaked: ${label}`);
  }
});

test("complex GLOSS sections are template-owned custom controls, never textarea fallbacks", () => {
  const schema = readFileSync(new URL("../lib/public-site/gloss-editor-schema.ts", import.meta.url), "utf8");
  const registry = readFileSync(new URL("../lib/public-site/premium-template-editor-controls-registry.tsx", import.meta.url), "utf8");
  const control = readFileSync(new URL("../components/admin/gloss/GlossNativeSectionControls.tsx", import.meta.url), "utf8");
  for (const path of ["team_items", "membership_items", "gift_items", "safety_items", "reviews_items", "faq_items", "service_card_images"]) {
    assert.match(schema, new RegExp(`customPaths[\\s\\S]*${path}`));
  }
  assert.match(registry, /GlossNativeSectionControls/);
  assert.match(control, /CardsEditor/);
  assert.match(control, /Управлять работами/);
  assert.match(control, /Открыть каталог услуг/);
});

test("pre-Phase-5 rich text paths remain richText inspector fields", () => {
  const content = createTemplateSeed("gloss-nail-studio");
  for (const [section, id] of [["hero", "gloss-hero-text"], ["about", "gloss-about-text"], ["booking", "gloss-booking-text"], ["membership", "gloss-membership-text"], ["gift", "gloss-gift-text"], ["contact", "gloss-contact-note"], ["contact", "gloss-contact-footer"]] as const) {
    assert.equal(buildGlossInspectorFields(content, section, false, () => undefined).find(field => field.id === id)?.type, "richText");
  }
});

test("card add, remove and reorder preserve string persistence and paired image indexes", () => {
  const model = { delimiter: "·", fields: ["name", "role"], defaults: { name: "Новый", role: "" } };
  const input = { items: "Анна · nail\nМария · brow\nЕлена · hair", images: ["/anna.webp", "/maria.webp", "/elena.webp"], model };
  const moved = mutateGlossIndexedCards({ ...input, action: { type: "move", index: 2, to: 0 } });
  assert.equal(moved.items, "Елена · hair\nАнна · nail\nМария · brow");
  assert.deepEqual(moved.images, ["/elena.webp", "/anna.webp", "/maria.webp"]);
  const removed = mutateGlossIndexedCards({ items: moved.items, images: moved.images, model, action: { type: "remove", index: 1 } });
  assert.equal(removed.items, "Елена · hair\nМария · brow");
  assert.deepEqual(removed.images, ["/elena.webp", "/maria.webp"]);
  assert.equal(typeof mutateGlossIndexedCards({ items: removed.items, images: removed.images, model, action: { type: "add" } }).items, "string");
});

test("media picker target and service slug mapping are semantic and preserve legacy fields", () => {
  assert.deepEqual(glossHeroImageMediaTarget(), { kind: "content", key: "hero_image_url", label: "Изображение обложки" });
  assert.deepEqual(glossSectionBackgroundMediaTarget("hero"), { kind: "section-background", section: "hero", label: "Фоновое изображение раздела" });
  let received: ReturnType<typeof glossIndexedMediaTarget> | undefined;
  const callback = (target: ReturnType<typeof glossIndexedMediaTarget>) => { received = target; };
  callback(glossIndexedMediaTarget("team_image_urls", 2, "Фотография сотрудника 3"));
  assert.deepEqual(received, { kind: "list", key: "team_image_urls", index: 2, label: "Фотография сотрудника 3" });
  const content = { service_card_images: { manicure: "/old.webp" }, unknown_legacy: { keep: true } };
  const updated = setGlossServiceCardImage(content, "spa-pedicure", "/spa.webp");
  assert.deepEqual(updated.service_card_images, { manicure: "/old.webp", "spa-pedicure": "/spa.webp" });
  assert.deepEqual(updated.unknown_legacy, { keep: true });
});

test("generic orchestration has no GLOSS branches or component imports", () => {
  const shell = readFileSync(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(shell, /templateKey\s*===\s*["']gloss-nail-studio/);
  assert.doesNotMatch(shell, /GlossNativeSectionControls/);
  assert.doesNotMatch(shell, /Вернуть исходный NOIR/);
  assert.match(shell, /getPremiumTemplateEditorControl/);
  assert.equal(GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER.restoreLabel, "Вернуть исходный шаблон");
});

test("GLOSS edit and save normalization preserve unknown compatible legacy data, custom blocks and section order", () => {
  const seed = createTemplateSeed("gloss-nail-studio");
  type LegacyGlossContent = PublicSiteContent & { future_gloss_option: { nested: Array<number | { keep: string }> } };
  const legacy: LegacyGlossContent = {
    ...seed,
    future_gloss_option: { nested: [1, { keep: "yes" }] },
    layout_order: ["section:services", "custom:legacy", ...seed.layout_order!.filter(token => token !== "section:services")],
    custom_blocks: [{ id: "legacy", kind: "text", eyebrow: "", title: "Legacy", text: "Keep", items: "", button_label: "", button_url: "", tone: "light", is_visible: true }],
  };
  let edited = legacy;
  const title = buildGlossInspectorFields(edited, "services", false, next => { edited = next as LegacyGlossContent; }).find(field => field.id === "gloss-services-title");
  assert.equal(title?.type, "textarea");
  if (title?.type === "textarea") title.onChange("Новый заголовок услуг");
  const editField = (section: "hero" | "contact", id: string, value: string) => {
    const editor = buildGlossInspectorFields(edited, section, false, next => { edited = next as LegacyGlossContent; }).find(field => field.id === id);
    assert.ok(editor && (editor.type === "text" || editor.type === "textarea" || editor.type === "richText"));
    if (editor.type === "text" || editor.type === "textarea" || editor.type === "richText") editor.onChange(value);
  };
  editField("hero", "gloss-hero-title", "Новая обложка");
  editField("hero", "gloss-hero-text", "<p>Текст <strong>обложки</strong></p>");
  editField("contact", "gloss-contact-note", "<p>Подсказка для визита</p>");
  editField("contact", "gloss-contact-footer", "<p>Текст подвала</p>");
  const normalized = {
    ...edited,
    layout_order: GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER.normalizeLayout(edited.layout_order ?? [], (edited.custom_blocks ?? []).map(block => block.id)),
  };
  const savedAndLoaded = JSON.parse(JSON.stringify(normalized));
  assert.deepEqual(savedAndLoaded.future_gloss_option, legacy.future_gloss_option);
  assert.deepEqual(savedAndLoaded.custom_blocks, legacy.custom_blocks);
  assert.deepEqual(savedAndLoaded.layout_order, legacy.layout_order);
  assert.ok(!savedAndLoaded.layout_order.includes("section:hero"));
  assert.equal(savedAndLoaded.services_title, "Новый заголовок услуг");
  assert.equal(savedAndLoaded.hero_title, "Новая обложка");
  assert.equal(savedAndLoaded.hero_text, "<p>Текст <strong>обложки</strong></p>");
  assert.equal(savedAndLoaded.contact_note, "<p>Подсказка для визита</p>");
  assert.equal(savedAndLoaded.footer_note, "<p>Текст подвала</p>");
});
