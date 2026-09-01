import assert from "node:assert/strict";
import test from "node:test";
import {
  createPuckDocument,
  validatePuckDocument,
} from "../lib/puck-site-editor/document.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_REGISTRY_VERSION,
} from "../lib/puck-site-editor/registry-manifest.ts";

const hero = () => ({
  type: "reactbits.hero-14",
  props: {
    id: "hero-a",
    ...PUCK_PRODUCTION_MANIFEST.find((item) => item.id === "reactbits.hero-14")!.defaults,
  },
});

test("versioned Puck document validates and canonicalizes", () => {
  const document = createPuckDocument({ pageId: "home", locale: "ru", content: [hero()] });
  assert.equal(document.version, 1);
  assert.equal(document.registryVersion, PUCK_REGISTRY_VERSION);
  assert.equal(validatePuckDocument(document).ok, true);
  assert.equal(JSON.stringify(document), JSON.stringify(createPuckDocument({ pageId: "home", locale: "ru", content: [hero()] })));
});

test("unknown component identifiers are rejected", () => {
  const document = createPuckDocument({ pageId: "home", locale: "ru", content: [hero()] });
  const invalid = { ...document, content: [{ type: "reactbits.ballpit", props: { id: "unsafe" } }] };
  const result = validatePuckDocument(invalid);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /unknown component id/);
});

test("unsupported versions and arbitrary props are rejected", () => {
  const document = createPuckDocument({ pageId: "home", locale: "en", content: [hero()] });
  const versionResult = validatePuckDocument({ ...document, version: 2 });
  assert.equal(versionResult.ok, false);
  const propResult = validatePuckDocument({
    ...document,
    content: [{ ...hero(), props: { ...hero().props, dangerouslySetInnerHTML: { __html: "<script />" } } }],
  });
  assert.equal(propResult.ok, false);
  if (!propResult.ok) assert.match(propResult.errors.join("\n"), /unknown key/);
});

test("functions, non-finite numbers and unsafe prototype values are rejected", () => {
  const document = createPuckDocument({ pageId: "home", locale: "en", content: [hero()] });
  for (const unsafe of [
    { ...document, callback: () => undefined },
    { ...document, content: [{ ...hero(), props: { ...hero().props, id: Number.NaN } }] },
    { ...document, metadata: new Date() },
  ]) {
    assert.equal(validatePuckDocument(unsafe).ok, false);
  }
});

test("allow-list identities and physical catalogue keys are unique", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(new Set(PUCK_PRODUCTION_MANIFEST.map((item) => item.id)).size, PUCK_PRODUCTION_MANIFEST.length);
  assert.equal(new Set(PUCK_PRODUCTION_MANIFEST.map((item) => item.catalogKey)).size, PUCK_PRODUCTION_MANIFEST.length);
  assert.equal(PUCK_PRODUCTION_MANIFEST.some((item) => /ballpit/i.test(item.id)), false);
  assert.equal(PUCK_PRODUCTION_MANIFEST.some((item) => /fast.batch|control/i.test(item.label)), false);
});
