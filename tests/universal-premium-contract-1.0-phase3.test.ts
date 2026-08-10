import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  canMovePremiumEditorLayoutItem,
  getPremiumEditorNavigationMetadata,
  getPremiumEditorSectionByAnchor,
  getPremiumEditorSectionMetadata,
  visibilityAfterPremiumEditorReset,
  type PremiumTemplateEditorAdapter,
} from "../lib/public-site/premium-template-editor-adapter.ts";
import {
  getPremiumTemplateEditorAdapter,
  validatePremiumTemplateEditorAdapterRegistry,
} from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/noir-premium-template-editor-adapter.ts";
import { DEFAULT_PREMIUM_STUDIO_CONTENT } from "../lib/public-site/premium-studio-content.ts";
import type { PremiumTemplateContract } from "../lib/public-site/premium-template-contract.ts";
import type { PublicSiteContent, PublicSiteCustomBlock } from "../lib/public-site/types.ts";

const nativeIds = ["hero", "manifest", "light", "services", "portfolio", "retouch", "film", "team", "process", "equipment", "tour", "reviews", "faq", "contact", "footer"];
const content = (value: Record<string, unknown> = {}) => value as PublicSiteContent;
const block = (id: string) => ({ id, title: id, is_visible: true } as PublicSiteCustomBlock);

test("real premium definition and editor registries resolve NOIR only", () => {
  const definition = getPremiumTemplateDefinition("premium-studio");
  const adapter = getPremiumTemplateEditorAdapter("premium-studio");
  assert.equal(definition?.templateKey, "premium-studio");
  assert.equal(adapter, NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER);
  assert.equal(getPremiumTemplateDefinition("unknown"), undefined);
  assert.equal(getPremiumTemplateEditorAdapter("unknown"), undefined);
  assert.deepEqual(validatePremiumTemplateEditorAdapterRegistry([adapter!]), []);
});

test("adapter registry rejects duplicate, mismatched, and definitionless adapters", () => {
  const adapter = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER as PremiumTemplateEditorAdapter;
  assert.match(validatePremiumTemplateEditorAdapterRegistry([adapter, adapter]).join(" "), /duplicate adapter/);
  assert.match(validatePremiumTemplateEditorAdapterRegistry([{ ...adapter, templateKey: "wrong" }], () => ({ templateKey: "wrong" })).join(" "), /does not match contract/);
  assert.match(validatePremiumTemplateEditorAdapterRegistry([adapter], () => undefined).join(" "), /no premium definition/);
});

test("NOIR metadata, boundaries, normalization, movement, and insertion retain parity", () => {
  const adapter = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER;
  const metadata = getPremiumEditorNavigationMetadata(adapter);
  assert.deepEqual(metadata.map(({ id }) => id), nativeIds);
  assert.deepEqual(metadata.map(({ label }) => label), adapter.contract.nativeSections.map(({ label }) => label));
  assert.deepEqual(metadata.map(({ anchor }) => anchor), adapter.contract.nativeSections.map(({ anchor }) => anchor));
  assert.equal(metadata[0].pinning, "start");
  assert.equal(metadata.at(-1)?.pinning, "end");

  const normalized = adapter.normalizeLayout([], ["one"]);
  assert.deepEqual(normalized.slice(-3), ["custom:one", "noir:contact", "noir:footer"]);
  assert.ok(normalized.every((token) => /^(noir|custom):/.test(token) && !token.startsWith("native:")));
  const moved = adapter.moveLayoutItem({ tokens: normalized, customBlockIds: ["one"], fromIndex: normalized.indexOf("custom:one"), toIndex: 2 });
  assert.ok(moved.every((token) => !token.startsWith("native:")));
  assert.equal(canMovePremiumEditorLayoutItem(adapter, { tokens: normalized, customBlockIds: ["one"], fromIndex: 0, direction: 1 }), false);

  const inserted = adapter.insertCustomBlock(content({ layout_order: normalized, custom_blocks: [block("one")] }), block("two"));
  assert.equal(inserted.layout_order?.indexOf("custom:two"), inserted.layout_order?.indexOf("noir:contact")! - 1);
  assert.ok(inserted.layout_order?.every((token) => !token.startsWith("native:")));
});

test("NOIR visibility, section reset, and full restore preserve compatibility boundaries", () => {
  const adapter = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER;
  let draft = content({
    template_content: {
      "premium-studio": { ...DEFAULT_PREMIUM_STUDIO_CONTENT, hero: { ...DEFAULT_PREMIUM_STUDIO_CONTENT.hero, eyebrow: "changed" } },
      "other-template": { retained: true },
    },
    global_marker: "keep",
    custom_blocks: [block("remove")],
    layout_order: ["noir:hero", "custom:remove", "noir:footer"],
  });
  draft = adapter.setSectionVisibility(draft, "hero", false);
  assert.equal(adapter.isSectionVisible(draft, "hero"), false);
  assert.equal(adapter.isSectionVisible(adapter.setSectionVisibility(draft, "hero", true), "hero"), true);
  const reset = adapter.resetSection(draft, "hero");
  assert.equal((reset.template_content?.["premium-studio"] as typeof DEFAULT_PREMIUM_STUDIO_CONTENT).hero.eyebrow, DEFAULT_PREMIUM_STUDIO_CONTENT.hero.eyebrow);
  assert.equal(adapter.isSectionVisible(reset, "hero"), true);
  assert.equal(visibilityAfterPremiumEditorReset(adapter.contract.nativeSections[0], false), true);

  const restored = adapter.restoreTemplate(draft);
  assert.deepEqual(restored.template_content?.["other-template"], { retained: true });
  assert.equal((restored as unknown as Record<string, unknown>).global_marker, "keep");
  assert.deepEqual(restored.custom_blocks, []);
  assert.deepEqual((restored.template_content?.["premium-studio"] as typeof DEFAULT_PREMIUM_STUDIO_CONTENT).hero, DEFAULT_PREMIUM_STUDIO_CONTENT.hero);
  assert.equal(adapter.isSectionVisible(restored, "hero"), true);
  assert.ok(restored.layout_order?.every((token) => token.startsWith("noir:")));
});

test("a second adapter uses the same generic helper layer without application changes", () => {
  type Id = "top" | "middle" | "bottom";
  const contract = {
    templateKey: "future-fixed",
    contractVersion: "1.0",
    nativeSections: [
      { id: "top", label: "Top", anchor: "top-anchor", defaultOrder: 0, pinning: "start", capabilities: { visibility: true, reorder: false, reset: true }, visibilityAfterReset: "visible" },
      { id: "middle", label: "Middle", anchor: "middle-anchor", defaultOrder: 1, capabilities: { visibility: true, reorder: true, reset: true }, visibilityAfterReset: "preserve" },
      { id: "bottom", label: "Bottom", anchor: "bottom-anchor", defaultOrder: 2, pinning: "end", capabilities: { visibility: true, reorder: false, reset: true }, visibilityAfterReset: "hidden" },
    ],
  } as const satisfies PremiumTemplateContract<string, Id>;
  let inspectorInvoked = false;
  const fake: PremiumTemplateEditorAdapter<Id> = {
    templateKey: contract.templateKey, contract, initialSectionId: "top",
    nativeToken: (id) => `fixed|${id}`,
    nativeSectionId: (token) => token.startsWith("fixed|") && contract.nativeSections.some(({ id }) => `fixed|${id}` === token) ? token.slice(6) as Id : null,
    normalizeLayout: (tokens, customIds) => ["fixed|top", ...tokens.filter((token) => token === "fixed|middle" || customIds.some((id) => token === `custom:${id}`)), "fixed|bottom"].filter((token, index, all) => all.indexOf(token) === index),
    moveLayoutItem(input) { const next = this.normalizeLayout(input.tokens, input.customBlockIds); if (input.fromIndex <= 0 || input.fromIndex >= next.length - 1) return next; const target = Math.max(1, Math.min(input.toIndex, next.length - 2)); const [item] = next.splice(input.fromIndex, 1); next.splice(target, 0, item); return next; },
    isSectionVisible: (root, id) => (root.template_content?.[contract.templateKey] as Record<string, boolean> | undefined)?.[id] !== false,
    setSectionVisibility: (root, id, visible) => ({ ...root, template_content: { ...root.template_content, [contract.templateKey]: { ...(root.template_content?.[contract.templateKey] as object ?? {}), [id]: visible } } }),
    resetSection(root, id) { return this.setSectionVisibility(root, id, visibilityAfterPremiumEditorReset(contract.nativeSections.find((section) => section.id === id)!, this.isSectionVisible(root, id))); },
    restoreTemplate: (root) => root,
    buildInspectorFields: () => { inspectorInvoked = true; return []; },
    insertCustomBlock: (root, item) => ({ ...root, custom_blocks: [...(root.custom_blocks ?? []), item], layout_order: ["fixed|top", "fixed|middle", `custom:${item.id}`, "fixed|bottom"] }),
    history: { layout: "fixed-layout", visibility: (id) => `fixed:${id}:visibility`, reset: (id) => `fixed:${id}:reset`, restore: "fixed:restore" },
  };
  assert.deepEqual(getPremiumEditorSectionMetadata(fake, "middle"), { ...contract.nativeSections[1], token: "fixed|middle", pinned: false });
  assert.equal(getPremiumEditorSectionByAnchor(fake, "middle-anchor")?.id, "middle");
  assert.deepEqual(getPremiumEditorNavigationMetadata(fake).map(({ label, anchor }) => [label, anchor]), [["Top", "top-anchor"], ["Middle", "middle-anchor"], ["Bottom", "bottom-anchor"]]);
  const tokens = ["fixed|top", "fixed|middle", "custom:x", "fixed|bottom"];
  assert.equal(canMovePremiumEditorLayoutItem(fake, { tokens, customBlockIds: ["x"], fromIndex: 0, direction: 1 }), false);
  assert.equal(canMovePremiumEditorLayoutItem(fake, { tokens, customBlockIds: ["x"], fromIndex: 1, direction: 1 }), true);
  const hidden = fake.setSectionVisibility(content(), "middle", false);
  assert.equal(fake.isSectionVisible(hidden, "middle"), false);
  assert.equal(fake.isSectionVisible(fake.resetSection(hidden, "middle"), "middle"), false);
  fake.buildInspectorFields({ content: hidden, sectionId: "middle", disabled: false, onChange: () => undefined });
  assert.equal(inspectorInvoked, true);
  assert.deepEqual(fake.insertCustomBlock(content(), block("new")).layout_order, ["fixed|top", "fixed|middle", "custom:new", "fixed|bottom"]);
  assert.ok(fake.normalizeLayout(tokens, ["x"]).every((token) => !token.startsWith("native:")));
});

test("admin editor resolves premium semantics through the adapter registry", async () => {
  const source = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(source, /premium-template-editor-registry/);
  assert.match(source, /getPremiumTemplateEditorAdapter/);
  assert.doesNotMatch(source, /from ["']@\/lib\/public-site\/(?:noir-editor-schema|noir-premium-template-contract|noir-premium-template-compat)/);
});
