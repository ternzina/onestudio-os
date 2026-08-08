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

test("Premium accepts the existing universal Site Editor block kinds", () => {
  let content = resolvePremiumKidsContent(legacyDraft());
  content = addPremiumKidsBlock(content, "text", "universal-text");
  content = addPremiumKidsBlock(content, "media_text", "universal-text-image", "right");
  content = addPremiumKidsBlock(content, "media_text", "universal-image-text", "left");
  content = addPremiumKidsBlock(content, "columns", "universal-columns");
  expect(content.blocks.slice(-5, -1).map(block => block.type)).toEqual(["text", "media_text", "media_text", "columns"]);
  expect(content.blocks.find(block => block.id === "universal-text-image")?.props.universal_block?.media_position).toBe("right");
  expect(content.blocks.find(block => block.id === "universal-image-text")?.props.universal_block?.media_position).toBe("left");
  expect(content.blocks.find(block => block.id === "universal-columns")?.props.universal_block?.cards).toHaveLength(3);
  const reloaded = resolvePremiumKidsContent(JSON.parse(JSON.stringify(withPremiumKidsContent(legacyDraft(), content))) as PublicSiteContent);
  expect(reloaded.blocks.map(block => block.id)).toEqual(content.blocks.map(block => block.id));
});

test("universal blocks retain shared content and duplication-safe nested IDs", () => {
  let content = addPremiumKidsBlock(resolvePremiumKidsContent(legacyDraft()), "columns", "universal-columns");
  const blocks = content.blocks.map(block => block.id === "universal-columns" && block.props.universal_block ? { ...block, props: { ...block.props, universal_block: { ...block.props.universal_block, title: "Новые направления", cards: block.props.universal_block.cards?.map((card, index) => ({ ...card, title: `Направление ${index + 1}` })) } } } : block);
  content = replacePremiumKidsBlocks(content, blocks);
  const duplicated = duplicatePremiumKidsBlock(content, "universal-columns", "universal-columns-copy");
  const source = duplicated.blocks.find(block => block.id === "universal-columns")!.props.universal_block!;
  const copy = duplicated.blocks.find(block => block.id === "universal-columns-copy")!.props.universal_block!;
  expect(copy.title).toBe("Новые направления");
  expect(copy.id).not.toBe(source.id);
  expect(copy.cards?.map(card => card.id)).not.toEqual(source.cards?.map(card => card.id));
});

test("universal block operations preserve variants and remain draft-only", () => {
  const published = legacyDraft();
  const publishedSnapshot = JSON.stringify(published);
  const original = addPremiumKidsBlock(resolvePremiumKidsContent(legacyDraft()), "media_text", "universal-image-text", "left");
  const hidden = setPremiumKidsBlockVisibility(original, "universal-image-text", false);
  expect(hidden.blocks.find(block => block.id === "universal-image-text")?.visible).toBeFalsy();
  const reset = resetPremiumKidsBlock(hidden, "universal-image-text");
  expect(reset.blocks.find(block => block.id === "universal-image-text")?.props.universal_block?.media_position).toBe("left");
  const deleted = deletePremiumKidsBlock(reset, "universal-image-text");
  expect(deleted.blocks.some(block => block.id === "universal-image-text")).toBeFalsy();
  expect(original.blocks.some(block => block.id === "universal-image-text")).toBeTruthy();
  expect(JSON.stringify(published)).toBe(publishedSnapshot);
});

test("new blocks insert after the selected navigator block", () => {
  const original = resolvePremiumKidsContent(legacyDraft());
  const afterReviews = addPremiumKidsBlock(original, "text", "inserted-text", undefined, "bembi-reviews");
  const reviewsIndex = afterReviews.blocks.findIndex(block => block.id === "bembi-reviews");
  expect(afterReviews.blocks[reviewsIndex + 1].id).toBe("inserted-text");
  const afterHeader = addPremiumKidsBlock(original, "text", "safe-after-header", undefined, "bembi-header");
  expect(afterHeader.blocks[2].id).toBe("safe-after-header");
  expect(afterHeader.blocks[1].id).toBe("bembi-hero");
});

test("mixed native and universal composition keeps one canonical order", () => {
  let content = resolvePremiumKidsContent(legacyDraft());
  content = addPremiumKidsBlock(content, "text", "text-after-hero", undefined, "bembi-hero");
  content = addPremiumKidsBlock(content, "media_text", "image-before-programs", "left", "bembi-faq");
  content = movePremiumKidsBlock(content, "bembi-reviews", "bembi-teachers");
  content = duplicatePremiumKidsBlock(content, "bembi-reviews", "reviews-copy");
  content = movePremiumKidsBlock(content, "reviews-copy", "bembi-programs");
  const expected = content.blocks.map(block => block.id);
  const reloaded = resolvePremiumKidsContent(JSON.parse(JSON.stringify(withPremiumKidsContent(legacyDraft(), content))) as PublicSiteContent);
  expect(reloaded.blocks.map(block => block.id)).toEqual(expected);
  expect(expected.slice(0, 4)).toEqual(["bembi-header", "bembi-hero", "text-after-hero", "bembi-intro"]);
  expect(expected.indexOf("bembi-reviews")).toBeLessThan(expected.indexOf("bembi-teachers"));
  expect(Math.abs(expected.indexOf("reviews-copy") - expected.indexOf("bembi-reviews"))).toBeGreaterThan(1);
});
