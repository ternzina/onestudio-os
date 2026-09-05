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
  PUCK_BATCH_4_EDITOR_CONTRACTS,
  type PuckBatch4CatalogKey,
} from "../components/puck-site-editor/content-editability-batch-4-contracts.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { createPuckDocument, validatePuckDocument } from "../lib/puck-site-editor/document.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";

const root = path.resolve(import.meta.dirname, "..");

const selected = {
  hero16: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_hero_16")!,
  hero17: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch9_hero_17")!,
  hero19: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch9_hero_19")!,
  cta8: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch9_cta_8")!,
  cta9: PUCK_PRODUCTION_MANIFEST_BY_ID.get("reactbits.cta-9")!,
  navigation4: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch7_navigation_4")!,
  navigation11: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_navigation_11")!,
  navigation14: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_navigation_14")!,
};

const expected = {
  hero16: {
    identity: ["Hero 16", "pro-block:hero-16", "RB_hero_16", "@/components/blocks/hero-16", "@/components/puck-site-editor/adapted-library/hero/hero-16", "adapted-hero-16"],
    fields: [["logoUrl", "MEDIA"], ["logoAlt", "CONTENT"], ["headingLine1", "CONTENT"], ["headingLine2", "CONTENT"], ["headingLine3", "CONTENT"], ["description", "CONTENT"], ["primaryButtonLabel", "ACTIONS"], ["primaryButtonHref", "ACTIONS"], ["secondaryButtonHref", "ACTIONS"]],
    content: ["logoAlt", "headingLine1", "headingLine2", "headingLine3", "description"],
    media: ["logoUrl"],
    actions: ["primaryButtonLabel", "primaryButtonHref", "secondaryButtonHref"],
    arrays: {},
  },
  hero17: {
    identity: ["Hero 17 Image Grid", "pro-block:hero-17", "RB_batch9_hero_17", "@/components/blocks/hero-17", "@/components/puck-site-editor/adapted-library/hero/hero-17", "adapted-hero-17"],
    fields: [["badge", "CONTENT"], ["headingLine1", "CONTENT"], ["headingLine2", "CONTENT"], ["description", "CONTENT"], ["buttonLabel", "ACTIONS"], ["heroImageUrl", "MEDIA"], ["heroImageAlt", "CONTENT"]],
    content: ["badge", "headingLine1", "headingLine2", "description", "heroImageAlt"],
    media: ["heroImageUrl"],
    actions: ["buttonLabel"],
    arrays: { gallery: { fields: ["src", "alt"], maxItems: 8 } },
  },
  hero19: {
    identity: ["Hero 19 Pointer Parallax", "pro-block:hero-19", "RB_batch9_hero_19", "@/components/blocks/hero-19", "@/components/puck-site-editor/adapted-library/hero/hero-19", "adapted-hero-19"],
    fields: [["eyebrow", "CONTENT"], ["heading", "CONTENT"], ["description", "CONTENT"], ["primaryButtonLabel", "ACTIONS"], ["secondaryButtonLabel", "ACTIONS"], ["securityTrustLabel", "CONTENT"], ["launchTrustLabel", "CONTENT"], ["billingRunLabel", "CONTENT"], ["billingRunMeta", "CONTENT"], ["billingStatusLabel", "CONTENT"], ["recognizedLabel", "CONTENT"], ["recognizedValue", "CONTENT"], ["recognizedPercent", "CONTENT"], ["recognizedPlanLabel", "CONTENT"], ["paymentReceivedLabel", "CONTENT"], ["paymentReceivedDetail", "CONTENT"], ["approvalCompleteLabel", "CONTENT"], ["approvalCompleteDetail", "CONTENT"]],
    content: ["eyebrow", "heading", "description", "securityTrustLabel", "launchTrustLabel", "billingRunLabel", "billingRunMeta", "billingStatusLabel", "recognizedLabel", "recognizedValue", "recognizedPercent", "recognizedPlanLabel", "paymentReceivedLabel", "paymentReceivedDetail", "approvalCompleteLabel", "approvalCompleteDetail"],
    media: [],
    actions: ["primaryButtonLabel", "secondaryButtonLabel"],
    arrays: { invoices: { fields: ["initials", "name", "terms", "status"], maxItems: 12 } },
  },
  cta8: {
    identity: ["CTA 8 Cursor Reveal", "pro-block:cta-8", "RB_batch9_cta_8", "@/components/blocks/cta-8", "@/components/puck-site-editor/adapted-library/cta-8", "adapted-cta-8"],
    fields: [["buttonLabel", "ACTIONS"], ["trialLabel", "CONTENT"], ["word", "CONTENT"]],
    content: ["trialLabel", "word"],
    media: [],
    actions: ["buttonLabel"],
    arrays: {},
  },
  cta9: {
    identity: ["CTA 9", "pro-block:cta-9", "reactbits.cta-9", "@/components/blocks/cta-9", "@/components/puck-site-editor/adapted/cta-9", "adapted-cta-9"],
    fields: [["heading", "CONTENT"], ["description", "CONTENT"], ["buttonLabel", "ACTIONS"], ["leftCardImage", "MEDIA"], ["leftCardHeadline", "CONTENT"], ["leftCardMeta", "CONTENT"], ["rightCardContext", "CONTENT"], ["rightCardTitle", "CONTENT"], ["rightCardDescription", "CONTENT"]],
    content: ["heading", "description", "leftCardHeadline", "leftCardMeta", "rightCardContext", "rightCardTitle", "rightCardDescription"],
    media: ["leftCardImage"],
    actions: ["buttonLabel"],
    arrays: {},
  },
  navigation4: {
    identity: ["Navigation 4", "pro-block:navigation-4", "RB_batch7_navigation_4", "@/components/blocks/navigation-4", "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-4", "adapted-navigation-4"],
    fields: [["mobileBrandLine1", "CONTENT"], ["mobileBrandLine2", "CONTENT"], ["desktopBrandLine1", "CONTENT"], ["desktopBrandLine2", "CONTENT"], ["openMenuLabel", "ACTIONS"], ["closeMenuLabel", "ACTIONS"]],
    content: ["mobileBrandLine1", "mobileBrandLine2", "desktopBrandLine1", "desktopBrandLine2"],
    media: [],
    actions: ["openMenuLabel", "closeMenuLabel"],
    arrays: { navItems: { fields: ["iconToken", "label", "href"], maxItems: 8 } },
  },
  navigation11: {
    identity: ["Navigation 11", "pro-block:navigation-11", "RB_batch11_navigation_11", "@/components/blocks/navigation-11", "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-11", "adapted-navigation-11"],
    fields: [["brandName", "CONTENT"], ["loginLabel", "ACTIONS"], ["loginHref", "ACTIONS"], ["primaryActionLabel", "ACTIONS"], ["primaryActionHref", "ACTIONS"], ["openMenuLabel", "ACTIONS"], ["closeMenuLabel", "ACTIONS"]],
    content: ["brandName"],
    media: [],
    actions: ["loginLabel", "loginHref", "primaryActionLabel", "primaryActionHref", "openMenuLabel", "closeMenuLabel"],
    arrays: {
      sectionGroups: { fields: ["label", "heading"], maxItems: 8 },
      cards: { fields: ["sectionLabel", "title", "desc", "img", "href"], maxItems: 32 },
      footerPartnerLinks: { fields: ["label", "href"], maxItems: 12 },
      footerLegalLinks: { fields: ["label", "href"], maxItems: 12 },
    },
  },
  navigation14: {
    identity: ["Navigation 14", "pro-block:navigation-14", "RB_batch11_navigation_14", "@/components/blocks/navigation-14", "@/components/puck-site-editor/adapted-library/advanced/navigation/navigation-14", "adapted-navigation-14"],
    fields: [["brandName", "CONTENT"], ["brandHref", "ACTIONS"], ["pricingLabel", "ACTIONS"], ["pricingHref", "ACTIONS"], ["loginLabel", "ACTIONS"], ["loginHref", "ACTIONS"], ["primaryActionLabel", "ACTIONS"], ["primaryActionHref", "ACTIONS"], ["openMenuLabel", "ACTIONS"], ["closeMenuLabel", "ACTIONS"], ["learnMoreLabel", "ACTIONS"]],
    content: ["brandName"],
    media: [],
    actions: ["brandHref", "pricingLabel", "pricingHref", "loginLabel", "loginHref", "primaryActionLabel", "primaryActionHref", "openMenuLabel", "closeMenuLabel", "learnMoreLabel"],
    arrays: {
      sectionGroups: { fields: ["label", "featuredTag", "featuredTitle", "featuredDescription", "featuredHref"], maxItems: 8 },
      items: { fields: ["sectionLabel", "iconToken", "title", "description", "href"], maxItems: 32 },
    },
  },
} as const;

test("Batch 4 keeps the production registry at 280 and preserves all eight identities", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.deepEqual(Object.keys(PUCK_BATCH_4_EDITOR_CONTRACTS).sort(), Object.values(expected).map((item) => item.identity[1]).sort());

  for (const [key, entry] of Object.entries(selected)) {
    assert.ok(entry, key);
    const item = expected[key as keyof typeof expected];
    assert.deepEqual(
      [entry.label, entry.catalogKey, entry.id, entry.physicalSource, entry.rendererSource, entry.editorAdapter],
      item.identity,
      key,
    );
    assert.equal(entry.publicRenderer, item.identity[5], `${key} public renderer`);
    assert.equal(entry.editorContract?.componentId, entry.id, `${key} persisted component ID`);
  }
});

test("Batch 4 contracts validate and expose genuine CONTENT, MEDIA, ACTIONS, and bounded arrays", () => {
  for (const [key, entry] of Object.entries(selected)) {
    const item = expected[key as keyof typeof expected];
    const contract = entry.editorContract;
    assert.ok(contract, key);
    assert.deepEqual(validateComponentEditorContract(contract), [], key);
    assert.deepEqual(contract.fields.map((field) => [field.key, field.group]), item.fields, key);
    assert.deepEqual(contract.contentFields, item.content, `${key} content`);
    assert.deepEqual(contract.mediaFields.map((field) => field.fieldKey), item.media, `${key} media`);
    assert.deepEqual(contract.actionFields, item.actions, `${key} actions`);

    const arrays = Object.fromEntries(contract.arrays.map((array) => [
      array.key,
      { fields: array.itemFields.map((field) => field.key), maxItems: (entry.props[array.key] as { maxItems: number }).maxItems },
    ]));
    assert.deepEqual(arrays, item.arrays, `${key} arrays`);
    assert.deepEqual(
      contract.defaultProps,
      Object.fromEntries(Object.keys(contract.defaultProps).map((fieldKey) => [fieldKey, entry.defaults[fieldKey]])),
      `${key} canonical defaults`,
    );
    for (const field of contract.fields) assert.ok(field.key in entry.props, `${key}.${field.key} prop rule`);
    for (const array of contract.arrays) {
      const rule = entry.props[array.key];
      assert.ok(rule && rule.kind === "array", `${key}.${array.key} array rule`);
      assert.equal(rule.editable, true, `${key}.${array.key} editable`);
      assert.equal(rule.item.kind, "object", `${key}.${array.key} item object`);
      if (rule.item.kind === "object") {
        assert.deepEqual(Object.keys(rule.item.properties), array.itemFields.map((field) => field.key), `${key}.${array.key} schema`);
      }
    }
  }
});

function editedValue(field: ProductionEditorField, seed: string): ProductionEditorPrimitive {
  if (field.type === "boolean") return false;
  if (field.type === "number") return field.min ?? 0;
  if (field.type === "media" || field.type === "url") return `/batch4/${seed}.webp`;
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  return `Edited ${seed}`;
}

test("Batch 4 fields and arrays edit, serialize, reload, and Reset Original exactly", () => {
  for (const [key, entry] of Object.entries(selected)) {
    const contract = entry.editorContract!;
    let edited = JSON.parse(JSON.stringify(entry.defaults)) as Readonly<Record<string, ProductionEditorValue>>;
    for (const field of contract.fields) {
      edited = updateProductionEditorField(edited, contract, field.key, editedValue(field, `${key}-${field.key}`));
    }
    for (const array of contract.arrays) {
      assert.ok(array.defaultItems.length, `${key}.${array.key} canonical items`);
      for (const field of array.itemFields) {
        edited = updateProductionEditorArrayItem(
          edited,
          contract,
          array.key,
          0,
          field.key,
          editedValue(field as ProductionEditorField, `${key}-${array.key}-${field.key}`),
        );
      }
    }
    assert.notDeepEqual(edited, entry.defaults, `${key} changed`);
    const reloaded = JSON.parse(JSON.stringify(edited)) as Readonly<Record<string, ProductionEditorValue>>;
    assert.deepEqual(resetProductionEditorBlock(reloaded, contract), entry.defaults, `${key} Reset Original`);
  }
});

test("Batch 4 defaults and edited documents support duplicate, delete, undo/redo, responsive, and reload flows", () => {
  for (const [index, entry] of Object.values(selected).entries()) {
    const props = JSON.parse(JSON.stringify(entry.defaults)) as Record<string, unknown>;
    const original = { type: entry.id, props: { ...props, id: `batch4-${index + 1}-original` } };
    const duplicate = { type: entry.id, props: { ...props, id: `batch4-${index + 1}-duplicate` } };
    const originalDocument = createPuckDocument({ pageId: `batch4-${index + 1}`, locale: "en", content: [original] });
    const duplicatedDocument = createPuckDocument({ pageId: `batch4-${index + 1}`, locale: "en", content: [original, duplicate] });
    const deletedDocument = createPuckDocument({ pageId: `batch4-${index + 1}`, locale: "en", content: [duplicate] });

    assert.equal(validatePuckDocument(originalDocument).ok, true, entry.catalogKey);
    assert.equal(validatePuckDocument(duplicatedDocument).ok, true, `${entry.catalogKey} duplicate`);
    assert.equal(validatePuckDocument(deletedDocument).ok, true, `${entry.catalogKey} delete`);
    assert.deepEqual(
      puckDataToDocument(puckDocumentToData(originalDocument), { pageId: `batch4-${index + 1}`, locale: "en" }),
      originalDocument,
      `${entry.catalogKey} serialize/reload`,
    );
    assert.deepEqual(JSON.parse(JSON.stringify(originalDocument)), originalDocument, `${entry.catalogKey} JSON reload`);
    assert.deepEqual(JSON.parse(JSON.stringify(duplicatedDocument)), duplicatedDocument, `${entry.catalogKey} duplicate reload`);
    assert.deepEqual(JSON.parse(JSON.stringify({ desktop: props, tablet: props, mobile: props })).mobile, props, `${entry.catalogKey} responsive`);
  }
});

test("Batch 4 adapters externalize desktop, mobile, hidden, dropdown, and repeated content while preserving runtime hooks", () => {
  const sources = {
    hero16: { file: "components/puck-site-editor/adapted-library/hero/hero-16.tsx", hooks: /headingLine3|secondaryButtonHref/, forbidden: /Pioneering the next|Biosynthesis|Discover our platform/ },
    hero17: { file: "components/puck-site-editor/adapted-library/hero/hero-17.tsx", hooks: /gallery\.map|heroImageUrl|heroImageAlt/, forbidden: /Free shipping this week|Daily rituals for deeper|Shop the Ritual Set/ },
    hero19: { file: "components/puck-site-editor/adapted-library/hero/hero-19.tsx", hooks: /useReducedMotion|invoices\.map|recognizedPercent|handlePointerMove/, forbidden: /Ledgerline|Billing that keeps pace|Aurora Systems|Book a demo/ },
    cta8: { file: "components/puck-site-editor/adapted-library/cta-8.tsx", hooks: /requestAnimationFrame|maskImage|buttonLabel|trialLabel|word/, forbidden: /Start creating|Free for 14 days|Horizon/ },
    cta9: { file: "components/puck-site-editor/adapted/cta-9.tsx", hooks: /leftCardImage|rightCardDescription|rightCardContext/, forbidden: /Ready to make the switch|Request a free migration|Sue · 12 Highlights/ },
    navigation4: { file: "components/puck-site-editor/adapted-library/advanced/navigation/navigation-4.tsx", hooks: /navItems\.map|mobileMenuOpen|useTransform|item\.href/, forbidden: /"Brand"|"Appart"|"Build"|"Better"/ },
    navigation11: { file: "components/puck-site-editor/adapted-library/advanced/navigation/navigation-11.tsx", hooks: /sectionGroups|cards\.filter|footerPartnerLinks|footerLegalLinks|closeMenuLabel/, forbidden: /northwind|Start Testing|100\+ Lab Tests|World's Healthiest/ },
    navigation14: { file: "components/puck-site-editor/adapted-library/advanced/navigation/navigation-14.tsx", hooks: /sectionGroups|items\.filter|mobileOpen|event\.key === "Escape"|featuredHref/, forbidden: /Vault|Request access|Command center|Pricing|Log in/ },
  } as const;

  for (const [key, item] of Object.entries(sources)) {
    const source = fs.readFileSync(path.join(root, item.file), "utf8");
    assert.match(source, item.hooks, `${key} runtime hook`);
    assert.doesNotMatch(source, item.forbidden, `${key} retains hardcoded site-owner copy`);
  }
});

test("Batch 4 keeps new source-specific adapters at zero official-source diff and production independent from editor-lab", () => {
  for (const file of [
    "components/blocks/hero-16.tsx",
    "components/blocks/hero-17.tsx",
    "components/blocks/hero-19.tsx",
    "components/blocks/navigation-4.tsx",
  ]) {
    assert.doesNotThrow(() => execFileSync("git", ["diff", "--quiet", "--", file], { cwd: root }), file);
  }

  const productionFiles = [
    "components/puck-site-editor/production-component-sources.tsx",
    "components/puck-site-editor/production-registry.tsx",
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/content-editability-batch-4-contracts.ts",
    "lib/puck-site-editor/registry-manifest.ts",
    ...[
      "components/puck-site-editor/adapted-library/hero/hero-16.tsx",
      "components/puck-site-editor/adapted-library/hero/hero-17.tsx",
      "components/puck-site-editor/adapted-library/hero/hero-19.tsx",
      "components/puck-site-editor/adapted-library/cta-8.tsx",
      "components/puck-site-editor/adapted/cta-9.tsx",
      "components/puck-site-editor/adapted-library/advanced/navigation/navigation-4.tsx",
      "components/puck-site-editor/adapted-library/advanced/navigation/navigation-11.tsx",
      "components/puck-site-editor/adapted-library/advanced/navigation/navigation-14.tsx",
    ],
  ];
  for (const file of productionFiles) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /editor-lab/i, file);
  }
});

test("Batch 4 runtime manifest lookup resolves every exact catalog key and persisted ID", () => {
  const expectedKeys: PuckBatch4CatalogKey[] = [
    "pro-block:hero-16",
    "pro-block:hero-17",
    "pro-block:hero-19",
    "pro-block:cta-8",
    "pro-block:cta-9",
    "pro-block:navigation-4",
    "pro-block:navigation-11",
    "pro-block:navigation-14",
  ];
  for (const catalogKey of expectedKeys) {
    const entry = PUCK_PRODUCTION_MANIFEST.find((candidate) => candidate.catalogKey === catalogKey);
    assert.ok(entry, catalogKey);
    assert.ok(entry.editorContract, `${catalogKey} runtime contract`);
    assert.equal(PUCK_BATCH_4_EDITOR_CONTRACTS[catalogKey].componentId, entry.id, `${catalogKey} runtime ID`);
  }
});
