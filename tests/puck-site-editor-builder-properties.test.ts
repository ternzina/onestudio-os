import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  filterProductionEditorContract,
  productionFieldsByGroup,
  productionNativeFieldGroup,
  PRODUCTION_PROPERTIES_GROUP_LABELS,
  productionPropertiesContract,
  resetProductionEditorBlock,
  resetProductionEditorField,
  resetProductionEditorGroup,
  updateProductionEditorArrayItem,
  updateProductionEditorField,
} from "../lib/puck-site-editor/builder-properties.ts";
import {
  normalizeProductionColorPickerValue,
  ProductionColorInput,
  renderProductionColorInput,
} from "../components/puck-site-editor/production-color-field.ts";
import { PUCK_PRODUCTION_MANIFEST_BY_ID } from "../lib/puck-site-editor/registry-manifest.ts";
import type { ComponentEditorContract, ProductionEditorValue } from "../lib/puck-site-editor/builder-contract.ts";
import { createPuckDocument } from "../lib/puck-site-editor/document.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";
import { ProductionEditorLocaleContext } from "../components/puck-site-editor/production-editor-locale.ts";

const root = path.resolve(import.meta.dirname, "..");
const hero = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!;
const contract = hero.editorContract!;
const heroProps = hero.defaults as Record<string, ProductionEditorValue>;
const hero6 = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch7_hero_6")!;
const hero6Contract = hero6.editorContract!;
const hero6Props = hero6.defaults as Record<string, ProductionEditorValue>;
const emptyState = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_control3_empty_state_3")!;
const textScatter = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_control6_text_scatter")!;

test("production Properties uses the declared group ordering and Russian labels", () => {
  assert.deepEqual(productionFieldsByGroup(contract).map((group) => group.group), ["CONTENT", "MEDIA", "ACTIONS", "LAYOUT", "STYLE", "MOTION", "RESPONSIVE"]);
  assert.equal(PRODUCTION_PROPERTIES_GROUP_LABELS.CONTENT, "Содержание");
  assert.equal(PRODUCTION_PROPERTIES_GROUP_LABELS.MEDIA, "Медиа");
  assert.equal(PRODUCTION_PROPERTIES_GROUP_LABELS.ACTIONS, "Кнопки и ссылки");
});

test("native Puck ownership resolves semantic groups from the canonical contract", () => {
  const effective = productionPropertiesContract(hero.id, contract, hero.defaults, hero.backgroundCapability, hero.textColorCapability);
  assert.equal(productionNativeFieldGroup(effective, "headingLine1"), "CONTENT");
  assert.equal(productionNativeFieldGroup(effective, "backgroundColor"), "STYLE");
  assert.equal(productionNativeFieldGroup(effective, "textColor"), undefined);
  assert.equal(productionNativeFieldGroup(effective, "headingLine2"), undefined);
});

test("visual style capability filtering removes unsupported colors without a component-specific panel branch", () => {
  const emptyContract = productionPropertiesContract(
    emptyState.id,
    emptyState.editorContract,
    emptyState.defaults,
    emptyState.backgroundCapability,
    emptyState.textColorCapability,
  );
  assert.deepEqual(emptyContract.fields.filter((field) => field.type === "color"), []);
  assert.deepEqual(emptyContract.nativePuck?.fields ?? [], []);

  const textScatterContract = productionPropertiesContract(
    textScatter.id,
    textScatter.editorContract,
    textScatter.defaults,
    textScatter.backgroundCapability,
    textScatter.textColorCapability,
  );
  assert.deepEqual(textScatterContract.fields.filter((field) => field.type === "color"), []);
  assert.deepEqual(textScatterContract.nativePuck?.fields ?? [], []);
});

test("shared production colors render as visual controls and safely normalize only picker input", () => {
  const effective = productionPropertiesContract(hero.id, contract, hero.defaults, hero.backgroundCapability, hero.textColorCapability);
  const styleFields = effective.fields.filter((field) => field.group === "STYLE");
  assert.deepEqual(styleFields.map((field) => field.key), ["backgroundColor"]);
  assert.deepEqual(styleFields.map((field) => field.type), ["color"]);

  const markup = renderToStaticMarkup(createElement(ProductionColorInput, {
    label: "Background",
    value: "#abc",
    onChange: () => undefined,
  }));
  assert.match(markup, /type="color"/);
  assert.match(markup, /value="?#aabbcc/);
  assert.match(markup, /data-production-color-label="Background"/);
  assert.doesNotMatch(markup, /type="number"/);

  const russianMarkup = renderToStaticMarkup(createElement(
    ProductionEditorLocaleContext.Provider,
    { value: "ru" },
    createElement(ProductionColorInput, { label: "Text color", value: "#123456", onChange: () => undefined }),
  ));
  assert.match(russianMarkup, /data-production-color-label="Цвет текста"/);

  let selectedColor = "";
  const input = renderProductionColorInput({ label: "Background", value: "#000000", onChange: (value) => { selectedColor = value; } });
  const inputControl = (input.props as { children: [unknown, { props: { children: { props: { onChange: (event: { currentTarget: { value: string } }) => void } } } }] }).children[1].props.children;
  inputControl.props.onChange({ currentTarget: { value: "#123456" } });
  assert.equal(selectedColor, "#123456");

  assert.equal(normalizeProductionColorPickerValue("#abc"), "#aabbcc");
  assert.equal(normalizeProductionColorPickerValue("var(--surface)"), "#000000");
  assert.equal(normalizeProductionColorPickerValue("transparent"), "#000000");
  assert.equal(normalizeProductionColorPickerValue("linear-gradient(red, blue)"), "#000000");
});

test("shared Background and color updates reach Puck data and reset to exact manifest originals", () => {
  const effective = productionPropertiesContract(hero.id, contract, hero.defaults, hero.backgroundCapability, hero.textColorCapability);
  const editedBackground = updateProductionEditorField(heroProps, effective, "backgroundColor", "#123456");
  assert.equal(editedBackground.backgroundColor, "#123456");

  const document = createPuckDocument({
    pageId: "shared-color-test",
    locale: "en",
    content: [{ type: hero.id, props: { id: "color-test", ...editedBackground } }],
  });
  const reloaded = puckDataToDocument(puckDocumentToData(document), { pageId: "shared-color-test", locale: "en" });
  assert.equal(reloaded.content[0].props.backgroundColor, "#123456");

  const reset = resetProductionEditorBlock(reloaded.content[0].props as Record<string, ProductionEditorValue>, effective);
  assert.equal(reset.backgroundColor, hero.defaults.backgroundColor);
});

test("source-backed Background is generated for Liquid Ascii without inventing Text color", () => {
  const uncontracted = [...PUCK_PRODUCTION_MANIFEST_BY_ID.values()].find((entry) => entry.catalogKey === "component:liquid-ascii")!;
  const effective = productionPropertiesContract(uncontracted.id, uncontracted.editorContract, uncontracted.defaults, uncontracted.backgroundCapability, uncontracted.textColorCapability);
  assert.deepEqual(effective.fields.filter((field) => field.group === "STYLE").map((field) => field.key), ["backgroundColor"]);
  assert.equal(uncontracted.sourcePropKeys.includes("backgroundColor"), true);
  assert.equal(uncontracted.defaults.backgroundColor, "#000000");
  assert.deepEqual(uncontracted.backgroundCapability, { supported: true, target: "sourceProp", prop: "backgroundColor" });
  assert.deepEqual(uncontracted.textColorCapability, { supported: false, target: "none" });

  for (const catalogKey of [
    "pro-block:hero-16",
    "pro-block:hero-17",
    "pro-block:hero-19",
    "pro-block:cta-8",
    "pro-block:cta-9",
    "pro-block:navigation-4",
    "pro-block:navigation-11",
    "pro-block:navigation-14",
  ]) {
    assert.deepEqual(
      [...PUCK_PRODUCTION_MANIFEST_BY_ID.values()].find((entry) => entry.catalogKey === catalogKey)?.backgroundCapability,
      { supported: true, target: "sourceRoot" },
      catalogKey,
    );
  }
});

test("missing canonical visual capability does not turn common host props into controls", () => {
  const effective = productionPropertiesContract("test.no-visual-capability", undefined, {
    backgroundColor: "#ffffff",
    textColor: "#171717",
  });
  assert.deepEqual(effective.fields.filter((field) => field.type === "color"), []);
  assert.deepEqual(effective.nativePuck?.fields ?? [], []);
  assert.equal(effective.defaultProps.backgroundColor, undefined);
  assert.equal(effective.defaultProps.textColor, undefined);
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

test("Hero 6 slide content and media use the shared grouped array editor", () => {
  const content = updateProductionEditorArrayItem(hero6Props, hero6Contract, "slides", 0, "title", "Edited Hero 6");
  const media = updateProductionEditorArrayItem(content, hero6Contract, "slides", 0, "image", "/media/hero-6.webp");
  assert.equal((media.slides as readonly Record<string, ProductionEditorValue>[])[0].title, "Edited Hero 6");
  assert.equal((media.slides as readonly Record<string, ProductionEditorValue>[])[0].image, "/media/hero-6.webp");
  assert.deepEqual(hero6Props, hero6.defaults);

  const visibleGroups = productionFieldsByGroup(hero6Contract)
    .filter((group) => group.fields.length + group.arrays.length > 0)
    .map((group) => group.group);
  assert.deepEqual(visibleGroups, ["CONTENT", "MEDIA"]);
  const mediaSearch = filterProductionEditorContract(hero6Contract, "медиа");
  assert.deepEqual(mediaSearch.arrays[0].itemFields.map((field) => field.key), ["image"]);
});

test("Hero 6 array resets restore exact canonical values", () => {
  const editedContent = updateProductionEditorArrayItem(hero6Props, hero6Contract, "slides", 0, "title", "Edited title");
  const edited = updateProductionEditorArrayItem(editedContent, hero6Contract, "slides", 0, "image", "/media/edited.webp");
  const contentReset = resetProductionEditorGroup(edited, hero6Contract, "CONTENT");
  assert.equal((contentReset.slides as readonly Record<string, ProductionEditorValue>[])[0].title, (hero6Props.slides as readonly Record<string, ProductionEditorValue>[])[0].title);
  assert.equal((contentReset.slides as readonly Record<string, ProductionEditorValue>[])[0].image, "/media/edited.webp");
  assert.deepEqual(resetProductionEditorBlock(edited, hero6Contract), hero6.defaults);
});

test("shared production renderer supports every approved primitive field type and keeps generic fallback", () => {
  const source = fs.readFileSync(path.join(root, "components/puck-site-editor/production-properties-panel.tsx"), "utf8");
  for (const type of ["textarea", "boolean", "number", "select", "url", "media", "text"]) assert.match(source, new RegExp(`field\\.type === ["']${type}["']`));
  assert.doesNotMatch(source, /ProductionColorInput/);
  assert.doesNotMatch(source, /field\\.type === ["']color["']/);
  assert.match(source, /data-production-generic-controls/);
  assert.match(source, /type: "setData"/);
  const editorConfig = fs.readFileSync(path.join(root, "components/puck-site-editor/editor-config.tsx"), "utf8");
  assert.match(editorConfig, /rule\.format === "color"/);
  assert.match(editorConfig, /type: "custom"/);
  assert.match(editorConfig, /ProductionColorInput/);
  assert.match(editorConfig, /contract\?\.arrays\.some/);
  const renderer = fs.readFileSync(path.join(root, "components/puck-site-editor/public-renderer.tsx"), "utf8");
  assert.match(renderer, /--puck-block-background/);
  assert.match(renderer, /backgroundRouting\.sourceRoot/);
  assert.match(renderer, /sourcePropKeys/);
  const rendererCss = fs.readFileSync(path.join(root, "components/puck-site-editor/public-renderer.module.css"), "utf8");
  assert.match(rendererCss, /sourceRootBackgroundBridge > \*/);
});

test("production Properties and its dependencies have no editor-lab import", () => {
  for (const file of [
    "components/puck-site-editor/production-properties-panel.tsx",
    "components/puck-site-editor/product-library-drawer.tsx",
    "lib/puck-site-editor/builder-properties.ts",
    "lib/puck-site-editor/builder-contract.ts",
  ]) assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /editor-lab/i, file);
});
