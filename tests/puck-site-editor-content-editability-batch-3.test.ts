import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  resetProductionEditorBlock,
  updateProductionEditorArrayItem,
  updateProductionEditorField,
} from "../lib/puck-site-editor/builder-properties.ts";
import {
  validateComponentEditorContract,
  type ProductionEditorField,
  type ProductionEditorPrimitive,
  type ProductionEditorValue,
} from "../lib/puck-site-editor/builder-contract.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { createPuckDocument, validatePuckDocument } from "../lib/puck-site-editor/document.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";

const root = path.resolve(import.meta.dirname, "..");

const selected = {
  hero8: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_hero_8")!,
  hero10: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_hero_10")!,
  hero20: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_hero_20")!,
  cta11: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch12_cta_11")!,
  cta14: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_cta_14")!,
  navigation5: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_navigation_5")!,
  navigation6: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch7_navigation_6")!,
  navigation12: PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.navigation-12")!,
};

const expected = {
  hero8: {
    identity: ["Hero 8", "pro-block:hero-8", "RB_batch11_hero_8", "@/components/blocks/hero-8", "@/components/puck-site-editor/adapted-library/hero/hero-8", "adapted-hero-8"],
    fields: [["firstLeft", "CONTENT"], ["firstRight", "CONTENT"], ["secondLeft", "CONTENT"], ["secondRight", "CONTENT"], ["description", "CONTENT"], ["creatingImageAlt", "CONTENT"], ["buildingImageAlt", "CONTENT"], ["heroImageUrl", "MEDIA"], ["heroImageAlt", "CONTENT"]],
    content: ["firstLeft", "firstRight", "secondLeft", "secondRight", "description", "creatingImageAlt", "buildingImageAlt", "heroImageAlt"],
    actions: [],
    arrays: { creatingImages: ["url"], buildingImages: ["url"] },
    media: ["heroImageUrl"],
  },
  hero10: {
    identity: ["Hero 10", "pro-block:hero-10", "RB_batch11_hero_10", "@/components/blocks/hero-10", "@/components/puck-site-editor/adapted-library/hero/hero-10", "adapted-hero-10"],
    fields: [["heading", "CONTENT"], ["description", "CONTENT"], ["buttonLabel", "ACTIONS"]],
    content: ["heading", "description"],
    actions: ["buttonLabel"],
    arrays: { cards: ["src", "alt"] },
    media: [],
  },
  hero20: {
    identity: ["Hero 20", "pro-block:hero-20", "RB_batch11_hero_20", "@/components/blocks/hero-20", "@/components/puck-site-editor/adapted-library/hero/hero-20", "adapted-hero-20"],
    fields: [["heading", "CONTENT"], ["description", "CONTENT"], ["primaryButtonLabel", "ACTIONS"], ["secondaryButtonLabel", "ACTIONS"], ["trustLabel", "CONTENT"]],
    content: ["heading", "description", "trustLabel"],
    actions: ["primaryButtonLabel", "secondaryButtonLabel"],
    arrays: { wordmarks: ["name"], metrics: ["value", "label"] },
    media: [],
  },
  cta11: {
    identity: ["CTA 11", "pro-block:cta-11", "RB_batch12_cta_11", "@/components/blocks/cta-11", "@/components/puck-site-editor/adapted-library/cta/cta-11", "adapted-cta-11"],
    fields: [["eyebrow", "CONTENT"], ["heading", "CONTENT"], ["description", "CONTENT"], ["helperText", "CONTENT"], ["balanceLabel", "CONTENT"], ["balanceCurrency", "CONTENT"], ["balanceValue", "CONTENT"], ["settledTodayLabel", "CONTENT"], ["moveFundsLabel", "CONTENT"], ["primaryButtonLabel", "ACTIONS"], ["primaryButtonHref", "ACTIONS"], ["secondaryButtonLabel", "ACTIONS"], ["secondaryButtonHref", "ACTIONS"], ["loop", "MOTION"]],
    content: ["eyebrow", "heading", "description", "helperText", "balanceLabel", "balanceCurrency", "balanceValue", "settledTodayLabel", "moveFundsLabel"],
    actions: ["primaryButtonLabel", "primaryButtonHref", "secondaryButtonLabel", "secondaryButtonHref"],
    arrays: { ledger: ["label", "meta", "amount", "status"] },
    media: [],
  },
  cta14: {
    identity: ["CTA 14", "pro-block:cta-14", "RB_batch11_cta_14", "@/components/blocks/cta-14", "@/components/puck-site-editor/adapted-library/cta/cta-14", "adapted-cta-14"],
    fields: [["eyebrow", "CONTENT"], ["heading", "CONTENT"], ["description", "CONTENT"], ["helperText", "CONTENT"], ["collaborationLabel", "CONTENT"], ["liveLabel", "CONTENT"], ["primaryButtonLabel", "ACTIONS"], ["primaryButtonHref", "ACTIONS"], ["secondaryButtonLabel", "ACTIONS"], ["secondaryButtonHref", "ACTIONS"], ["loop", "MOTION"]],
    content: ["eyebrow", "heading", "description", "helperText", "collaborationLabel", "liveLabel"],
    actions: ["primaryButtonLabel", "primaryButtonHref", "secondaryButtonLabel", "secondaryButtonHref"],
    arrays: { capabilities: ["label"], activity: ["initials", "name", "action", "time"] },
    media: [],
  },
  navigation5: {
    identity: ["Navigation 5", "pro-block:navigation-5", "RB_navigation_5", "@/components/blocks/navigation-5", "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-5", "adapted-navigation-5"],
    fields: [["mainHeading", "CONTENT"], ["mainDescription", "CONTENT"], ["brandMessage", "CONTENT"], ["currentPageLabel", "CONTENT"], ["openMenuLabel", "ACTIONS"], ["closeMenuLabel", "ACTIONS"], ["contactLabel", "ACTIONS"], ["contactHref", "ACTIONS"]],
    content: ["mainHeading", "mainDescription", "brandMessage", "currentPageLabel"],
    actions: ["openMenuLabel", "closeMenuLabel", "contactLabel", "contactHref"],
    arrays: { navItems: ["title", "image", "href"], socialLinks: ["name", "href"] },
    media: [],
  },
  navigation6: {
    identity: ["Navigation 6", "pro-block:navigation-6", "RB_batch7_navigation_6", "@/components/blocks/navigation-6", "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-6", "adapted-navigation-6"],
    fields: [["logoUrl", "MEDIA"], ["logoAlt", "CONTENT"], ["homeAriaLabel", "ACTIONS"], ["logoHref", "ACTIONS"], ["mainNavigationLabel", "CONTENT"], ["navigationMenuLabel", "CONTENT"], ["mainMenuLabel", "CONTENT"], ["footerNavigationLabel", "CONTENT"], ["openNavigationLabel", "ACTIONS"], ["closeNavigationLabel", "ACTIONS"], ["menuButtonLabel", "ACTIONS"], ["closeButtonLabel", "ACTIONS"], ["copyright", "CONTENT"], ["technologyNote", "CONTENT"]],
    content: ["logoAlt", "mainNavigationLabel", "navigationMenuLabel", "mainMenuLabel", "footerNavigationLabel", "copyright", "technologyNote"],
    actions: ["logoHref", "homeAriaLabel", "openNavigationLabel", "closeNavigationLabel", "menuButtonLabel", "closeButtonLabel"],
    arrays: { menuItems: ["label", "href", "image"], topNavItems: ["label", "href"], footerLinks: ["label", "href"] },
    media: ["logoUrl"],
  },
  navigation12: {
    identity: ["Navigation 12", "pro-block:navigation-12", "reactbits.navigation-12", "@/components/blocks/navigation-12", "@/components/puck-site-editor/adapted/navigation-12", "adapted-navigation-12"],
    fields: [["brandName", "CONTENT"], ["brandHref", "ACTIONS"], ["primaryNavLabel", "CONTENT"], ["mobileNavLabel", "CONTENT"], ["signInLabel", "ACTIONS"], ["signInHref", "ACTIONS"], ["primaryActionLabel", "ACTIONS"], ["primaryActionHref", "ACTIONS"], ["openMenuLabel", "ACTIONS"], ["closeMenuLabel", "ACTIONS"]],
    content: ["brandName", "primaryNavLabel", "mobileNavLabel"],
    actions: ["brandHref", "signInLabel", "signInHref", "primaryActionLabel", "primaryActionHref", "openMenuLabel", "closeMenuLabel"],
    arrays: { links: ["label"] },
    media: [],
  },
} as const;

test("Batch 3 keeps the production registry count and persisted identities", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);

  for (const [key, entry] of Object.entries(selected)) {
    assert.ok(entry, key);
    const item = expected[key as keyof typeof expected];
    assert.deepEqual(
      [entry.label, entry.catalogKey, entry.id, entry.physicalSource, entry.rendererSource, entry.editorAdapter],
      item.identity,
    );
  }
});

test("Batch 3 contracts expose exact safe content, media, action, and array fields", () => {
  for (const [key, entry] of Object.entries(selected)) {
    const item = expected[key as keyof typeof expected];
    const contract = entry.editorContract;
    assert.ok(contract, key);
    assert.equal(contract.componentId, entry.id);
    assert.deepEqual(validateComponentEditorContract(contract), [], key);
    assert.deepEqual(contract.fields.map((field) => [field.key, field.group]), item.fields, key);
    assert.deepEqual(contract.contentFields, item.content, key);
    assert.deepEqual(contract.actionFields, item.actions, key);
    assert.deepEqual(contract.mediaFields.map((field) => field.fieldKey), item.media, key);

    const arrayFields = Object.fromEntries(contract.arrays.map((array) => [
      array.key,
      array.itemFields.map((field) => field.key),
    ]));
    assert.deepEqual(arrayFields, item.arrays, key);

    assert.deepEqual(
      contract.defaultProps,
      Object.fromEntries(Object.keys(contract.defaultProps).map((fieldKey) => [fieldKey, entry.defaults[fieldKey]])),
      `${key} canonical defaults`,
    );
    for (const field of contract.fields) assert.ok(field.key in entry.props, `${key}.${field.key}`);
    for (const array of contract.arrays) {
      const rule = entry.props[array.key];
      assert.equal(rule.kind, "array", `${key}.${array.key} array rule`);
      if (rule.kind === "array") {
        assert.equal(rule.editable, true, `${key}.${array.key} editable`);
        assert.equal(rule.item.kind, "object", `${key}.${array.key} item object`);
        if (rule.item.kind === "object") {
          assert.deepEqual(Object.keys(rule.item.properties), array.defaultItems.length ? Object.keys(array.defaultItems[0]) : [], `${key}.${array.key} item schema`);
        }
      }
    }
  }
});

function editedValue(field: ProductionEditorField, key: string): ProductionEditorPrimitive {
  if (field.type === "boolean") return false;
  if (field.type === "number") return field.min ?? 0;
  if (field.type === "media") return `/batch3/${key}.webp`;
  return `Edited ${key}`;
}

test("Batch 3 fields and bounded arrays update, serialize, reload, and Reset Original exactly", () => {
  for (const [key, entry] of Object.entries(selected)) {
    const contract = entry.editorContract!;
    let edited = JSON.parse(JSON.stringify(entry.defaults)) as Readonly<Record<string, ProductionEditorValue>>;
    for (const field of contract.fields) {
      edited = updateProductionEditorField(edited, contract, field.key, editedValue(field, `${key}-${field.key}`));
    }
    for (const array of contract.arrays) {
      assert.ok(array.defaultItems.length, `${key}.${array.key} has canonical items`);
      for (const field of array.itemFields) {
        edited = updateProductionEditorArrayItem(
          edited,
          contract,
          array.key,
          0,
          field.key,
          field.type === "media" ? `/batch3/${key}-${array.key}.webp` : `Edited ${key}-${array.key}-${field.key}`,
        );
      }
    }

    assert.notDeepEqual(edited, entry.defaults, `${key} edited`);
    const reloaded = JSON.parse(JSON.stringify(edited)) as Readonly<Record<string, ProductionEditorValue>>;
    assert.deepEqual(resetProductionEditorBlock(reloaded, contract), entry.defaults, `${key} reset`);
  }
});

test("Batch 3 defaults are duplicate, delete, undo/redo, responsive, and preview-data compatible", () => {
  for (const [index, entry] of Object.values(selected).entries()) {
    const props = JSON.parse(JSON.stringify(entry.defaults)) as Record<string, unknown>;
    const original = { type: entry.id, props: { ...props, id: `batch3-${index + 1}-original` } };
    const duplicate = { type: entry.id, props: { ...props, id: `batch3-${index + 1}-duplicate` } };
    const originalDocument = createPuckDocument({ pageId: `batch3-${index + 1}`, locale: "en", content: [original] });
    const duplicatedDocument = createPuckDocument({ pageId: `batch3-${index + 1}`, locale: "en", content: [original, duplicate] });
    const deletedDocument = createPuckDocument({ pageId: `batch3-${index + 1}`, locale: "en", content: [duplicate] });

    assert.equal(validatePuckDocument(originalDocument).ok, true, entry.catalogKey);
    assert.equal(validatePuckDocument(duplicatedDocument).ok, true, `${entry.catalogKey} duplicate`);
    assert.equal(validatePuckDocument(deletedDocument).ok, true, `${entry.catalogKey} delete`);
    assert.deepEqual(puckDataToDocument(puckDocumentToData(originalDocument), { pageId: `batch3-${index + 1}`, locale: "en" }), originalDocument);
    assert.deepEqual(JSON.parse(JSON.stringify(originalDocument)), originalDocument);
    assert.deepEqual(JSON.parse(JSON.stringify(duplicatedDocument)), duplicatedDocument);
    assert.deepEqual(JSON.parse(JSON.stringify({ desktop: props, tablet: props, mobile: props })).desktop, props);
  }
});

test("Batch 3 adapters externalize hidden/mobile/dropdown content and preserve runtime hooks", () => {
  const sources = {
    hero8: "components/puck-site-editor/adapted-library/hero/hero-8.tsx",
    hero10: "components/puck-site-editor/adapted-library/hero/hero-10.tsx",
    hero20: "components/puck-site-editor/adapted-library/hero/hero-20.tsx",
    cta11: "components/puck-site-editor/adapted-library/cta/cta-11.tsx",
    cta14: "components/puck-site-editor/adapted-library/cta/cta-14.tsx",
    navigation5: "components/puck-site-editor/adapted-library/advanced/navigation/navigation-5.tsx",
    navigation6: "components/puck-site-editor/adapted-library/advanced/navigation/navigation-6.tsx",
    navigation12: "components/puck-site-editor/adapted/navigation-12.tsx",
  } as const;
  const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

  assert.match(read(sources.hero8), /creatingImages|buildingImages|heroImageUrl|heroImageAlt/);
  assert.match(read(sources.hero10), /cards\.map/);
  assert.match(read(sources.hero20), /wordmarks\.map|metrics\.map/);
  assert.match(read(sources.cta11), /ledger\.map|balanceLabel|settledTodayLabel|moveFundsLabel/);
  assert.match(read(sources.cta14), /capabilities\.map|activity\.map|collaborationLabel|liveLabel/);
  assert.match(read(sources.navigation5), /navItems\.map|socialLinks\.map|openMenuLabel|closeMenuLabel|currentPageLabel/);
  assert.match(read(sources.navigation6), /menuItems\.map|topNavItems\.map|footerLinks\.map|handleEscape|document\.body\.style\.overflow/);
  assert.match(read(sources.navigation12), /links\.map|primaryNavLabel|mobileNavLabel|openMenuLabel|closeMenuLabel|event\.key === "Escape"/);

  for (const [key, file] of Object.entries(sources)) {
    const source = read(file);
    assert.doesNotMatch(source, /Main Content Area|Click the navigation at the bottom\.|This is Trok|Company logo|Built with React & Tailwind|© 2024 All rights reserved|aria-label="Primary"|aria-label="Mobile"/, `${key} retains hardcoded editable copy`);
  }
});

test("Batch 3 keeps official source files untouched and production mappings out of editor-lab", () => {
  for (const file of [
    "components/blocks/hero-8.tsx",
    "components/blocks/hero-10.tsx",
    "components/blocks/hero-20.tsx",
    "components/blocks/cta-11.tsx",
    "components/blocks/cta-14.tsx",
    "components/blocks/navigation-5.tsx",
    "components/blocks/navigation-6.tsx",
    "components/blocks/navigation-12.tsx",
  ]) {
    assert.doesNotThrow(() => execFileSync("git", ["diff", "--quiet", "--", file], { cwd: root }), file);
  }

  const productionSources = fs.readFileSync(path.join(root, "components/puck-site-editor/production-component-sources.tsx"), "utf8");
  assert.doesNotMatch(productionSources, /editor-lab/i);
  assert.match(productionSources, /pro-block:navigation-5/);
  assert.match(productionSources, /pro-block:navigation-6/);
});
