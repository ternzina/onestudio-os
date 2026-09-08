import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { setDeep } from "@puckeditor/core";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import {
  productionPropertiesContract,
  productionPropertiesContractForManualPanel,
  resetProductionEditorBlock,
} from "../lib/puck-site-editor/builder-properties.ts";
import type { ProductionEditorValue } from "../lib/puck-site-editor/builder-contract.ts";
import { buildNativePuckFields } from "../lib/puck-site-editor/native-puck-fields.ts";
import { createPuckDocument, validatePuckDocument } from "../lib/puck-site-editor/document.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";
import { ProductionColorInput, renderProductionColorInput } from "../components/puck-site-editor/production-color-field.ts";

const hero14 = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!;
const hero6 = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch7_hero_6")!;

function propsOf(entry: typeof hero14) {
  return structuredClone(entry.defaults) as Record<string, unknown>;
}

test("Hero 14 keeps its native heading in CONTENT and only its verified Background field", () => {
  const native = buildNativePuckFields(hero14);
  assert.deepEqual(Object.keys(native), ["headingLine1", "backgroundColor"]);
  assert.equal(native.backgroundColor.type, "custom");
  assert.equal(native.textColor, undefined);
  assert.equal(native.headingLine1.type, "text");
  assert.equal(native.headingLine1.label, "Heading line 1");
  assert.equal("onChange" in native.headingLine1, false, "Puck owns native field onChange");

  const canonical = productionPropertiesContract(hero14.id, hero14.editorContract, hero14.defaults, hero14.backgroundCapability, hero14.textColorCapability);
  assert.deepEqual(canonical.nativePuck?.fields, ["backgroundColor", "headingLine1"]);
  const manualPanel = productionPropertiesContractForManualPanel(canonical);
  assert.equal(manualPanel.fields.some((field) => field.key === "backgroundColor"), false);
  assert.equal(manualPanel.fields.some((field) => field.key === "textColor"), false);
  assert.equal(manualPanel.fields.some((field) => field.key === "headingLine1"), false);
  assert.equal(manualPanel.inlineFields.some((field) => field.fieldKey === "headingLine1"), false);
});

test("Hero 6 keeps one bounded native array and its verified Background field", () => {
  const native = buildNativePuckFields(hero6);
  assert.deepEqual(Object.keys(native), ["backgroundColor", "slides"]);
  assert.equal(native.backgroundColor.type, "custom");
  assert.equal(native.textColor, undefined);
  assert.equal(native.slides.type, "array");
  if (native.slides.type !== "array") throw new Error("Expected native slides array");
  assert.equal(native.slides.max, 3);
  assert.deepEqual(Object.keys(native.slides.arrayFields), ["title", "subtitle", "description", "image"]);
  assert.equal(native.slides.arrayFields.title.type, "text");
  assert.equal(native.slides.arrayFields.subtitle.type, "text");
  assert.equal(native.slides.arrayFields.description.type, "textarea");
  assert.equal(native.slides.arrayFields.image.type, "text");
  assert.equal("onChange" in native.slides, false, "Puck owns native array onChange");
  const hero6DefaultSlides = hero6.defaults.slides as readonly Record<string, unknown>[];
  assert.deepEqual(native.slides.defaultItemProps?.(0), hero6DefaultSlides[0]);
  assert.notEqual(native.slides.defaultItemProps?.(0), hero6DefaultSlides[0]);

  const canonical = productionPropertiesContract(hero6.id, hero6.editorContract, hero6.defaults, hero6.backgroundCapability, hero6.textColorCapability);
  assert.deepEqual(canonical.nativePuck?.fields, ["backgroundColor"]);
  const manualPanel = productionPropertiesContractForManualPanel(canonical);
  assert.equal(manualPanel.fields.some((field) => field.key === "backgroundColor"), false);
  assert.equal(manualPanel.fields.some((field) => field.key === "textColor"), false);
  assert.deepEqual(manualPanel.arrays, []);
});

test("N2 generates native color fields only for declared capabilities", () => {
  const matrix = [
    PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!,
    PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch10_liquid_ascii")!,
    PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_hero_16")!,
  ];

  assert.equal(matrix[0].editorContract !== undefined, true);
  assert.equal(matrix[1].editorContract, undefined);
  assert.equal(matrix[2].editorContract !== undefined, true);
  assert.deepEqual(matrix[2].backgroundCapability, { supported: true, target: "sourceRoot" });

  for (const entry of matrix) {
    const native = buildNativePuckFields(entry);
    const colorKeys = Object.keys(native).filter((key) => key === "backgroundColor" || key === "textColor");
    assert.deepEqual(colorKeys, ["backgroundColor"], entry.id);
    for (const key of colorKeys) {
      const field = native[key];
      assert.equal(field.type, "custom", `${entry.id}.${key} should use Puck custom field`);
      if (field.type !== "custom") continue;
      const changes: unknown[] = [];
      const rendered = field.render({
        field,
        name: key,
        id: `${entry.id}-${key}`,
        value: entry.defaults[key],
        onChange: (value) => changes.push(value),
      });
      assert.equal(rendered.type, ProductionColorInput, `${entry.id}.${key} should resolve to ProductionColorInput`);
      const picker = renderProductionColorInput(rendered.props as unknown as Parameters<typeof renderProductionColorInput>[0]);
      const inputControl = (picker.props as { children: [unknown, { props: { children: { props: { onChange: (event: { currentTarget: { value: string } }) => void } } } }] }).children[1].props.children;
      inputControl.props.onChange({ currentTarget: { value: "#123456" } });
      assert.deepEqual(changes, ["#123456"], `${entry.id}.${key} should pass selection to native Puck onChange`);
    }

    const canonical = productionPropertiesContract(entry.id, entry.editorContract, entry.defaults, entry.backgroundCapability, entry.textColorCapability);
    const manualPanel = productionPropertiesContractForManualPanel(canonical);
    assert.equal(manualPanel.fields.some((field) => field.key === "backgroundColor"), false, entry.id);
    assert.equal(manualPanel.fields.some((field) => field.key === "textColor"), false, entry.id);
  }
});

test("N2 does not create fields for unsupported CSS-looking common props", () => {
  const entry = {
    id: "test.unsupported-colors",
    editorContract: undefined,
    props: {},
    defaults: {
      backgroundColor: "var(--surface)",
      textColor: "linear-gradient(red, blue)",
    },
  } as const;
  const native = buildNativePuckFields(entry);
  assert.deepEqual(Object.keys(native), []);

  const canonical = productionPropertiesContract(entry.id, entry.editorContract, entry.defaults);
  const edited = setDeep(entry.defaults, "backgroundColor", "#123456") as Record<string, ProductionEditorValue>;
  const reset = resetProductionEditorBlock(edited, canonical);
  assert.equal(reset.backgroundColor, "#123456");
  assert.equal(reset.textColor, "linear-gradient(red, blue)");
});

test("native Puck edit paths update data, preserve serialization and IDs, and reset exact originals", () => {
  const hero14Props = propsOf(hero14);
  const hero14Edited = setDeep(
    setDeep(hero14Props, "headingLine1", "Native heading edit"),
    "backgroundColor",
    "#123456",
  );
  const hero6Props = propsOf(hero6);
  const hero6Edited = setDeep(hero6Props, "slides[0].title", "Native slide edit");
  const hero6EditedWithImage = setDeep(hero6Edited, "slides[0].image", "/media/native-hero-6.webp");
  const document = createPuckDocument({
    pageId: "native-convergence",
    locale: "en",
    content: [
      { type: hero14.id, props: { id: "hero14-persisted", ...hero14Props } },
      { type: hero6.id, props: { id: "RB_batch7_hero_6", ...hero6Props } },
    ],
  });

  const edited = {
    ...document,
    content: [
      { type: hero14.id, props: { id: "hero14-persisted", ...hero14Edited } },
      { type: hero6.id, props: { id: "RB_batch7_hero_6", ...hero6EditedWithImage } },
    ],
  };
  assert.equal(validatePuckDocument(edited).ok, true);
  const reloaded = puckDataToDocument(puckDocumentToData(edited), {
    pageId: "native-convergence",
    locale: "en",
  });
  assert.equal(reloaded.content[0].props.headingLine1, "Native heading edit");
  assert.equal(reloaded.content[0].props.backgroundColor, "#123456");
  assert.equal((reloaded.content[1].props.slides as Array<Record<string, unknown>>)[0].title, "Native slide edit");
  assert.equal((reloaded.content[1].props.slides as Array<Record<string, unknown>>)[0].image, "/media/native-hero-6.webp");
  assert.deepEqual(reloaded.content.map((component) => component.props.id), ["hero14-persisted", "RB_batch7_hero_6"]);

  const reset14 = resetProductionEditorBlock(
    reloaded.content[0].props as unknown as Record<string, ProductionEditorValue>,
    productionPropertiesContract(hero14.id, hero14.editorContract, hero14.defaults, hero14.backgroundCapability, hero14.textColorCapability),
  );
  const reset6 = resetProductionEditorBlock(
    reloaded.content[1].props as unknown as Record<string, ProductionEditorValue>,
    productionPropertiesContract(hero6.id, hero6.editorContract, hero6.defaults, hero6.backgroundCapability, hero6.textColorCapability),
  );
  const { id: reset14Id, ...reset14Defaults } = reset14;
  const { id: reset6Id, ...reset6Defaults } = reset6;
  assert.equal(reset14Id, "hero14-persisted");
  assert.equal(reset6Id, "RB_batch7_hero_6");
  assert.deepEqual(reset14Defaults, hero14.defaults);
  assert.deepEqual(reset6Defaults, hero6.defaults);
});

test("N1 keeps the production registry at 280 and the official Hero 6 source untouched", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(hero6.physicalSource, "@/components/blocks/hero-6");
  execFileSync("git", ["diff", "--quiet", "--", "components/blocks/hero-6.tsx"]);
});
