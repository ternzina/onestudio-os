import assert from "node:assert/strict";
import test from "node:test";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/bloom-floral-studio-premium-template-contract.ts";
import { BLOOM_FLORAL_STUDIO_EDITOR_SPECS } from "../lib/public-site/bloom-floral-studio-editor-schema.ts";
import { createBloomFloralStudioPremiumTemplateSeed } from "../lib/public-site/bloom-floral-studio-premium-template-seed.ts";
import { createBloomFloralStudioRenderPlan } from "../lib/public-site/bloom-floral-studio-render-plan.ts";
import { BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/bloom-floral-studio-premium-template-editor-adapter.ts";
import { premiumNativeActionKey } from "../lib/public-site/premium-action-style.ts";
import { resolveBloomFloralStudioContent } from "../lib/public-site/bloom-floral-studio-premium-template-content.ts";

const key = "bloom-floral-studio";
const sections = ["hero", "collections", "occasions", "delivery", "weddings", "subscription", "workshops", "testimonials", "faq", "contact", "footer"] as const;

test("BLOOM is a free bilingual canonical package", () => {
  const pkg = PREMIUM_TEMPLATE_PACKAGE_SOURCE.find((entry) => entry.manifest.templateKey === key);
  assert.equal(pkg?.manifest.name, "BLOOM Floral Atelier"); assert.equal(pkg?.manifest.access, "free"); assert.deepEqual(pkg?.manifest.nativeSectionIds, sections);
  assert.deepEqual(pkg?.manifest.preview.route, "/demos/bloom-floral-studio"); assert.equal(pkg?.manifest.persistence.contentNamespace, true);
});
test("BLOOM contract pins hero/footer and allows middle reorder", () => {
  assert.deepEqual(BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map((x) => x.id), sections);
  const first = BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections[0] as { pinning?: string }; const last = BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections.at(-1) as { pinning?: string }; assert.equal(first.pinning, "start"); assert.equal(last.pinning, "end");
  assert.ok(BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections.slice(1, -1).every((x) => x.capabilities.reorder));
});
test("BLOOM uses isolated assets and custom blocks interleave", () => {
  const content = createBloomFloralStudioPremiumTemplateSeed(); const block = { id: "note-1", kind: "text", props: { title: "Test" } } as any;
  const next = BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_EDITOR_ADAPTER.insertCustomBlock(content, block); const plan = createBloomFloralStudioRenderPlan(next); const customIndex = plan.findIndex((x) => x.kind === "custom");
  assert.ok(customIndex > 0); assert.equal(plan[customIndex - 1].kind, "native"); assert.ok(plan[customIndex + 1].kind === "native");
  const serialized = JSON.stringify(resolveBloomFloralStudioContent(content)); assert.match(serialized, /\/templates\/bloom-floral-studio\//); assert.doesNotMatch(serialized, /\/templates\/(pawhaus|blackline|rastem|align|ritmo)/);
});
test("BLOOM EN content has no Cyrillic and every section has editor schema", () => {
  const en = JSON.stringify(resolveBloomFloralStudioContent(createBloomFloralStudioPremiumTemplateSeed("en"))); assert.doesNotMatch(en, /[А-Яа-яЁё]/);
  for (const section of sections) assert.ok(BLOOM_FLORAL_STUDIO_EDITOR_SPECS[section]?.length, section);
});
test("BLOOM editor binding uses plain headings, media and shared premium actions", () => {
  const hero = BLOOM_FLORAL_STUDIO_EDITOR_SPECS.hero; assert.equal(hero.find((x) => x.id === "title")?.kind, "textarea"); assert.equal(hero.find((x) => x.id === "image")?.kind, "media"); assert.ok(hero.some((x) => x.kind === "action"));
  assert.equal(premiumNativeActionKey(key, "hero", "hero-primary"), "bloom-floral-studio:hero:hero-primary"); assert.match(JSON.stringify(BLOOM_FLORAL_STUDIO_EDITOR_SPECS), /collections-cta|delivery-cta|weddings-cta|subscription-cta|workshops-cta|contact-cta|footer-cta/);
});
test("BLOOM partial stored content resolves safely", () => {
  const content = createBloomFloralStudioPremiumTemplateSeed(); const partial = { ...content, template_content: { ...(content.template_content ?? {}), [key]: { version: 1, hero: { title: "Edited" } } } } as any;
  const resolved = resolveBloomFloralStudioContent(partial); assert.equal(resolved.hero.title, "Edited"); assert.equal(resolved.collections.items.length, 4); assert.equal(resolved.footer.cta.text, "#contact");
});
