import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  filterProductionEditorContract,
  productionFieldsByGroup,
  PRODUCTION_PROPERTIES_GROUP_LABELS,
  resetProductionEditorBlock,
  resetProductionEditorField,
  resetProductionEditorGroup,
  updateProductionEditorArrayItem,
  updateProductionEditorField,
} from "../lib/puck-site-editor/builder-properties.ts";
import { PUCK_PRODUCTION_MANIFEST_BY_ID } from "../lib/puck-site-editor/registry-manifest.ts";
import type { ComponentEditorContract, ProductionEditorValue } from "../lib/puck-site-editor/builder-contract.ts";

const root = path.resolve(import.meta.dirname, "..");
const hero = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!;
const contract = hero.editorContract!;
const heroProps = hero.defaults as Record<string, ProductionEditorValue>;

test("production Properties uses the declared group ordering and Russian labels", () => {
  assert.deepEqual(productionFieldsByGroup(contract).map((group) => group.group), ["CONTENT", "MEDIA", "ACTIONS", "LAYOUT", "STYLE", "MOTION", "RESPONSIVE"]);
  assert.equal(PRODUCTION_PROPERTIES_GROUP_LABELS.CONTENT, "Содержание");
  assert.equal(PRODUCTION_PROPERTIES_GROUP_LABELS.MEDIA, "Медиа");
  assert.equal(PRODUCTION_PROPERTIES_GROUP_LABELS.ACTIONS, "Кнопки и ссылки");
});

test("Hero 14 contract fields update the one serializable Puck props record", () => {
  const content = updateProductionEditorField(heroProps, contract, "headingLine1", "Edited heading");
  const action = updateProductionEditorField(content, contract, "buttonLabel", "Start now");
  const media = updateProductionEditorField(action, contract, "mediaUrl", "/media/hero.webp");
  assert.equal(media.headingLine1, "Edited heading");
  assert.equal(media.buttonLabel, "Start now");
  assert.equal(media.mediaUrl, "/media/hero.webp");
  assert.deepEqual(heroProps, hero.defaults);
});

test("production reset actions use original metadata defaults", () => {
  const edited = updateProductionEditorField(heroProps, contract, "headingLine1", "Edited heading");
  assert.equal(resetProductionEditorField(edited, contract, "headingLine1").headingLine1, hero.defaults.headingLine1);
  assert.equal(resetProductionEditorGroup(edited, contract, "CONTENT").headingLine1, hero.defaults.headingLine1);
  assert.equal(resetProductionEditorBlock(edited, contract).headingLine1, hero.defaults.headingLine1);
});

test("search filters contract labels and groups without changing content state", () => {
  const media = filterProductionEditorContract(contract, "медиа");
  assert.deepEqual(media.fields.map((field) => field.key), ["mediaUrl"]);
  const button = filterProductionEditorContract(contract, "button");
  assert.deepEqual(button.fields.map((field) => field.key), ["buttonLabel"]);
});

test("bounded array item updates are supported without an arbitrary JSON editor", () => {
  const arrayContract: ComponentEditorContract = {
    componentId: "reactbits.array-example",
    defaultProps: { cards: [{ id: "one", title: "Original" }] },
    fields: [], contentFields: [], mediaFields: [], actionFields: [], inlineFields: [],
    arrays: [{
      key: "cards", path: ["cards"], group: "CONTENT", label: "Cards", itemLabel: "Card", identityKey: "id",
      defaultItems: [{ id: "one", title: "Original" }],
      itemFields: [
        { key: "id", path: ["id"], group: "CONTENT", label: "ID", type: "text", inlineEditable: false, mediaEligible: false, resettable: false },
        { key: "title", path: ["title"], group: "CONTENT", label: "Title", type: "text", inlineEditable: true, mediaEligible: false, resettable: true },
      ],
    }],
  };
  assert.deepEqual(updateProductionEditorArrayItem(arrayContract.defaultProps, arrayContract, "cards", 0, "title", "Edited"), { cards: [{ id: "one", title: "Edited" }] });
});

test("shared production renderer supports every approved primitive field type and keeps generic fallback", () => {
  const source = fs.readFileSync(path.join(root, "components/puck-site-editor/production-properties-panel.tsx"), "utf8");
  for (const type of ["textarea", "boolean", "number", "select", "color", "url", "media", "text"]) assert.match(source, new RegExp(`field\\.type === ["']${type}["']`));
  assert.match(source, /data-production-generic-controls/);
  assert.match(source, /type: "setData"/);
});

test("production Properties and its dependencies have no editor-lab import", () => {
  for (const file of [
    "components/puck-site-editor/production-properties-panel.tsx",
    "components/puck-site-editor/product-library-drawer.tsx",
    "lib/puck-site-editor/builder-properties.ts",
    "lib/puck-site-editor/builder-contract.ts",
  ]) assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /editor-lab/i, file);
});
