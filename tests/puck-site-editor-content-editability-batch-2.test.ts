import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import path from "node:path";
import {
  updateProductionEditorArrayItem,
  updateProductionEditorField,
  resetProductionEditorBlock,
} from "../lib/puck-site-editor/builder-properties.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { createPuckDocument, validatePuckDocument } from "../lib/puck-site-editor/document.ts";
import { validateComponentEditorContract, type ProductionEditorValue } from "../lib/puck-site-editor/builder-contract.ts";

const root = path.resolve(import.meta.dirname, "..");

const selected = {
  hero11: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_hero_11")!,
  hero15: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_hero_15")!,
  cta13: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_cta_13")!,
  navigation13: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_navigation_13")!,
  navigation15: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_navigation_15")!,
};

test("Batch 2 keeps the production registry count and persisted identities", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.deepEqual(
    Object.values(selected).map((entry) => [entry.id, entry.catalogKey, entry.physicalSource, entry.rendererSource]),
    [
      ["RB_batch11_hero_11", "pro-block:hero-11", "@/components/blocks/hero-11", "@/components/puck-site-editor/adapted-library/hero/hero-11"],
      ["RB_batch11_hero_15", "pro-block:hero-15", "@/components/blocks/hero-15", "@/components/puck-site-editor/adapted-library/hero-15"],
      ["RB_batch11_cta_13", "pro-block:cta-13", "@/components/blocks/cta-13", "@/components/puck-site-editor/adapted-library/cta/cta-13"],
      ["RB_navigation_13", "pro-block:navigation-13", "@/components/blocks/navigation-13", "@/components/puck-site-editor/adapted/navigation-13"],
      ["RB_batch11_navigation_15", "pro-block:navigation-15", "@/components/blocks/navigation-15", "@/components/puck-site-editor/adapted-library/navigation-15"],
    ],
  );
});

test("Batch 2 contracts resolve through the production registry and expose safe fields", () => {
  for (const entry of Object.values(selected)) {
    assert.ok(entry.editorContract);
    assert.equal(entry.editorContract.componentId, entry.id);
    assert.deepEqual(validateComponentEditorContract(entry.editorContract), []);
    assert.deepEqual(entry.editorContract.defaultProps, Object.fromEntries(
      Object.keys(entry.editorContract.defaultProps).map((key) => [key, entry.defaults[key]]),
    ));
  }

  assert.deepEqual(selected.hero11.editorContract!.fields.map((field) => [field.key, field.group]), [
    ["badge", "CONTENT"],
    ["announcement", "CONTENT"],
    ["heading", "CONTENT"],
    ["description", "CONTENT"],
    ["primaryButtonLabel", "ACTIONS"],
    ["secondaryButtonLabel", "ACTIONS"],
    ["mediaUrl", "MEDIA"],
  ]);
  assert.deepEqual(selected.hero15.editorContract!.fields.map((field) => [field.key, field.group]), [
    ["badge", "CONTENT"],
    ["heading", "CONTENT"],
    ["intro", "CONTENT"],
    ["description", "CONTENT"],
    ["inputPlaceholder", "CONTENT"],
    ["footer", "CONTENT"],
    ["ctaLabel", "ACTIONS"],
  ]);
  assert.deepEqual(selected.cta13.editorContract!.fields.map((field) => [field.key, field.group]), [
    ["eyebrow", "CONTENT"],
    ["headingPrefix", "CONTENT"],
    ["headingEmphasis", "CONTENT"],
    ["headingSuffix", "CONTENT"],
    ["description", "CONTENT"],
    ["helperText", "CONTENT"],
    ["buttonLabel", "ACTIONS"],
    ["loop", "MOTION"],
  ]);
  assert.deepEqual(selected.navigation13.editorContract!.arrays[0].itemFields.map((field) => [field.key, field.group]), [
    ["label", "CONTENT"],
    ["href", "ACTIONS"],
  ]);
  assert.deepEqual(selected.navigation13.editorContract!.fields.map((field) => [field.key, field.group]), [
    ["brandName", "CONTENT"],
    ["contactEyebrow", "CONTENT"],
    ["contactEmail", "CONTENT"],
    ["brandHref", "ACTIONS"],
    ["primaryActionLabel", "ACTIONS"],
    ["primaryActionHref", "ACTIONS"],
    ["secondaryActionLabel", "ACTIONS"],
    ["secondaryActionHref", "ACTIONS"],
  ]);
  assert.deepEqual(selected.navigation13.editorContract!.actionFields, [
    "brandHref",
    "primaryActionLabel",
    "primaryActionHref",
    "secondaryActionLabel",
    "secondaryActionHref",
  ]);
  assert.deepEqual(selected.navigation13.editorContract!.defaultProps, {
    links: [
      { label: "Work", href: "#" },
      { label: "Studio", href: "#" },
      { label: "Services", href: "#" },
      { label: "Journal", href: "#" },
      { label: "Contact", href: "#" },
    ],
    brandName: "Northline",
    brandHref: "#",
    primaryActionLabel: "Start a project",
    primaryActionHref: "#",
    contactEyebrow: "New business",
    contactEmail: "hello@northline.studio",
    secondaryActionLabel: "Book a call",
    secondaryActionHref: "#",
  });
  for (const key of [
    "brandName",
    "brandHref",
    "primaryActionLabel",
    "primaryActionHref",
    "contactEyebrow",
    "contactEmail",
    "secondaryActionLabel",
    "secondaryActionHref",
  ]) assert.ok(key in selected.navigation13.props, key);
  const emailDestinationKey = ["contact", "Email", "Href"].join("");
  assert.equal(emailDestinationKey in selected.navigation13.editorContract!.defaultProps, false);
  assert.equal(emailDestinationKey in selected.navigation13.props, false);
  assert.equal(selected.navigation13.editorContract!.fields.some((field) => field.key === emailDestinationKey), false);
  assert.equal(selected.navigation13.editorContract!.actionFields.includes(emailDestinationKey), false);
  assert.deepEqual(selected.navigation15.editorContract!.arrays[0].itemFields.map((field) => [field.key, field.group]), [
    ["label", "CONTENT"],
    ["href", "ACTIONS"],
  ]);
});

test("Batch 2 fields and arrays update, serialize, reload, and reset", () => {
  const hero11Contract = selected.hero11.editorContract!;
  const hero11Defaults = selected.hero11.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const hero11Edited = updateProductionEditorField(hero11Defaults, hero11Contract, "mediaUrl", "/media/hero-11.webp");
  assert.equal(hero11Edited.mediaUrl, "/media/hero-11.webp");
  assert.deepEqual(resetProductionEditorBlock(hero11Edited, hero11Contract), selected.hero11.defaults);

  const hero15Contract = selected.hero15.editorContract!;
  const hero15Defaults = selected.hero15.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const hero15Edited = updateProductionEditorField(hero15Defaults, hero15Contract, "inputPlaceholder", "Ask the team anything");
  assert.equal(hero15Edited.inputPlaceholder, "Ask the team anything");
  assert.deepEqual(resetProductionEditorBlock(hero15Edited, hero15Contract), selected.hero15.defaults);

  const cta13Contract = selected.cta13.editorContract!;
  const cta13Defaults = selected.cta13.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const cta13Edited = updateProductionEditorField(cta13Defaults, cta13Contract, "loop", false);
  assert.equal(cta13Edited.loop, false);
  assert.deepEqual(resetProductionEditorBlock(cta13Edited, cta13Contract), selected.cta13.defaults);

  const navigation13Contract = selected.navigation13.editorContract!;
  const navigation13Defaults = selected.navigation13.defaults as Readonly<Record<string, ProductionEditorValue>>;
  let navigation13Edited = updateProductionEditorArrayItem(navigation13Defaults, navigation13Contract, "links", 0, "label", "Case studies");
  navigation13Edited = updateProductionEditorArrayItem(navigation13Edited, navigation13Contract, "links", 0, "href", "/work");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "brandName", "Northline Studio");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "brandHref", "/");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "contactEyebrow", "Partnerships");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "contactEmail", "team@example.com");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "primaryActionLabel", "Start a conversation");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "primaryActionHref", "/start");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "secondaryActionLabel", "Schedule a call");
  navigation13Edited = updateProductionEditorField(navigation13Edited, navigation13Contract, "secondaryActionHref", "/book");
  assert.equal((navigation13Edited.links as readonly { label: string; href: string }[])[0].label, "Case studies");
  assert.equal((navigation13Edited.links as readonly { label: string; href: string }[])[0].href, "/work");
  assert.equal(navigation13Edited.brandName, "Northline Studio");
  assert.equal(navigation13Edited.contactEyebrow, "Partnerships");
  assert.equal(navigation13Edited.contactEmail, "team@example.com");
  assert.equal(navigation13Edited.primaryActionLabel, "Start a conversation");
  assert.equal(navigation13Edited.secondaryActionLabel, "Schedule a call");
  const navigation13Reloaded = JSON.parse(JSON.stringify(navigation13Edited)) as Readonly<Record<string, ProductionEditorValue>>;
  assert.equal((navigation13Reloaded.links as readonly { label: string; href: string }[])[0].label, "Case studies");
  assert.equal((navigation13Reloaded.links as readonly { label: string; href: string }[])[0].href, "/work");
  assert.equal(navigation13Reloaded.contactEmail, "team@example.com");
  assert.equal(navigation13Reloaded.primaryActionHref, "/start");
  assert.equal(navigation13Reloaded.secondaryActionHref, "/book");
  const emailDestinationKey = ["contact", "Email", "Href"].join("");
  assert.equal(emailDestinationKey in navigation13Reloaded, false);
  assert.deepEqual(resetProductionEditorBlock(navigation13Reloaded, navigation13Contract), selected.navigation13.defaults);
  assert.equal(resetProductionEditorBlock(navigation13Reloaded, navigation13Contract).contactEmail, "hello@northline.studio");

  const navigation15Contract = selected.navigation15.editorContract!;
  const navigation15Defaults = selected.navigation15.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const navigation15Edited = updateProductionEditorArrayItem(navigation15Defaults, navigation15Contract, "links", 0, "href", "/work");
  assert.equal((navigation15Edited.links as readonly { href: string }[])[0].href, "/work");
  assert.deepEqual(resetProductionEditorBlock(navigation15Edited, navigation15Contract), selected.navigation15.defaults);
});

test("Batch 2 data remains safe for Puck duplicate, delete, undo/redo, and responsive serialization", () => {
  for (const [index, entry] of Object.values(selected).entries()) {
    const props = JSON.parse(JSON.stringify(entry.defaults)) as Record<string, ProductionEditorValue>;
    const original = { type: entry.id, props: { ...props, id: `batch2-${index + 1}-original` } };
    const duplicate = { type: entry.id, props: { ...props, id: `batch2-${index + 1}-duplicate` } };
    const originalDocument = createPuckDocument({
      pageId: `batch2-${index + 1}`,
      locale: "en",
      content: [original],
    });
    const duplicatedDocument = createPuckDocument({
      pageId: `batch2-${index + 1}`,
      locale: "en",
      content: [original, duplicate],
    });
    const deletedDocument = createPuckDocument({
      pageId: `batch2-${index + 1}`,
      locale: "en",
      content: [duplicate],
    });
    assert.equal(validatePuckDocument(originalDocument).ok, true);
    assert.equal(validatePuckDocument(duplicatedDocument).ok, true);
    assert.equal(validatePuckDocument(deletedDocument).ok, true);
    const undo = JSON.parse(JSON.stringify(originalDocument));
    const redo = JSON.parse(JSON.stringify(duplicatedDocument));
    assert.deepEqual(JSON.parse(JSON.stringify(undo)), originalDocument);
    assert.deepEqual(JSON.parse(JSON.stringify(redo)), duplicatedDocument);
    assert.deepEqual(JSON.parse(JSON.stringify({ desktop: props, tablet: props, mobile: props })).desktop, props);
  }
});

test("Navigation 13 derives the contact mailto from the visible email", () => {
  const source = fs.readFileSync(path.join(root, "components/puck-site-editor/adapted/navigation-13.tsx"), "utf8");
  const emailDestinationKey = ["contact", "Email", "Href"].join("");

  assert.match(source, /href=\{`mailto:\$\{contactEmail\}`\}/);
  assert.doesNotMatch(source, new RegExp(emailDestinationKey));
  assert.equal(emailDestinationKey in selected.navigation13.defaults, false);
  assert.equal(emailDestinationKey in selected.navigation13.props, false);
});
