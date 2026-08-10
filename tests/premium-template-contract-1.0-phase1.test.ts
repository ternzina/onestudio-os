import assert from "node:assert/strict";
import test from "node:test";
import {
  createPremiumTemplateNativeToken,
  isCanonicalPremiumTemplateCompositionToken,
  movePremiumTemplateCompositionItem,
  normalizePremiumTemplateComposition,
  parsePremiumTemplateNativeToken,
} from "../lib/public-site/premium-template-composition.ts";
import {
  assertValidPremiumTemplateContract,
  validatePremiumTemplateContract,
  validatePremiumTemplateContractRegistry,
  type PremiumTemplateContract,
  type PremiumTemplateContentHooks,
} from "../lib/public-site/premium-template-contract.ts";

const capabilities = { visibility: true, reorder: true, reset: true } as const;
const contract = {
  templateKey: "future-template",
  contractVersion: "1.0",
  nativeSections: [
    { id: "header", label: "Header", anchor: "header", defaultOrder: 0, pinning: "start", capabilities, visibilityAfterReset: "visible" },
    { id: "work", label: "Work", anchor: "work", defaultOrder: 1, capabilities, visibilityAfterReset: "preserve" },
    { id: "about", label: "About", anchor: "about", defaultOrder: 2, capabilities, visibilityAfterReset: "hidden" },
    { id: "footer", label: "Footer", anchor: "footer", defaultOrder: 3, pinning: "end", capabilities, visibilityAfterReset: "visible" },
  ],
} as const satisfies PremiumTemplateContract;

test("creates and parses canonical native tokens", () => {
  const token = createPremiumTemplateNativeToken("future-template", "work");
  assert.equal(token, "native:future-template:work");
  assert.deepEqual(parsePremiumTemplateNativeToken(token), { templateKey: "future-template", sectionId: "work" });
});

test("rejects malformed canonical tokens", () => {
  for (const token of ["native:future-template", "native::work", "native:Future:work", "custom:", "custom:a:b", "other:a"]) {
    assert.equal(isCanonicalPremiumTemplateCompositionToken(token), false, token);
  }
  assert.throws(() => createPremiumTemplateNativeToken("Future", "work"));
});

test("normalization rejects foreign native tokens and removes duplicates", () => {
  assert.deepEqual(normalizePremiumTemplateComposition({
    contract,
    tokens: ["native:other:work", "native:future-template:work", "native:future-template:work"],
    customBlockIds: [],
  }), ["native:future-template:header", "native:future-template:work", "native:future-template:about", "native:future-template:footer"]);
});

test("restores missing native sections and deterministically interleaves custom blocks", () => {
  const input = {
    contract,
    tokens: ["native:future-template:work", "custom:b", "native:future-template:about", "custom:a"],
    customBlockIds: ["a", "b", "c"],
  } as const;
  const expected = ["native:future-template:header", "native:future-template:work", "custom:b", "native:future-template:about", "custom:a", "custom:c", "native:future-template:footer"];
  assert.deepEqual(normalizePremiumTemplateComposition(input), expected);
  assert.deepEqual(normalizePremiumTemplateComposition(input), expected);
});

test("removes orphan custom tokens and appends missing valid custom blocks", () => {
  const result = normalizePremiumTemplateComposition({ contract, tokens: ["custom:gone", "custom:a"], customBlockIds: ["a", "b"] });
  assert.equal(result.includes("custom:gone"), false);
  assert.deepEqual(result.filter((token) => token.startsWith("custom:")), ["custom:a", "custom:b"]);
  assert.equal(result.at(-1), "native:future-template:footer");
});

test("enforces start and end pin boundaries", () => {
  const result = normalizePremiumTemplateComposition({
    contract,
    tokens: ["native:future-template:footer", "custom:a", "native:future-template:header", "native:future-template:work"],
    customBlockIds: ["a"],
  });
  assert.equal(result[0], "native:future-template:header");
  assert.equal(result.at(-1), "native:future-template:footer");
});

test("direct reorder cannot cross pinned boundaries", () => {
  const tokens = normalizePremiumTemplateComposition({ contract, tokens: [], customBlockIds: ["a"] });
  assert.deepEqual(movePremiumTemplateCompositionItem({ contract, tokens, customBlockIds: ["a"], fromIndex: 0, toIndex: 3 }), tokens);
  assert.deepEqual(movePremiumTemplateCompositionItem({ contract, tokens, customBlockIds: ["a"], fromIndex: tokens.length - 1, toIndex: 0 }), tokens);
  const moved = movePremiumTemplateCompositionItem({ contract, tokens, customBlockIds: ["a"], fromIndex: 2, toIndex: 0 });
  assert.equal(moved[0], "native:future-template:header");
  assert.equal(moved[1], "native:future-template:about");
  assert.equal(moved.at(-1), "native:future-template:footer");
});

test("contract validation rejects duplicate section ids and anchors", () => {
  const invalid = { ...contract, nativeSections: [contract.nativeSections[0], { ...contract.nativeSections[1], id: "header", anchor: "header", defaultOrder: 4 }] };
  const errors = validatePremiumTemplateContract(invalid);
  assert.ok(errors.some((error) => error.includes("duplicate section id")));
  assert.ok(errors.some((error) => error.includes("duplicate anchor")));
  assert.throws(() => assertValidPremiumTemplateContract(invalid));
});

test("contract validation rejects duplicate default orders", () => {
  const invalid = {
    ...contract,
    nativeSections: contract.nativeSections.map((section) =>
      section.id === "about" ? { ...section, defaultOrder: 1 } : section),
  };
  assert.ok(validatePremiumTemplateContract(invalid).includes("duplicate defaultOrder 1"));
});

test("contract validation rejects invalid start and end pin boundaries", () => {
  const startOutsideBoundary = {
    ...contract,
    nativeSections: contract.nativeSections.map((section) =>
      section.id === "about" ? { ...section, pinning: "start" as const } : section),
  };
  const unpinnedAfterEnd = {
    ...contract,
    nativeSections: contract.nativeSections.map((section) =>
      section.id === "about" ? { ...section, defaultOrder: 4 } : section),
  };

  assert.ok(validatePremiumTemplateContract(startOutsideBoundary).includes(
    'start-pinned section "about" is outside the start boundary',
  ));
  assert.ok(validatePremiumTemplateContract(unpinnedAfterEnd).includes(
    'unpinned section "about" follows the end boundary',
  ));
});

test("registry validation accepts different valid template keys", () => {
  const otherContract = { ...contract, templateKey: "other-template" } as const;
  assert.deepEqual(validatePremiumTemplateContractRegistry([contract, otherContract]), []);
});

test("registry validation rejects duplicate template keys", () => {
  const duplicateContract = { ...contract };
  assert.deepEqual(validatePremiumTemplateContractRegistry([contract, duplicateContract]), [
    'duplicate templateKey "future-template" at contract[1]',
  ]);
});

test("registry validation surfaces invalid individual contracts deterministically", () => {
  const invalidContract = { ...contract, templateKey: "Invalid Template" };
  const contracts = [contract, invalidContract] as const;
  const expected = [
    'contract[1] "Invalid Template": templateKey must be a non-empty canonical identifier',
  ];

  assert.deepEqual(validatePremiumTemplateContractRegistry(contracts), expected);
  assert.deepEqual(validatePremiumTemplateContractRegistry(contracts), expected);
});

test("template-owned hooks can preserve unknown forward-compatible content", () => {
  type Root = { template_content: Record<string, unknown>; marker: string };
  type Owned = { title?: string; [key: string]: unknown };
  const hooks: PremiumTemplateContentHooks<Root, Owned, "work"> = {
    resolve: (root) => root.template_content[contract.templateKey] as Owned,
    write: (root, value) => ({ ...root, template_content: { ...root.template_content, [contract.templateKey]: { ...value } } }),
    reset: (root) => root,
  };
  const unknown = { nested: { future: true } };
  const root: Root = { marker: "keep", template_content: { other: unknown, [contract.templateKey]: { title: "Old", futureField: unknown } } };
  const next = hooks.write(root, { ...hooks.resolve(root), title: "New" });
  assert.strictEqual(next.template_content.other, unknown);
  assert.strictEqual((next.template_content[contract.templateKey] as Owned).futureField, unknown);
  assert.deepEqual(root.template_content[contract.templateKey], { title: "Old", futureField: unknown });
});
