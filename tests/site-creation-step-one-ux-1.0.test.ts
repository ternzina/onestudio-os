import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("plain /new-site has no implicit foundation while valid canonical intents are preselected", async () => {
  const page = await read("../app/new-site/page.tsx");
  assert.match(page, /const initialMode: TemplateCreationMode \| null = hasValidBlankIntent \? "blank" : hasValidTemplateIntent \? "template" : null/);
  assert.match(page, /const initialTemplateKey: TemplateKey \| null = initialMode \? requested!\.key : null/);
  assert.match(page, /params\.mode === "blank" && requested\?\.key === "standard"/);
  assert.match(page, /params\.mode === "template" && requested\?\.key !== "standard"/);
  assert.doesNotMatch(page, /requested\?\.capabilities\.customerCreatable \? requested\.key : "standard"/);
});

test("step one requires an explicit, visible, non-advancing choice", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /initialMode: TemplateCreationMode \| null/);
  assert.match(wizard, /initialTemplateKey: TemplateKey \| null/);
  assert.match(wizard, /disabled=\{step === 0 && !hasSelectedFoundation\}/);
  assert.match(wizard, /disabled:cursor-not-allowed disabled:bg-white\/10 disabled:text-white\/30/);
  assert.match(wizard, /if \(step === 0 && !hasSelectedFoundation\) return/);
  assert.match(wizard, /Начать с нуля/);
  assert.match(wizard, /chooseTemplate\("blank", "standard"\)/);
  assert.match(wizard, /chooseTemplate\("template", item\.key\)/);
  assert.match(wizard, /✓ Выбрано/);
  assert.doesNotMatch(wizard, /function chooseTemplate[^}]*setStep/s);
  assert.doesNotMatch(wizard, /onClick=\{\(\) => submit/);
});

test("preview actions stay read-only and preserve every canonical premium route", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /href=\{item\.gallery\.previewRoute\}/);
  assert.match(wizard, /target="_blank"/);
  assert.match(wizard, /rel="noreferrer"/);
  assert.doesNotMatch(wizard, /Посмотреть демо[\s\S]{0,200}\.rpc/);
  assert.equal(TEMPLATE_CATALOG.find(item => item.key === "gloss-nail-studio")?.gallery.previewRoute, "/demos/gloss-nail-studio");
  assert.equal(TEMPLATE_CATALOG.find(item => item.key === "premium-kids-center")?.gallery.previewRoute, "/demos/premium-kids-center");
  assert.equal(TEMPLATE_CATALOG.find(item => item.key === "premium-studio")?.gallery.previewRoute, "/demos/premium-studio");
});

test("creation remains final-submit-only", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.equal((wizard.match(/\.rpc\("create_template_workspace"/g) ?? []).length, 1);
  assert.match(wizard, /async function submit\(event: FormEvent\)/);
  assert.match(wizard, /type="submit"[^>]*disabled=\{submitting\}/);
  assert.match(wizard, />\{submitting \? "Создаём…" : "Создать сайт"\}<\/button>/);
});

test("business type labels are Russian while values preserve the RPC enum", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  const expected = [
    ["photo_studio", "Фотостудия"],
    ["beauty_salon", "Салон красоты"],
    ["school", "Школа / занятия"],
    ["venue", "Площадка / мероприятия"],
    ["creative_service", "Творческие услуги"],
    ["other", "Другой бизнес"],
  ];
  for (const [value, label] of expected) {
    assert.match(wizard, new RegExp(`value: "${value}", label: "${label}"`));
  }
  assert.match(wizard, /key=\{item\.value\} value=\{item\.value\}>\{item\.label\}/);
  assert.match(wizard, /business_type: form\.business_type/);
});
