import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const component = new URL("../components/public/LeadsGateForm.tsx", import.meta.url);
const cashPath = new URL("../components/public/cashpath/CashPathSite.tsx", import.meta.url);

test("CashPath starts with only the compact provider-safe fields", async () => {
  const source = await readFile(component, "utf8");
  assert.match(source, /type ShortFormValues = \{ requested_amount: string; email: string; zip: string \}/);
  assert.match(source, /Loan amount/);
  assert.match(source, /Email address/);
  assert.match(source, /ZIP code/);
  assert.doesNotMatch(source.slice(source.indexOf("function CashPathShortForm"), source.indexOf("export default function LeadsGateForm")), /SSN/);
  assert.match(source, /const \[showLongForm, setShowLongForm\] = useState\(!compact\)/);
});

test("the documented Wallet Lines API receives only browser-memory short-form values", async () => {
  const source = await readFile(component, "utf8");
  assert.match(source, /_lgAPIFormV3_\?: ProviderFormApi/);
  assert.match(source, /api\.setValues\(values\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|URLSearchParams/);
  assert.match(source, /https:\/\/apichannels\.com\/form\/applicationInit\.js/);
  assert.match(source, /providerWindow\._lg_form_init_ = \{ aid, template \}/);
});

test("CashPath alone opts into compact LeadsGate while previews remain non-live", async () => {
  const [componentSource, cashPathSource] = await Promise.all([readFile(component, "utf8"), readFile(cashPath, "utf8")]);
  assert.match(cashPathSource, /compactLeadsGate/);
  assert.match(componentSource, /if \(isPreview && compact\)/);
  assert.match(componentSource, /LeadsGate form preview — live requests are disabled/);
});
