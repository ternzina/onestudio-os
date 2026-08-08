import { expect, test } from "@playwright/test";
import {
  DEFAULT_PREMIUM_KIDS_CONTENT,
  addPremiumKidsBlock,
  deletePremiumKidsBlock,
  duplicatePremiumKidsBlock,
  movePremiumKidsBlock,
  replacePremiumKidsBlocks,
  resetPremiumKidsBlock,
  resolvePremiumKidsContent,
  restoreOriginalPremiumKidsContent,
  setPremiumKidsBlockVisibility,
  withPremiumKidsContent,
} from "../../lib/public-site/premium-kids-content";
import type { PublicSiteContent } from "../../lib/public-site/types";

const legacyDraft = (): PublicSiteContent => ({
  brand_name: "BEMBI",
  template_id: "premium-kids-center",
  template_content: { "premium-kids-center": { ...DEFAULT_PREMIUM_KIDS_CONTENT } },
} as unknown as PublicSiteContent);

test("legacy Premium JSON normalizes to stable ordered block instances", () => {
  const content = resolvePremiumKidsContent(legacyDraft());
  expect(content.blocks.map(block => block.id)).toEqual([
    "bembi-header", "bembi-hero", "bembi-intro", "bembi-approach", "bembi-schedule", "bembi-teachers",
    "bembi-gallery", "bembi-reviews", "bembi-faq", "bembi-programs", "bembi-final", "bembi-footer",
  ]);
  expect(resolvePremiumKidsContent(withPremiumKidsContent(legacyDraft(), content)).blocks).toEqual(content.blocks);
});

test("reorder persists after JSON reload and leaves published content unchanged", () => {
  const published = legacyDraft();
  const publishedSnapshot = JSON.stringify(published);
  const draft = resolvePremiumKidsContent(legacyDraft());
  const reordered = movePremiumKidsBlock(draft, "bembi-reviews", "bembi-gallery");
  expect(reordered.blocks.indexOf(reordered.blocks.find(block => block.id === "bembi-reviews")!)).toBeLessThan(reordered.blocks.indexOf(reordered.blocks.find(block => block.id === "bembi-gallery")!));
  const saved = JSON.parse(JSON.stringify(withPremiumKidsContent(legacyDraft(), reordered))) as PublicSiteContent;
  expect(resolvePremiumKidsContent(saved).blocks.map(block => block.id)).toEqual(reordered.blocks.map(block => block.id));
  expect(JSON.stringify(published)).toBe(publishedSnapshot);
});

test("duplicate and add use distinct stable IDs and can be undone by history state", () => {
  const original = resolvePremiumKidsContent(legacyDraft());
  const duplicated = duplicatePremiumKidsBlock(original, "bembi-reviews", "bembi-reviews-copy");
  expect(duplicated.blocks.filter(block => block.type === "reviews").map(block => block.id)).toEqual(["bembi-reviews", "bembi-reviews-copy"]);
  expect(original.blocks.filter(block => block.type === "reviews")).toHaveLength(1);
  const added = addPremiumKidsBlock(duplicated, "faq", "bembi-faq-added");
  expect(added.blocks.some(block => block.id === "bembi-faq-added")).toBeTruthy();
  const reloaded = resolvePremiumKidsContent(JSON.parse(JSON.stringify(withPremiumKidsContent(legacyDraft(), added))) as PublicSiteContent);
  expect(reloaded.blocks.some(block => block.id === "bembi-faq-added")).toBeTruthy();
});

test("safe blocks delete and hide while required blocks remain locked", () => {
  const original = resolvePremiumKidsContent(legacyDraft());
  const deleted = deletePremiumKidsBlock(original, "bembi-reviews");
  expect(deleted.blocks.some(block => block.id === "bembi-reviews")).toBeFalsy();
  expect(deletePremiumKidsBlock(original, "bembi-header")).toBe(original);
  expect(deletePremiumKidsBlock(original, "bembi-footer")).toBe(original);
  const hidden = setPremiumKidsBlockVisibility(original, "bembi-gallery", false);
  expect(hidden.blocks.find(block => block.id === "bembi-gallery")?.visible).toBeFalsy();
  expect(hidden.hidden_sections).toContain("bembi-gallery");
  expect(setPremiumKidsBlockVisibility(original, "bembi-hero", false)).toBe(original);
});

test("reset one block and restore original template affect draft composition only", () => {
  const published = legacyDraft();
  const publishedSnapshot = JSON.stringify(published);
  const original = resolvePremiumKidsContent(legacyDraft());
  const editedBlocks = original.blocks.map(block => block.id === "bembi-hero" ? { ...block, props: { ...block.props, hero_title: "Изменённый заголовок" } } : block);
  const edited = addPremiumKidsBlock(movePremiumKidsBlock(replacePremiumKidsBlocks(original, editedBlocks), "bembi-faq", "bembi-gallery"), "reviews", "extra-reviews");
  const reset = resetPremiumKidsBlock(edited, "bembi-hero");
  expect(reset.blocks.find(block => block.id === "bembi-hero")?.props.hero_title).toBe(DEFAULT_PREMIUM_KIDS_CONTENT.hero_title);
  const restored = restoreOriginalPremiumKidsContent();
  expect(restored).toEqual(resolvePremiumKidsContent(legacyDraft()));
  expect(JSON.stringify(published)).toBe(publishedSnapshot);
});
