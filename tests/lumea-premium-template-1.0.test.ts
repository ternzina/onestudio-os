import assert from "node:assert/strict";
import test from "node:test";
import { LUMEA_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/lumea-premium-template-contract.ts";
import { createLumeaPremiumTemplateSeed } from "../lib/public-site/lumea-premium-template-seed.ts";
import { resolveLumeaContent } from "../lib/public-site/lumea-premium-template-content.ts";
import { createCanonicalLumeaDemoSite } from "../lib/public-site/lumea-demo.ts";
import { LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/lumea-premium-template-editor-adapter.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";

test("LUMEA contract exposes canonical editable sections", () => {
  assert.equal(LUMEA_PREMIUM_TEMPLATE_CONTRACT.templateKey, "lumea-beauty");
  assert.deepEqual(
    LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map((section) => section.id),
    ["hero", "services", "booking", "experts", "gallery", "reviews", "contact", "footer"],
  );
  assert.equal(LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections[0].pinning, "start");
  const footer = LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find(
    (section) => section.id === "footer",
  );
  assert.equal(
    footer && "pinning" in footer ? footer.pinning : undefined,
    "end",
  );
  assert.equal(LUMEA_PREMIUM_TEMPLATE_CONTRACT.customPages?.supported, true);
});

test("LUMEA seeds RU and EN content in its own namespace", () => {
  const ru = createLumeaPremiumTemplateSeed("ru");
  const en = createLumeaPremiumTemplateSeed("en");
  assert.equal(ru.template_id, "lumea-beauty");
  assert.equal(en.template_id, "lumea-beauty");
  assert.match(resolveLumeaContent(ru).hero.title, /Красота/);
  assert.match(resolveLumeaContent(en).hero.title, /Beauty/);
  assert.equal(ru.layout_order?.length, 8);
  assert.ok(ru.template_content?.["lumea-beauty"]);
});

test("LUMEA demo carries bookable services", () => {
  const demo = createCanonicalLumeaDemoSite("ru");
  assert.equal(demo.services.length, 4);
  assert.equal(demo.capabilities.booking, true);
  assert.equal(demo.business.currency, "UAH");
});

test("LUMEA is generated into package, contract, runtime and editor registries", () => {
  assert.equal(getPremiumTemplatePackage("lumea-beauty")?.name, "LUMÉA Beauty Studio");
  assert.ok(getPremiumTemplateDefinition("lumea-beauty"));
  assert.ok(getPremiumTemplatePublicRuntime("lumea-beauty"));
  assert.ok(getPremiumTemplateEditorAdapter("lumea-beauty"));
});

test("LUMEA inspector uses shared media and typography field types", () => {
  const seed = createLumeaPremiumTemplateSeed("ru");
  const fields = LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: seed,
    sectionId: "hero",
    disabled: false,
    onChange: () => undefined,
    onChooseMedia: () => undefined,
  });
  assert.ok(fields.some((field) => field.type === "media"));
  assert.ok(fields.some((field) => field.type === "typography"));
});
