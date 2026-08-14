import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getCustomerTemplateChoices,
  getTemplateCatalogRecord,
  templateAccessLabel,
} from "../lib/public-site/template-catalog.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical customer catalog owns explicit FREE and PREMIUM access", () => {
  assert.equal(getTemplateCatalogRecord("gloss-nail-studio")?.access, "free");
  assert.equal(getTemplateCatalogRecord("premium-kids-center")?.access, "premium");

  const noir = getTemplateCatalogRecord("premium-studio");
  assert.equal(noir?.name, "NOIR FRAME — Premium Photo Studio");
  assert.equal(noir?.access, "premium");

  const velora = getTemplateCatalogRecord("velora-event-venue");
  assert.equal(velora?.name, "VELORA HOUSE");
  assert.equal(velora?.access, "premium");

  assert.equal(templateAccessLabel("free", "en"), "Free");
  assert.equal(templateAccessLabel("free", "ru"), "Бесплатно");
  assert.equal(templateAccessLabel("premium", "en"), "Premium");
  assert.equal(templateAccessLabel("premium", "ru"), "Premium");
});

test("access never derives from a technical key, alias, or tier", () => {
  const records = getCustomerTemplateChoices();
  assert.equal(records.find(({ key }) => key === "gloss-nail-studio")?.access, "free");
  assert.equal(records.some(({ key }) => key === "premium-kids-center"), false);
  assert.equal(records.find(({ key }) => key === "premium-studio")?.access, "premium");
  assert.equal(records.every(({ access }) => access === "free" || access === "premium"), true);
});

test("demos and new-site derive customer access from canonical catalog metadata", async () => {
  const [demos, chooser] = await Promise.all([
    read("../app/demos/page.tsx"),
    read("../app/new-site/CanonicalSiteCreationWizard.tsx"),
  ]);

  assert.match(demos, /getPublicDemoTemplateChoices/);
  assert.match(chooser, /getCustomerTemplateGroups/);
  for (const source of [demos, chooser]) {
    assert.match(source, /item\.access|template\.access/);
    assert.match(source, /templateAccessLabel/);
    assert.doesNotMatch(source, /key\.includes\(["']premium|slug\.includes\(["']premium|startsWith\(["']premium/);
  }
  assert.doesNotMatch(demos, /PREMIUM_DEMOS|demo\.slug ===|lumiere.*gloss-nail-studio/);
});
