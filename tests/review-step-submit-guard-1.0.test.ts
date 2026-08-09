import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Continue is a guarded navigation control and cannot become the final submit control", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  const nextHandler = wizard.match(/function next\([^)]*\) \{(.*?)\n\n  async function submit/s)?.[1] ?? "";

  assert.match(wizard, /<button key="continue" type="button" onClick=\{next\}[^>]*>Продолжить<\/button>/);
  assert.match(nextHandler, /event\.preventDefault\(\)/);
  assert.doesNotMatch(nextHandler, /submit\(|create_template_workspace|\.rpc\(/);
  assert.match(wizard, /step < stages\.length - 1 \? <button key="continue"/);
  assert.match(wizard, /: <button key="create-site" type="submit" data-action="create-site"/);
  assert.notEqual(wizard.indexOf('key="continue"'), wizard.indexOf('key="create-site"'));
});

test("only an explicit final create-button submission can reach workspace creation", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");

  assert.match(wizard, /event\.preventDefault\(\);\n    const submitter = \(event\.nativeEvent as SubmitEvent\)\.submitter;/);
  assert.match(wizard, /if \(step !== stages\.length - 1 \|\| !\(submitter instanceof HTMLButtonElement\) \|\| submitter\.dataset\.action !== "create-site"\) return;/);
  assert.equal((wizard.match(/type="submit"/g) ?? []).length, 1);
  assert.equal((wizard.match(/\.rpc\("create_template_workspace"/g) ?? []).length, 1);
  assert.match(wizard, /step === 5 \? <div[^>]*><h2[^>]*>Проверка перед созданием<\/h2>/);
  assert.match(wizard, /\{submitting \? "Создаём…" : "Создать сайт"\}/);
});
