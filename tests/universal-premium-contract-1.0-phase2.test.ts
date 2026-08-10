import assert from "node:assert/strict";
import test from "node:test";
import {
  canLegacyNoirNativeSectionReorder,
  canonicalNoirTokenToLegacy,
  isLegacyNoirNativeTokenPinned,
  LEGACY_NOIR_NATIVE_LAYOUT_ORDER,
  legacyNoirVisibilityAfterReset,
  legacyNoirTokenToCanonical,
  moveLegacyNoirCompositionItem,
  normalizeLegacyNoirComposition,
  parseLegacyNoirToken,
} from "../lib/public-site/noir-premium-template-compat.ts";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/noir-premium-template-contract.ts";
import { validatePremiumTemplateContract } from "../lib/public-site/premium-template-contract.ts";

const nativeIds = [
  "hero", "manifest", "light", "services", "portfolio", "retouch", "film",
  "team", "process", "equipment", "tour", "reviews", "faq", "contact", "footer",
];

test("NOIR contract preserves exact native identity, order, anchors and boundaries", () => {
  assert.deepEqual(NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id), nativeIds);
  assert.deepEqual(NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ anchor }) => anchor), nativeIds);
  assert.equal(new Set(NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ anchor }) => anchor)).size, nativeIds.length);
  assert.equal("pinning" in NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections[0]
    ? NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections[0].pinning : undefined, "start");
  const last = NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.at(-1);
  assert.equal(last && "pinning" in last ? last.pinning : undefined, "end");
  assert.deepEqual(validatePremiumTemplateContract(NOIR_PREMIUM_TEMPLATE_CONTRACT), []);
});

test("legacy and canonical NOIR tokens round-trip without accepting unknown or foreign tokens", () => {
  assert.deepEqual(parseLegacyNoirToken("noir:hero"), { sectionId: "hero" });
  assert.equal(legacyNoirTokenToCanonical("noir:hero"), "native:premium-studio:hero");
  assert.equal(canonicalNoirTokenToLegacy("native:premium-studio:hero"), "noir:hero");
  assert.equal(parseLegacyNoirToken("noir:unknown"), null);
  assert.equal(legacyNoirTokenToCanonical("noir:unknown"), null);
  assert.equal(canonicalNoirTokenToLegacy("native:other-template:hero"), null);
  assert.equal(canonicalNoirTokenToLegacy("native:premium-studio:unknown"), null);
});

test("legacy drafts normalize duplicates and missing sections while preserving custom interleaving", () => {
  const normalized = normalizeLegacyNoirComposition([
    "noir:footer", "noir:services", "custom:b", "noir:services", "bad:value",
    "custom:a", "native:premium-studio:team",
  ], ["a", "b", "c"]);
  assert.equal(normalized[0], "noir:hero");
  assert.equal(normalized.at(-1), "noir:footer");
  assert.equal(normalized.filter((token) => token === "noir:services").length, 1);
  assert.ok(normalized.indexOf("noir:services") < normalized.indexOf("custom:b"));
  assert.ok(normalized.indexOf("custom:b") < normalized.indexOf("custom:a"));
  assert.ok(normalized.includes("custom:c"));
  assert.deepEqual(normalized.filter((token) => token.startsWith("noir:")).sort(), [...LEGACY_NOIR_NATIVE_LAYOUT_ORDER].sort());
});

test("empty legacy layout retains NOIR custom-before-contact fallback behavior", () => {
  const normalized = normalizeLegacyNoirComposition([], ["first", "second"]);
  assert.deepEqual(normalized.slice(-4), ["custom:first", "custom:second", "noir:contact", "noir:footer"]);
});

test("persistence output contains only legacy NOIR and custom tokens", () => {
  const normalized = normalizeLegacyNoirComposition(
    ["noir:team", "custom:block-1", "noir:hero"],
    ["block-1"],
  );
  assert.ok(normalized.every((token) => token.startsWith("noir:") || token.startsWith("custom:")));
  assert.ok(normalized.every((token) => !token.startsWith("native:")));
});

test("contract-derived legacy order is behaviorally identical to production NOIR order", () => {
  assert.deepEqual(LEGACY_NOIR_NATIVE_LAYOUT_ORDER, nativeIds.map((id) => `noir:${id}`));
  assert.deepEqual(normalizeLegacyNoirComposition(LEGACY_NOIR_NATIVE_LAYOUT_ORDER, []), LEGACY_NOIR_NATIVE_LAYOUT_ORDER);
});

test("foreign canonical tokens in legacy drafts are ignored without migration", () => {
  const normalized = normalizeLegacyNoirComposition(
    ["native:premium-studio:services", "native:foreign:team", "custom:kept"],
    ["kept"],
  );
  assert.ok(normalized.includes("custom:kept"));
  assert.deepEqual(normalized.filter((token) => token.startsWith("noir:")), LEGACY_NOIR_NATIVE_LAYOUT_ORDER);
  assert.deepEqual(normalized.slice(-3), ["custom:kept", "noir:contact", "noir:footer"]);
  assert.ok(normalized.every((token) => !token.startsWith("native:")));
});

test("legacy movement delegates pinned boundaries to the NOIR contract", () => {
  const tokens = [...LEGACY_NOIR_NATIVE_LAYOUT_ORDER];
  const heroIndex = tokens.indexOf("noir:hero");
  const footerIndex = tokens.indexOf("noir:footer");

  assert.deepEqual(moveLegacyNoirCompositionItem({
    tokens, customBlockIds: [], fromIndex: heroIndex, toIndex: heroIndex + 1,
  }), tokens);
  assert.deepEqual(moveLegacyNoirCompositionItem({
    tokens, customBlockIds: [], fromIndex: footerIndex, toIndex: footerIndex - 1,
  }), tokens);
  assert.deepEqual(moveLegacyNoirCompositionItem({
    tokens, customBlockIds: [], fromIndex: 1, toIndex: 0,
  }), tokens);
  assert.deepEqual(moveLegacyNoirCompositionItem({
    tokens, customBlockIds: [], fromIndex: tokens.length - 2, toIndex: tokens.length - 1,
  }), tokens);
});

test("custom blocks cannot cross NOIR pinned boundaries", () => {
  const tokens = [
    "noir:hero", "custom:start", ...LEGACY_NOIR_NATIVE_LAYOUT_ORDER.slice(1, -1),
    "custom:end", "noir:footer",
  ];
  assert.deepEqual(moveLegacyNoirCompositionItem({
    tokens, customBlockIds: ["start", "end"], fromIndex: 1, toIndex: 0,
  }), tokens);
  assert.deepEqual(moveLegacyNoirCompositionItem({
    tokens, customBlockIds: ["start", "end"], fromIndex: tokens.length - 2, toIndex: tokens.length - 1,
  }), tokens);
});

test("legacy movement output remains persistence-safe", () => {
  const moved = moveLegacyNoirCompositionItem({
    tokens: [...LEGACY_NOIR_NATIVE_LAYOUT_ORDER.slice(0, 2), "custom:block", ...LEGACY_NOIR_NATIVE_LAYOUT_ORDER.slice(2)],
    customBlockIds: ["block"],
    fromIndex: 2,
    toIndex: 3,
  });
  assert.ok(moved.every((token) => token.startsWith("noir:") || token.startsWith("custom:")));
  assert.ok(moved.every((token) => !token.startsWith("native:")));
});

test("legacy pinning, reorder and reset visibility metadata derive from the contract", () => {
  for (const section of NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections) {
    const token = `noir:${section.id}`;
    assert.equal(isLegacyNoirNativeTokenPinned(token), "pinning" in section);
    assert.equal(canLegacyNoirNativeSectionReorder(section.id), section.capabilities.reorder);
    assert.equal(section.visibilityAfterReset, "visible");
    assert.equal(legacyNoirVisibilityAfterReset(section.id, false), true);
  }
  assert.equal(isLegacyNoirNativeTokenPinned("custom:block"), false);
  assert.equal(canLegacyNoirNativeSectionReorder("unknown"), false);
});
