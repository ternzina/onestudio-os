import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  resetEditorBlock,
  resetEditorField,
  resetEditorGroup,
  validateComponentEditorContract,
  type ComponentEditorContract,
} from "../lib/puck-site-editor/builder-contract.ts";
import { PUCK_PRODUCTION_MANIFEST_BY_ID } from "../lib/puck-site-editor/registry-manifest.ts";

const root = path.resolve(import.meta.dirname, "..");

const field = (key: string) => ({
  key,
  path: [key] as [string],
  group: "CONTENT" as const,
  label: key,
  type: "text" as const,
  originalValue: "original",
  inlineEditable: true,
  mediaEligible: false,
  resettable: true,
});

const itemField = (key: string) => {
  const { originalValue: _, ...definition } = field(key);
  return definition;
};

const baseContract = (): ComponentEditorContract => ({
  componentId: "reactbits.example",
  defaultProps: { headline: "original", enabled: true, cards: [{ id: "one", title: "First" }] },
  fields: [field("headline")],
  contentFields: ["headline"],
  mediaFields: [],
  actionFields: [],
  arrays: [{
    key: "cards",
    path: ["cards"],
    group: "CONTENT",
    label: "Cards",
    itemLabel: "Card",
    identityKey: "id",
    defaultItems: [{ id: "one", title: "First" }],
    itemFields: [
      { ...itemField("id"), inlineEditable: false },
      itemField("title"),
    ],
  }],
  inlineFields: [{ fieldKey: "headline", path: ["headline"], valueType: "text" }],
});

test("production builder contract accepts bounded primitive, inline, and array schemas", () => {
  assert.deepEqual(validateComponentEditorContract(baseContract()), []);
});

test("production builder contract rejects unsafe values, duplicate keys, and invalid metadata", () => {
  const duplicate = baseContract();
  duplicate.fields = [field("headline"), field("headline")];
  assert.match(validateComponentEditorContract(duplicate).join("\n"), /duplicate field key/);

  const unsafe = baseContract();
  unsafe.defaultProps = { headline: Number.NaN };
  assert.match(validateComponentEditorContract(unsafe).join("\n"), /unsafe/);

  const invalid = baseContract();
  invalid.fields = [{ ...field("headline"), group: "UNKNOWN" as "CONTENT" }];
  assert.match(validateComponentEditorContract(invalid).join("\n"), /group: invalid/);
  invalid.inlineFields = [{ fieldKey: "missing", path: ["missing"], valueType: "text" }];
  assert.match(validateComponentEditorContract(invalid).join("\n"), /invalid inline target/);

  const invalidArray = baseContract();
  invalidArray.arrays = [{ ...invalidArray.arrays[0], itemFields: [{ ...itemField("title"), path: ["nested", "title"] }] }];
  assert.match(validateComponentEditorContract(invalidArray).join("\n"), /nested paths unsupported/);
});

test("reset calculation is deterministic and uses declared original defaults", () => {
  const contract = baseContract();
  const current = { headline: "edited", enabled: false, cards: [{ id: "one", title: "Changed" }] };
  assert.deepEqual(resetEditorField(current, contract, "headline"), { ...current, headline: "original" });
  assert.deepEqual(resetEditorGroup(current, contract, "CONTENT"), { ...current, headline: "original" });
  assert.deepEqual(resetEditorBlock(current, contract), { ...current, headline: "original" });
});

test("Hero 14 production metadata validates and preserves its adapted defaults", () => {
  const hero = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!;
  assert.ok(hero.editorContract);
  assert.deepEqual(validateComponentEditorContract(hero.editorContract!), []);
  assert.deepEqual(hero.editorContract!.defaultProps, {
    rating: hero.defaults.rating,
    reviews: hero.defaults.reviews,
    headingLine1: hero.defaults.headingLine1,
    headingLine2: hero.defaults.headingLine2,
    description: hero.defaults.description,
    emailPlaceholder: hero.defaults.emailPlaceholder,
    buttonLabel: hero.defaults.buttonLabel,
    linkLabel: hero.defaults.linkLabel,
    mediaUrl: hero.defaults.mediaUrl,
  });
});

test("production builder contract has no editor-lab dependency", () => {
  const source = fs.readFileSync(path.join(root, "lib/puck-site-editor/builder-contract.ts"), "utf8");
  assert.doesNotMatch(source, /editor-lab/i);
});
