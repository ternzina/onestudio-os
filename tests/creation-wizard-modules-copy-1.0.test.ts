import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("module values remain canonical while Step 5 uses Russian labels", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");

  assert.match(wizard, /const requiredModules = \["core", "catalog", "scheduling", "crm"\] as const/);
  assert.match(wizard, /const optionalModules: readonly OptionalModule\[\] = \["media", "portfolio", "payments", "notifications", "documents", "analytics"\]/);
  for (const [value, label] of [
    ["core", "Основа системы"], ["catalog", "Каталог услуг"],
    ["scheduling", "Расписание"], ["crm", "Клиенты / CRM"],
  ]) {
    assert.match(wizard, new RegExp(`${value}: "${label}"`));
  }
  for (const [value, label] of [
    ["media", "Медиатека"], ["portfolio", "Портфолио"], ["payments", "Платежи"],
    ["notifications", "Уведомления"], ["documents", "Документы"], ["analytics", "Аналитика"],
  ]) {
    assert.match(wizard, new RegExp(`${value}: "${label}"`));
  }
  assert.match(wizard, /const optionalModuleLabels: Readonly<Record<OptionalModule, string>>/);
});

test("required modules are non-interactive and optional buttons toggle canonical values", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");

  assert.match(wizard, /requiredModules\.map\(module => <span[^>]*>\{requiredModuleLabels\[module\]\}<\/span>\)/);
  assert.doesNotMatch(wizard, /requiredModules\.map\(module => <button/);
  assert.match(wizard, /optionalModules\.map\(module => <button[^>]*key=\{module\} onClick=\{\(\) => toggleModule\(module\)\}[^>]*>\{optionalModuleLabels\[module\]\}<\/button>\)/);
  assert.match(wizard, /enabled_modules: \[\.\.\.optionalModules\]/);
  assert.match(wizard, /function toggleModule\(module: OptionalModule\).*form\.enabled_modules\.includes\(module\).*form\.enabled_modules\.filter\(value => value !== module\).*\[\.\.\.form\.enabled_modules, module\]/);
});

test("count, dependency expansion, and RPC payload contract are preserved", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");

  assert.match(wizard, /const enabledCount = useMemo/);
  assert.match(wizard, /if \(expanded\.has\("portfolio"\)\) expanded\.add\("media"\)/);
  assert.match(wizard, /if \(expanded\.has\("notifications"\)\) expanded\.add\("payments"\)/);
  assert.match(wizard, /if \(expanded\.has\("documents"\)\) \{ expanded\.add\("payments"\); expanded\.add\("notifications"\); \}/);
  assert.match(wizard, /const enabledModules = \[\.\.\.requiredModules, \.\.\.form\.enabled_modules\]/);
  assert.match(wizard, /\.rpc\("create_template_workspace"/);
  assert.match(wizard, /enabled_modules: enabledModules/);
});

test("Step 5 copy is customer-friendly and does not render raw module identifiers", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  const stepFive = wizard.match(/\{step === 4 \? <div>(.*?) : null\}/s)?.[1] ?? "";

  assert.match(stepFive, /Основные модули включены автоматически/);
  assert.match(stepFive, /Дополнительные можно отключить сейчас или изменить позже в настройках/);
  assert.match(stepFive, /Сейчас будет включено: \{enabledCount\}/);
  assert.doesNotMatch(stepFive, />\{module\}<\/button>/);
  assert.doesNotMatch(stepFive, /Обязательные: core, catalog, scheduling, crm/);
  for (const moduleId of ["core", "catalog", "scheduling", "crm", "media", "portfolio", "payments", "notifications", "documents", "analytics"]) {
    assert.doesNotMatch(stepFive, new RegExp(`>${moduleId}<`));
  }
});
