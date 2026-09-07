import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const component = new URL("../components/public/LeadsGateForm.tsx", import.meta.url);
const cashPath = new URL("../components/public/cashpath/CashPathSite.tsx", import.meta.url);

test("CashPath starts with the compact Wallet Lines-aligned fields", async () => {
  const source = await readFile(component, "utf8");
  assert.match(source, /type ShortFormValues = \{ requested_amount: string; email: string; last4ssn: string \}/);
  assert.match(source, /Loan amount/);
  assert.match(source, /Email address/);
  assert.match(source, /Last 4 digits of SSN/);
  assert.match(source, /<select aria-label="Loan amount"/);
  assert.match(source, /\$200 - \$500/);
  assert.match(source, /\$500 - \$1,000/);
  assert.match(source, /\$1,000 - \$2,500/);
  assert.match(source, /\$2,500 - \$5,000/);
  assert.match(source, /requested_amount: "2000"/);
  assert.match(source, /maxLength=\{4\}/);
  assert.match(source, /replace\(\/\\D\/g, ""\)\.slice\(0, 4\)/);
  assert.doesNotMatch(source, /ZIP code|postal-code|\bzip\b/);
  assert.doesNotMatch(source.slice(source.indexOf("function CashPathShortForm"), source.indexOf("export default function LeadsGateForm")), /Full SSN|Social Security number/);
  assert.match(source, /const \[showLongForm, setShowLongForm\] = useState\(!compact\)/);
});

test("the documented Wallet Lines API receives only browser-memory short-form values", async () => {
  const source = await readFile(component, "utf8");
  assert.match(source, /_lgAPIFormV3_\?: ProviderFormApi/);
  assert.match(source, /api\.setValues\(values\)/);
  assert.match(source, /last4ssn/);
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
