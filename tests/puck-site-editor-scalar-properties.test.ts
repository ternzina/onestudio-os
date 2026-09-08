import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { buildNativePuckFields } from "../lib/puck-site-editor/native-puck-fields.ts";
import {
  createPuckDocument,
  assertPuckDocument,
} from "../lib/puck-site-editor/document.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { resolvePuckProductionSourceProps } from "../lib/puck-site-editor/production-background.ts";
import { isProductionColor, productionColorToPickerHex } from "../lib/puck-site-editor/production-color.ts";
import { resolvePuckProductionFieldValue, resolvePuckProductionProps } from "../lib/puck-site-editor/production-props.ts";
import { createProductionPuckScalarField, parseProductionNumberInput } from "../components/puck-site-editor/production-puck-scalar-field.ts";
import { humanizePuckFieldKey, labelForPuckRule } from "../components/puck-site-editor/editor-config-labels.ts";

const glow = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.glow-cursor")!;
const hero = PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.hero-14")!;

function component(entry: typeof glow | typeof hero, overrides: Record<string, unknown> = {}) {
  return {
    type: entry.id,
    props: {
      id: `${entry.id.replace(/[^a-z0-9]/gi, "-")}-test`,
      ...structuredClone(entry.defaults),
      ...overrides,
    },
  };
}

function documentWith(entry: typeof glow | typeof hero, overrides: Record<string, unknown> = {}) {
  return createPuckDocument({
    pageId: "scalar-roundtrip",
    locale: "en",
    content: [component(entry, overrides)],
  });
}

test("string roundtrip preserves edits and an explicitly empty string", () => {
  const edited = documentWith(hero, { headingLine1: "Edited heading" });
  assert.equal(edited.content[0].props.headingLine1, "Edited heading");
  assert.equal(resolvePuckProductionFieldValue(edited.content[0].props, hero.defaults, ["headingLine1"]), "Edited heading");

  const empty = documentWith(hero, { headingLine1: "" });
  assert.equal(resolvePuckProductionFieldValue(empty.content[0].props, hero.defaults, ["headingLine1"]), "");
  assert.equal(resolvePuckProductionSourceProps(
    resolvePuckProductionProps(hero.defaults, empty.content[0].props),
    hero.sourcePropKeys,
    { target: "none", edited: false },
  ).headingLine1, "");
});

test("number roundtrip preserves number type, range metadata, zero, and blank drafts", () => {
  const rule = glow.props.trailLength;
  assert.equal(rule.kind, "number");
  if (rule.kind !== "number") return;
  assert.deepEqual({ min: rule.min, max: rule.max, step: rule.step }, { min: 2, max: 64, step: 1 });
  assert.equal(parseProductionNumberInput("", rule.min, rule.max), undefined);
  assert.equal(parseProductionNumberInput("0", 0, 1), 0);

  const roundtripped = assertPuckDocument(JSON.parse(JSON.stringify(documentWith(glow, { trailLength: 24, opacity: 0 }))));
  assert.equal(roundtripped.content[0].props.trailLength, 24);
  assert.equal(typeof roundtripped.content[0].props.trailLength, "number");
  assert.equal(roundtripped.content[0].props.opacity, 0);
});

test("boolean false is stored and retained through reselect-style resolution", () => {
  const stored = documentWith(glow, { idleFade: false });
  const props = stored.content[0].props;
  assert.equal(props.idleFade, false);
  assert.equal(resolvePuckProductionFieldValue(props, glow.defaults, ["idleFade"]), false);
  assert.equal(resolvePuckProductionProps(glow.defaults, props).idleFade, false);
});

test("select options remain metadata while a legacy value survives without a crash", () => {
  const rule = glow.props.blendMode;
  assert.equal(rule.kind, "enum");
  if (rule.kind !== "enum") return;
  assert.deepEqual(rule.values, ["screen", "normal", "plus-lighter"]);
  const legacy = documentWith(glow, { blendMode: "legacy-mode" });
  assert.equal(assertPuckDocument(JSON.parse(JSON.stringify(legacy))).content[0].props.blendMode, "legacy-mode");
});

test("shared color field accepts valid hex/rgb and preserves the edited value", () => {
  assert.equal(isProductionColor("#123456"), true);
  assert.equal(isProductionColor("rgb(18, 52, 86)"), true);
  assert.equal(productionColorToPickerHex("rgb(18, 52, 86)"), "#123456");
  const stored = documentWith(glow, { color: "rgb(18, 52, 86)" });
  const reselected = assertPuckDocument(JSON.parse(JSON.stringify(stored)));
  assert.equal(reselected.content[0].props.color, "rgb(18, 52, 86)");
  assert.equal(resolvePuckProductionSourceProps(
    resolvePuckProductionProps(glow.defaults, reselected.content[0].props),
    glow.sourcePropKeys,
    { target: "none", edited: false },
  ).color, "rgb(18, 52, 86)");
});

test("stored props beat defaults for false, zero, and empty string", () => {
  const defaults = { text: "default", count: 1, enabled: true };
  const stored = { text: "", count: 0, enabled: false };
  assert.deepEqual(resolvePuckProductionProps(defaults, stored), stored);
  assert.equal(resolvePuckProductionFieldValue(stored, defaults, ["text"]), "");
  assert.equal(resolvePuckProductionFieldValue(stored, defaults, ["count"]), 0);
  assert.equal(resolvePuckProductionFieldValue(stored, defaults, ["enabled"]), false);
  assert.equal(resolvePuckProductionFieldValue({}, defaults, ["text"]), "default");
});

test("authoring and public source props share normalization and metadata does not mutate Puck data", () => {
  const props = { ...component(glow).props, color: "#123456", puck: { dragRef: true }, editMode: true };
  const before = structuredClone(props);
  const resolved = resolvePuckProductionProps(glow.defaults, props);
  const routing = { target: "none" as const, edited: false };
  const authoring = resolvePuckProductionSourceProps(resolved, glow.sourcePropKeys, routing);
  const publicProps = resolvePuckProductionSourceProps(resolved, glow.sourcePropKeys, routing);
  assert.deepEqual(authoring, publicProps);
  assert.equal("puck" in authoring, false);
  assert.equal("editMode" in authoring, false);
  assert.deepEqual(props, before);
});

test("native Puck ownership keeps the shared color field and native text lifecycle", () => {
  const fields = buildNativePuckFields(hero);
  assert.equal(fields.headingLine1.type, "text");
  assert.equal(fields.backgroundColor.type, "custom");
  assert.equal(typeof fields.backgroundColor.render, "function");
});

test("Puck scalar field UI resolves defaults only for absent values", () => {
  const textField = createProductionPuckScalarField({ label: "Title", kind: "text", defaultValue: "Default title" });
  assert.equal(textField.type, "custom");
  if (textField.type !== "custom") return;
  const textElement = textField.render({ field: textField, name: "title", id: "title", value: undefined, onChange: () => undefined });
  assert.match(renderToStaticMarkup(textElement), /value="Default title"/);

  const zeroField = createProductionPuckScalarField({ label: "Count", kind: "number", defaultValue: 7, min: 0, max: 10, step: 1 });
  assert.equal(zeroField.type, "custom");
  if (zeroField.type !== "custom") return;
  const zeroElement = zeroField.render({ field: zeroField, name: "count", id: "count", value: 0, onChange: () => undefined });
  const zeroMarkup = renderToStaticMarkup(zeroElement);
  assert.match(zeroMarkup, />Count</);
  assert.match(zeroMarkup, /for="count"/);
  assert.match(zeroMarkup, /value="0"/);
  assert.match(zeroMarkup, /min="0"/);
  assert.match(zeroMarkup, /max="10"/);
  assert.match(zeroMarkup, /step="1"/);

  const emptyField = createProductionPuckScalarField({ label: "Title", kind: "text", defaultValue: "Default title" });
  assert.equal(emptyField.type, "custom");
  if (emptyField.type !== "custom") return;
  const emptyElement = emptyField.render({ field: emptyField, name: "title", id: "title", value: "", onChange: () => undefined });
  assert.match(renderToStaticMarkup(emptyElement), /value=""/);
});

test("scalar labels use explicit metadata before safe key humanization", () => {
  assert.equal(humanizePuckFieldKey("trailLength"), "Trail Length");
  assert.equal(labelForPuckRule("trailLength", { kind: "number", min: 2, max: 64, label: "Trail length" }), "Trail length");
  assert.equal(labelForPuckRule("trailLength", { kind: "number", min: 2, max: 64, title: "Trail title" }), "Trail title");
  assert.equal(labelForPuckRule("trailLength", { kind: "number", min: 2, max: 64 }), "Trail Length");
});
