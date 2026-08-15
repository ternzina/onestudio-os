import assert from "node:assert/strict";
import test from "node:test";
import { canonicalizePremiumTemplateLayoutForSave } from "../lib/public-site/premium-template-editor-adapter.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { createPremiumTemplateRenderPlan } from "../lib/public-site/premium-template-render-plan.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { createPawhausGroomingStudioPremiumTemplateSeed } from "../lib/public-site/pawhaus-grooming-studio-premium-template-seed.ts";

const CANONICAL_KEYS = [
  "pawhaus-grooming-studio",
  "ritmo-dance-studio",
  "align-pilates-studio",
] as const;

function block(id: string) {
  return { id, kind: "text", eyebrow: "", title: id, text: "", items: "", button_label: "", button_url: "", tone: "light", is_visible: true } as never;
}

test("canonical package adapters share native and custom movement", () => {
  for (const key of CANONICAL_KEYS) {
    const adapter = getPremiumTemplateEditorAdapter(key)!;
    const seed = key === "pawhaus-grooming-studio" ? createPawhausGroomingStudioPremiumTemplateSeed() : createTemplateSeed(key);
    const native = adapter.normalizeLayout(seed.layout_order ?? [], []);
    const mixed = [native[0], native[1], "custom:note", ...native.slice(2)];
    const movedNative = adapter.moveLayoutItem({ tokens: mixed, customBlockIds: ["note"], fromIndex: 1, toIndex: 3 });
    assert.deepEqual(movedNative.slice(0, 4), [native[0], "custom:note", native[2], native[1]], key);
    const movedCustom = adapter.moveLayoutItem({ tokens: mixed, customBlockIds: ["note"], fromIndex: 2, toIndex: 1 });
    assert.deepEqual(movedCustom.slice(0, 4), [native[0], "custom:note", native[1], native[2]], key);
  }
});

test("PAWHAUS moved layout survives editor/save normalization and runtime planning", () => {
  const key = "pawhaus-grooming-studio";
  const adapter = getPremiumTemplateEditorAdapter(key)!;
  const seed = createPawhausGroomingStudioPremiumTemplateSeed();
  const custom = block("note");
  const initial = adapter.normalizeLayout(seed.layout_order ?? [], ["note"]);
  const moved = adapter.moveLayoutItem({
    tokens: [...initial.slice(0, 2), "custom:note", ...initial.slice(2)],
    customBlockIds: ["note"],
    fromIndex: 2,
    toIndex: 1,
  });
  const saved = canonicalizePremiumTemplateLayoutForSave({ ...seed, custom_blocks: [custom], layout_order: moved }, adapter);
  assert.deepEqual(adapter.normalizeLayout(saved.layout_order ?? [], ["note"]), moved);
  const plan = createPremiumTemplateRenderPlan({ ...saved, layout_order: saved.layout_order }, getPremiumTemplateDefinition(key)!);
  assert.deepEqual(plan.slice(0, 4).map((item) => item.key), moved.slice(0, 4));
});

test("canonical registry supplies composition operations without template-specific movement branches", () => {
  const source = String(getPremiumTemplateEditorAdapter);
  assert.doesNotMatch(source, /pawhaus|ritmo|align/i);
  for (const key of CANONICAL_KEYS) {
    const adapter = getPremiumTemplateEditorAdapter(key)!;
    assert.equal(adapter.nativeSectionId(adapter.nativeToken(adapter.contract.nativeSections[1].id)), adapter.contract.nativeSections[1].id);
  }
});
