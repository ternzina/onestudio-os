import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TEMPLATE_CATALOG, getCustomerTemplateChoices } from "../lib/public-site/template-catalog.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("step one guidance is selection-gated and preserves deliberate navigation", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /\{hasSelectedFoundation \? <div role="status"/);
  assert.match(wizard, /✓ Основа сайта выбрана/);
  assert.match(wizard, /Нажмите «Продолжить», чтобы перейти к настройке бизнеса\./);
  assert.match(wizard, /function chooseTemplate[^}]*setMode\(nextMode\)[^}]*setTemplateKey\(nextKey\)/s);
  assert.doesNotMatch(wizard, /function chooseTemplate[^}]*setStep/s);
  assert.equal((wizard.match(/onClick=\{next\}/g) ?? []).length, 1);
  assert.equal((wizard.match(/>Продолжить<\/button>/g) ?? []).length, 1);
});

test("service, pricing, and resource labels are Russian while enum values remain canonical", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  const collections = [
    ["serviceKinds", [
      ["appointment", "Запись по времени"], ["rental", "Аренда"], ["class", "Занятие / курс"],
      ["event", "Мероприятие"], ["membership", "Абонемент"], ["other", "Другое"],
    ]],
    ["pricingModels", [
      ["fixed", "Фиксированная цена"], ["per_hour", "За час"], ["per_person", "За человека"],
      ["free", "Бесплатно"], ["quote", "Цена по запросу"],
    ]],
    ["resourceKinds", [
      ["staff", "Сотрудник / мастер"], ["space", "Помещение / зал"], ["equipment", "Оборудование"],
      ["seat", "Место"], ["asset", "Другой ресурс"], ["other", "Другое"],
    ]],
  ] as const;

  for (const [name, labels] of collections) {
    assert.match(wizard, new RegExp(`const ${name}: ReadonlyArray`));
    for (const [value, label] of labels) {
      assert.match(wizard, new RegExp(`value: "${value}", label: "${label}"`));
    }
    assert.match(wizard, new RegExp(`${name}\\.map\\(item => <option[^>]*value=\\{item\\.value\\}>\\{item\\.label\\}`));
  }

  assert.match(wizard, /service_kind: form\.service_kind/);
  assert.match(wizard, /pricing_model: form\.pricing_model/);
  assert.match(wizard, /resource_kind: form\.resource_kind/);
});

test("template cards remain catalog-driven and responsive to future entries", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  const choices = getCustomerTemplateChoices();
  const hypotheticalAdditionalChoice = { ...choices[0], key: "future-catalog-entry" };
  const futureChoices = [...choices, hypotheticalAdditionalChoice];

  assert.equal(futureChoices.length, choices.length + 1);
  assert.match(wizard, /const templateGroups = getCustomerTemplateGroups\(\)/);
  assert.match(wizard, /templateGroups\[access\]\.map\(item =>/);
  assert.doesNotMatch(wizard, /templateGroups\[access\]\.(slice|splice)\(/);
  assert.match(wizard, /grid gap-5 md:grid-cols-2 lg:grid-cols-3/);
  assert.deepEqual(TEMPLATE_CATALOG.map(item => item.key), [
    "standard", "align-pilates-studio", "gloss-nail-studio", "premium-kids-center", "lumea-beauty", "premium-studio", "velora-event-venue", "vow-films",
  ]);
});

test("first-service guidance explains later expansion without relaxing required fields", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /Добавьте первую услугу и ресурс\. Остальные можно будет создать позже в рабочем пространстве\./);
  assert.match(wizard, /!form\.service_title\.trim\(\) \|\| !form\.resource_name\.trim\(\)/);
});
