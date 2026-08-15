import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { PublicSiteCustomBlock } from "../lib/public-site/types.ts";
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import { getCustomerTemplateChoices, getTemplateCatalogRecord } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { createRastemCenterRenderPlan } from "../lib/public-site/rastem-center-render-plan.ts";
import { DEFAULT_RASTEM_CENTER_CONTENT, resolveRastemCenterContent, withRastemCenterContent } from "../lib/public-site/rastem-center-premium-template-content.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/rastem-center-premium-template-contract.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/rastem-center-premium-template-editor-adapter.ts";

const key = "rastem-center";
const native = (id: string) => `native:${key}:${id}`;

test("RASTEM is customer-creatable through the generic canonical creation contract", () => {
  const catalog = getTemplateCatalogRecord(key);
  const creation = resolveCreationContract({ creation_mode: "template", template_key: key, locales: ["ru", "en"] });
  assert.equal(catalog?.capabilities.customerCreatable, true);
  assert.ok(getCustomerTemplateChoices().some((item) => item.key === key));
  assert.equal(creation.template_key, key);
  assert.equal(creation.seed.template_id, key);
  assert.equal(creation.localizedSeeds.ru.template_id, key);
  assert.equal(creation.localizedSeeds.en.template_id, key);
  assert.deepEqual(creation.seed.layout_order, RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => native(id)));
  assert.deepEqual(resolveCreationContract({ creation_mode: "template", template_key: key, locales: ["ru"] }).seed.template_content?.[`${key}:locale`], "ru");
});

test("RASTEM customer content persists text/media changes, reset source, and JSON reload", () => {
  const seed = createTemplateSeed(key);
  const original = resolveRastemCenterContent(seed);
  const changed = withRastemCenterContent(seed, { ...original, hero: { ...original.hero, title: "Customer hero", image: "/templates/rastem-center/teacher-jan.webp" } });
  const reloaded = resolveRastemCenterContent(JSON.parse(JSON.stringify(changed)));
  assert.equal(reloaded.hero.title, "Customer hero");
  assert.equal(reloaded.hero.image, "/templates/rastem-center/teacher-jan.webp");
  const reset = resolveRastemCenterContent(RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.resetSection(reloaded as unknown as typeof seed, "hero"));
  assert.equal(reset.hero.title, DEFAULT_RASTEM_CENTER_CONTENT.hero.title);
  assert.equal(reset.hero.image, "/templates/rastem-center/hero-platform.webp");
});

test("RASTEM uses generic native/custom composition and reorder with reload-safe layout", () => {
  const seed = createTemplateSeed(key);
  const block = { id: "parent-note", kind: "text", eyebrow: "", title: "Parent note", text: "Saved custom content", items: "", button_label: "", button_url: "", tone: "light", is_visible: true } as unknown as PublicSiteCustomBlock;
  const inserted = RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.insertCustomBlock(seed, block);
  const insertedKeys = createRastemCenterRenderPlan(inserted).map((item) => item.key);
  assert.ok(insertedKeys.includes(native("hero")));
  assert.ok(insertedKeys.includes("custom:parent-note"));
  assert.ok(insertedKeys.includes(native("footer")));

  const normalized = RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.normalizeLayout(inserted.layout_order ?? [], [block.id]);
  const customIndex = normalized.indexOf("custom:parent-note");
  const nativeMoved = RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.moveLayoutItem({ tokens: normalized, customBlockIds: [block.id], fromIndex: 1, toIndex: 3 });
  assert.equal(nativeMoved[0], native("hero"));
  assert.equal(nativeMoved[nativeMoved.length - 1], native("footer"));
  assert.notEqual(nativeMoved[1], normalized[1]);
  const customMoved = RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.moveLayoutItem({ tokens: nativeMoved, customBlockIds: [block.id], fromIndex: customIndex, toIndex: 1 });
  assert.equal(customMoved[0], native("hero"));
  assert.equal(customMoved[1], "custom:parent-note");
  assert.equal(customMoved[customMoved.length - 1], native("footer"));
  const reloaded = JSON.parse(JSON.stringify({ ...inserted, layout_order: customMoved }));
  assert.deepEqual(reloaded.layout_order, customMoved);
  assert.deepEqual(createRastemCenterRenderPlan(reloaded).map((item) => item.key), customMoved);
});

test("RASTEM runtime keeps all native preview anchors and generic custom anchor path", async () => {
  const runtime = await readFile(new URL("../components/public/rastem-center/RastemCenterSite.tsx", import.meta.url), "utf8");
  for (const { id } of RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections) assert.match(runtime, new RegExp(`data-editor-anchor=\\"${id}\\"`));
  const customBlock = await readFile(new URL("../components/public/PublicCustomBlock.tsx", import.meta.url), "utf8");
  assert.match(customBlock, /data-editor-anchor=\{`custom:\$\{block\.id\}`\}/);
  assert.match(customBlock, /editorAnchor=\{`custom:\$\{block\.id\}`\}/);
});

test("RASTEM registry migration is additive, idempotent and canonical", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260815090000_rastem_center_template_registry.sql", import.meta.url), "utf8");
  assert.match(sql, /insert into public\.site_template_registry/);
  assert.match(sql, /'rastem-center', 'rastem-center', true, true/);
  assert.match(sql, /on conflict \(template_key\) do update/);
  assert.doesNotMatch(sql, /create table|legacy_demo_slug|demo_slug|pawhaus|premium-kids-center/);
});
