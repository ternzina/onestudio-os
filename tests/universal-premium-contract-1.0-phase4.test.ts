import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { PremiumTemplateContract } from "../lib/public-site/premium-template-contract.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import {
  createPremiumTemplateRuntimeResolver,
  validatePremiumTemplateRuntimeAdapterRegistry,
  type PremiumTemplateRuntimeAdapter,
} from "../lib/public-site/premium-template-runtime-adapter.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const noopRenderer = () => null;

const futureDefinition = {
  templateKey: "future-runtime",
  contractVersion: "1.0",
  nativeSections: [],
} as const satisfies PremiumTemplateContract;

const futureAdapter = {
  templateKey: futureDefinition.templateKey,
  definition: futureDefinition,
  publicHomeRenderer: noopRenderer,
} satisfies PremiumTemplateRuntimeAdapter;

test("real premium definition and public runtime registry resolve NOIR only", async () => {
  const [registry, noirAdapter] = await Promise.all([
    read("../lib/public-site/premium-template-runtime-registry.tsx"),
    read("../lib/public-site/noir-premium-template-runtime-adapter.tsx"),
  ]);
  assert.equal(getPremiumTemplateDefinition("premium-studio")?.templateKey, "premium-studio");
  assert.equal(getPremiumTemplateDefinition("unknown"), undefined);
  assert.match(registry, /NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER/);
  assert.doesNotMatch(registry, /premium-kids-center|gloss-nail-studio|standard/);
  assert.match(noirAdapter, /templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT\.templateKey/);
  assert.match(noirAdapter, /publicHomeRenderer: PremiumStudioExperience/);
});

test("generic runtime validation rejects duplicate, mismatched, and definitionless adapters", () => {
  const lookup = (key: string) => key === futureDefinition.templateKey ? futureDefinition : undefined;
  assert.deepEqual(validatePremiumTemplateRuntimeAdapterRegistry([futureAdapter], [futureDefinition], lookup), []);
  assert.match(validatePremiumTemplateRuntimeAdapterRegistry([futureAdapter, futureAdapter], [futureDefinition], lookup).join(" "), /duplicate runtime/);
  assert.match(validatePremiumTemplateRuntimeAdapterRegistry([{ ...futureAdapter, templateKey: "wrong" }], [futureDefinition], () => futureDefinition).join(" "), /does not match definition/);
  assert.match(validatePremiumTemplateRuntimeAdapterRegistry([futureAdapter], [futureDefinition], () => undefined).join(" "), /no premium definition/);
});

test("known premium definitions missing public runtimes are configuration errors", () => {
  const lookup = (key: string) => key === futureDefinition.templateKey ? futureDefinition : undefined;
  assert.match(validatePremiumTemplateRuntimeAdapterRegistry([], [futureDefinition], lookup).join(" "), /has no public runtime adapter/);
  const resolve = createPremiumTemplateRuntimeResolver([], lookup);
  assert.throws(() => resolve("future-runtime"), /missing its public runtime adapter/);
  assert.equal(resolve("not-premium"), undefined);
  assert.equal(resolve(undefined), undefined);
});

test("a future second template registers, resolves, and identifies its renderer generically", () => {
  const lookup = (key: string) => key === futureDefinition.templateKey ? futureDefinition : undefined;
  let received: { site: PublicSiteData; basePath: string } | undefined;
  const futureRenderer = (props: { site: PublicSiteData; basePath: string }) => {
    received = props;
    return null;
  };
  const invokableAdapter = { ...futureAdapter, publicHomeRenderer: futureRenderer };
  const resolve = createPremiumTemplateRuntimeResolver([invokableAdapter], lookup);
  assert.equal(resolve("future-runtime"), invokableAdapter);
  assert.equal(resolve("future-runtime")?.publicHomeRenderer, futureRenderer);
  const site = {} as PublicSiteData;
  futureRenderer({ site, basePath: "/future" });
  assert.deepEqual(received, { site, basePath: "/future" });
  assert.equal(resolve("other"), undefined);
  assert.throws(() => createPremiumTemplateRuntimeResolver([futureAdapter, futureAdapter], lookup), /Duplicate/);
  assert.throws(() => createPremiumTemplateRuntimeResolver([{ ...futureAdapter, definition: { ...futureDefinition, templateKey: "mismatch" } }], lookup), /does not match/);
  assert.throws(() => createPremiumTemplateRuntimeResolver([futureAdapter], () => undefined), /no premium definition/);
});

test("NOIR public runtime preserves site and basePath renderer props without central dispatch", async () => {
  const [adapter, runtime] = await Promise.all([
    read("../lib/public-site/noir-premium-template-runtime-adapter.tsx"),
    read("../components/public/PublicSiteTemplateRuntime.tsx"),
  ]);
  assert.match(adapter, /PremiumStudioExperience/);
  assert.match(runtime, /getPremiumTemplatePublicRuntime\(templateKey\)/);
  assert.match(runtime, /<PremiumHomeRenderer site=\{site\} basePath=\{basePath\}/);
  assert.doesNotMatch(runtime, /PremiumStudioExperience|templateKey === ["']premium-studio/);
});

test("NOIR editor canvas remains a client-only dynamic registration with the same props", async () => {
  const [registry, editor] = await Promise.all([
    read("../lib/public-site/premium-template-editor-canvas-registry.tsx"),
    read("../app/admin/site/page.tsx"),
  ]);
  assert.match(registry, /^"use client";/);
  assert.match(registry, /dynamic\([\s\S]*import\("@\/app\/demos\/premium-studio\/PremiumStudioExperience"\)[\s\S]*ssr: false/);
  assert.match(registry, /\["premium-studio", NoirEditorCanvasRenderer\]/);
  assert.match(registry, /content: PublicSiteContent;[\s\S]*basePath: string/);
  assert.match(editor, /getPremiumTemplateEditorCanvasRenderer\(draft\.template_id\)/);
  assert.match(editor, /<PremiumEditorCanvasRenderer content=\{draft\} basePath="#"/);
  assert.doesNotMatch(editor, /import\("@\/app\/demos\/premium-studio\/PremiumStudioExperience"\)/);
  assert.doesNotMatch(editor, /draft\.template_id === ["']premium-studio["']/);
});
