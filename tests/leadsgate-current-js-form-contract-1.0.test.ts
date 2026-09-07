import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("LeadsGate runtime follows the current Wallet Lines JS form contract", async () => {
  const source = await readFile(new URL("../components/public/LeadsGateForm.tsx", import.meta.url), "utf8");
  assert.match(source, /https:\/\/apichannels\.com\/form\/applicationInit\.js/);
  assert.doesNotMatch(source, /https:\/\/apichannels\.com\/form\/app2\/actionInit\.js/);
  assert.match(source, /https:\/\/apichannels\.com\/form\/track\.js/);
  assert.match(source, /providerWindow\._lg_form_init_ = \{ aid, template \}/);
  assert.match(source, /providerWindow\._lg_track_init_ = \{ aid: Number\(aid\) \}/);
  assert.doesNotMatch(source, /_lg_track_init\s*=/);
  assert.match(source, /target\.id = "_lg_form_"/);
  assert.match(source, /loadScript\(FORM_SCRIPT, "onestudio-leadsgate-form"\)\.then\(\(\) => \{/);
  assert.match(source, /\}\)\.catch\(\(\) => \{\n\s+if \(!cancelled\) target\.textContent/);
  assert.match(source, /void loadScript\(TRACK_SCRIPT, "onestudio-leadsgate-track"\)\.catch\(\(\) => \{\}\)/);
  assert.doesNotMatch(source, /Promise\.all\(/);
});

test("LeadsGate keeps form failure and preview behavior safely isolated", async () => {
  const source = await readFile(new URL("../components/public/LeadsGateForm.tsx", import.meta.url), "utf8");
  assert.match(source, /The request form is temporarily unavailable\. Please try again later\./);
  assert.match(source, /isPreview \|\| !showLongForm \|\| initialized\.current \|\| !\/\^\\d\{1,12\}\$\//);
  assert.match(source, /pathname\.startsWith\("\/admin"\).*pathname\.startsWith\("\/site-preview"\).*pathname\.startsWith\("\/demos\/"\)/s);
  assert.match(source, /LeadsGate form preview — live requests are disabled in the editor\./);
  assert.match(source, /initialized\.current = true/);
  assert.match(source, /"wallet-lines"/);
});
