import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import path from "node:path";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
  type PuckProductionBackgroundCapability,
} from "../lib/puck-site-editor/registry-manifest.ts";
import type { ProductionEditorValue } from "../lib/puck-site-editor/builder-contract.ts";
import {
  resolvePuckProductionBackgroundRouting,
  resolvePuckProductionSourceProps,
} from "../lib/puck-site-editor/production-background.ts";
import { buildNativePuckFields } from "../lib/puck-site-editor/native-puck-fields.ts";
import {
  productionPropertiesContract,
  productionPropertiesContractForManualPanel,
  PRODUCTION_SHARED_STYLE_FIELD_META,
  resetProductionEditorBlock,
} from "../lib/puck-site-editor/builder-properties.ts";
import { ProductionColorInput } from "../components/puck-site-editor/production-color-field.ts";
import { createPuckDocument } from "../lib/puck-site-editor/document.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";
import { translateAdminText } from "../lib/i18n/admin.ts";

const root = path.resolve(import.meta.dirname, "..");

const matrix = [
  { catalogKey: "control-3:blur-highlight", id: "RB_control3_blur_highlight", target: "none", textColor: false },
  { catalogKey: "component:liquid-ascii", id: "RB_batch10_liquid_ascii", target: "sourceProp", textColor: false },
  { catalogKey: "control-3:empty-state-3", id: "RB_control3_empty_state_3", target: "none", textColor: false },
  { catalogKey: "pro-block:hero-16", id: "RB_hero_16", target: "sourceRoot", textColor: false },
  { catalogKey: "control-6:text-scatter-tw", id: "RB_control6_text_scatter", target: "none", textColor: false },
] as const;

const entryFor = (catalogKey: string) => PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === catalogKey)!;

test("N3 manifest distinguishes verified background targets from unsupported common props", () => {
  assert.deepEqual(matrix.map(({ catalogKey }) => entryFor(catalogKey).id), matrix.map(({ id }) => id));
  assert.deepEqual(matrix.map(({ catalogKey }) => entryFor(catalogKey).backgroundCapability.target), matrix.map(({ target }) => target));
  assert.deepEqual(matrix.map(({ catalogKey }) => {
    const entry = entryFor(catalogKey);
    return { label: entry.label, catalogKey: entry.catalogKey, id: entry.id, renderer: entry.rendererSource };
  }), [
    { label: "Blur Highlight", catalogKey: "control-3:blur-highlight", id: "RB_control3_blur_highlight", renderer: "@/components/puck-site-editor/adapted-library/blur-highlight" },
    { label: "Liquid Ascii", catalogKey: "component:liquid-ascii", id: "RB_batch10_liquid_ascii", renderer: "@/components/react-bits/liquid-ascii" },
    { label: "Empty State 3", catalogKey: "control-3:empty-state-3", id: "RB_control3_empty_state_3", renderer: "@/components/blocks/empty-state-3" },
    { label: "Hero 16", catalogKey: "pro-block:hero-16", id: "RB_hero_16", renderer: "@/components/puck-site-editor/adapted-library/hero/hero-16" },
    { label: "Text Scatter", catalogKey: "control-6:text-scatter-tw", id: "RB_control6_text_scatter", renderer: "@/components/react-bits/text-scatter" },
  ]);
  assert.deepEqual(entryFor("component:liquid-ascii").backgroundCapability, {
    supported: true,
    target: "sourceProp",
    prop: "backgroundColor",
  });
  assert.deepEqual(entryFor("control-3:empty-state-3").backgroundCapability, { supported: false, target: "none" });
  assert.deepEqual(entryFor("control-6:text-scatter-tw").backgroundCapability, { supported: false, target: "none" });
});

test("N3 distinguishes actual surfaces from accent and source APIs", () => {
  const emptyStateSource = fs.readFileSync(path.join(root, "components/blocks/empty-state-3.tsx"), "utf8");
  assert.match(emptyStateSource, /bg-\[var\(--rb-accent/);
  assert.match(emptyStateSource, /bg-white/);
  assert.match(emptyStateSource, /dark:bg-neutral-950/);
  assert.deepEqual(entryFor("control-3:empty-state-3").backgroundCapability, { supported: false, target: "none" });

  const textScatterSource = fs.readFileSync(path.join(root, "components/react-bits/text-scatter.tsx"), "utf8");
  assert.match(textScatterSource, /text\?: string/);
  assert.doesNotMatch(textScatterSource, /backgroundColor\?/);
  const textScatter = entryFor("control-6:text-scatter-tw");
  const textScatterFields = buildNativePuckFields(textScatter);
  assert.equal(textScatterFields.backgroundColor, undefined);
  assert.equal(textScatterFields.textColor, undefined);
  assert.equal(buildNativePuckFields(entryFor("control-3:empty-state-3")).textColor, undefined);
});

test("source color fields are inferred only from declared generated source props", () => {
  const sourceTextEntry = [...PUCK_PRODUCTION_MANIFEST_BY_ID.values()].find((entry) => entry.sourcePropKeys.includes("textColor"));
  assert.ok(sourceTextEntry);
  assert.deepEqual(sourceTextEntry.textColorCapability, { supported: true, target: "sourceProp", prop: "textColor" });
  assert.equal(buildNativePuckFields(sourceTextEntry).textColor.type, "custom");
  assert.equal(entryFor("pro-block:hero-13").textColorCapability.supported, false);
});

test("native shared color fields expose distinct semantic labels", () => {
  assert.equal(PRODUCTION_SHARED_STYLE_FIELD_META.backgroundColor.label, "Background");
  assert.equal(PRODUCTION_SHARED_STYLE_FIELD_META.textColor.label, "Text color");
  assert.notEqual(PRODUCTION_SHARED_STYLE_FIELD_META.backgroundColor.label, PRODUCTION_SHARED_STYLE_FIELD_META.textColor.label);
  assert.equal(translateAdminText("ru", PRODUCTION_SHARED_STYLE_FIELD_META.backgroundColor.label), "Фон");
  assert.equal(translateAdminText("ru", PRODUCTION_SHARED_STYLE_FIELD_META.textColor.label), "Цвет текста");
});

test("N3 native field generation is capability-aware and never duplicates Background", () => {
  for (const representative of matrix) {
    const entry = entryFor(representative.catalogKey);
    const native = buildNativePuckFields(entry);
    const backgroundKeys = Object.keys(native).filter((key) => key === "backgroundColor");
    assert.equal(backgroundKeys.length, representative.target === "none" ? 0 : 1, representative.id);
    assert.equal(Object.keys(native).filter((key) => key === "textColor").length, representative.textColor ? 1 : 0, representative.id);

    const canonical = productionPropertiesContract(entry.id, entry.editorContract, entry.defaults, entry.backgroundCapability, entry.textColorCapability);
    const manual = productionPropertiesContractForManualPanel(canonical);
    assert.equal(manual.fields.some((field) => field.key === "backgroundColor"), false, representative.id);
    if (representative.target !== "none") {
      assert.equal(native.backgroundColor.type, "custom", representative.id);
      if (representative.textColor) assert.equal(native.textColor.type, "custom", representative.id);
      if (native.backgroundColor.type === "custom") {
        const rendered = native.backgroundColor.render({
          field: native.backgroundColor,
          name: "backgroundColor",
          id: `${representative.id}-background`,
          value: entry.defaults.backgroundColor,
          onChange: () => undefined,
        });
        assert.equal(rendered.type, ProductionColorInput, representative.id);
      }
    }
  }
});

test("N3 routing applies each supported value to only its declared target", () => {
  const wrapper = resolvePuckProductionBackgroundRouting(
    { supported: true, target: "wrapper" },
    "#123456",
    "#ffffff",
  );
  assert.deepEqual(wrapper, { target: "wrapper", edited: true, wrapper: "#123456" });

  const sourceProp = resolvePuckProductionBackgroundRouting(
    { supported: true, target: "sourceProp", prop: "backgroundColor" },
    "#123456",
    "#000000",
  );
  assert.deepEqual(sourceProp.sourceProp, { prop: "backgroundColor", value: "#123456" });
  assert.deepEqual(resolvePuckProductionSourceProps(
    { backgroundColor: "#123456", title: "kept", surfaceColor: "not-selected" },
    ["title", "surfaceColor"],
    resolvePuckProductionBackgroundRouting(
      { supported: true, target: "sourceProp", prop: "surfaceColor" },
      "#123456",
      "#ffffff",
    ),
  ), { title: "kept", surfaceColor: "#123456" });

  const cssVariable = resolvePuckProductionBackgroundRouting(
    { supported: true, target: "cssVariable", name: "--rb-accent" },
    "#123456",
    "#ffffff",
  );
  assert.deepEqual(cssVariable.cssVariable, { name: "--rb-accent", value: "#123456" });
  assert.equal("wrapper" in cssVariable, false);
  assert.equal("sourceRoot" in cssVariable, false);

  const sourceRoot = resolvePuckProductionBackgroundRouting(
    { supported: true, target: "sourceRoot" },
    "#123456",
    "#ffffff",
  );
  assert.equal(sourceRoot.sourceRoot, "#123456");
  assert.equal("wrapper" in sourceRoot, false);

  const none = resolvePuckProductionBackgroundRouting(
    { supported: false, target: "none" },
    "#123456",
    "#ffffff",
  );
  assert.deepEqual(none, { target: "none", edited: false });
});

test("N3 preserves N1/N2 native ownership, persisted IDs, and registry count", () => {
  const hero14 = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!;
  const hero6 = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch7_hero_6")!;
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(hero14.editorContract?.nativePuck?.fields?.includes("headingLine1"), true);
  assert.equal(hero6.editorContract?.nativePuck?.arrays?.includes("slides"), true);
  assert.equal(hero14.id, "reactbits.hero-14");
  assert.equal(hero6.id, "RB_batch7_hero_6");
  assert.equal(entryFor("pro-block:hero-16").id, "RB_hero_16");
});

test("N3 target types remain serializable contract data", () => {
  const capabilities: PuckProductionBackgroundCapability[] = matrix.map(({ catalogKey }) => entryFor(catalogKey).backgroundCapability);
  assert.equal(JSON.parse(JSON.stringify(capabilities)).length, 5);
});

test("N3 Background values survive serialization/reload and Reset Original", () => {
  const supportedEntries = matrix
    .filter(({ target }) => target !== "none")
    .map(({ catalogKey }) => entryFor(catalogKey));
  const document = createPuckDocument({
    pageId: "n3-background-targets",
    locale: "en",
    content: supportedEntries.map((entry, index) => ({
      type: entry.id,
      props: { id: `n3-${index + 1}`, ...entry.defaults, backgroundColor: "#123456" },
    })),
  });
  const reloaded = puckDataToDocument(puckDocumentToData(document), {
    pageId: "n3-background-targets",
    locale: "en",
  });

  assert.deepEqual(reloaded.content.map((component) => component.props.backgroundColor), supportedEntries.map(() => "#123456"));
  assert.deepEqual(reloaded.content.map((component) => component.props.id), ["n3-1", "n3-2"]);
  for (const [index, entry] of supportedEntries.entries()) {
    const canonical = productionPropertiesContract(entry.id, entry.editorContract, entry.defaults, entry.backgroundCapability);
    const reset = resetProductionEditorBlock(
      reloaded.content[index].props as unknown as Readonly<Record<string, ProductionEditorValue>>,
      canonical,
    );
    assert.equal(reset.backgroundColor, entry.defaults.backgroundColor, entry.id);
  }
});
