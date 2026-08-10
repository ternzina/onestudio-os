import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { PremiumTemplateContract } from "../lib/public-site/premium-template-contract.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import {
  createPremiumTemplateCustomPageRuntimeResolver,
  validatePremiumTemplateCustomPageRuntimeRegistry,
  type PremiumTemplateCustomPageRendererProps,
  type PremiumTemplateCustomPageRuntimeAdapter,
} from "../lib/public-site/premium-template-custom-page-runtime-adapter.ts";
import type { PublicSiteData, PublicSitePage } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

const supportedDefinition = {
  templateKey: "future-custom-page",
  contractVersion: "1.0",
  nativeSections: [],
  customPages: { supported: true },
} as const satisfies PremiumTemplateContract;

const unsupportedDefinition = {
  templateKey: "future-no-custom-page",
  contractVersion: "1.0",
  nativeSections: [],
  customPages: { supported: false },
} as const satisfies PremiumTemplateContract;

let receivedProps: PremiumTemplateCustomPageRendererProps | undefined;
const fakeRenderer = (props: PremiumTemplateCustomPageRendererProps) => {
  receivedProps = props;
  return null;
};

const supportedAdapter = {
  templateKey: supportedDefinition.templateKey,
  definition: { ...supportedDefinition },
  customPageRenderer: fakeRenderer,
} satisfies PremiumTemplateCustomPageRuntimeAdapter;

const definitions = [supportedDefinition, unsupportedDefinition] as const;
const lookup = (templateKey: string) => definitions.find((definition) => definition.templateKey === templateKey);

test("supported custom-page definitions validate, resolve, and preserve renderer identity and props", () => {
  assert.deepEqual(
    validatePremiumTemplateCustomPageRuntimeRegistry([supportedAdapter], definitions, lookup),
    [],
  );
  const resolve = createPremiumTemplateCustomPageRuntimeResolver([supportedAdapter], lookup);
  const resolved = resolve(supportedDefinition.templateKey);
  assert.equal(resolved, supportedAdapter);
  assert.equal(resolved?.customPageRenderer, fakeRenderer);

  const site = {} as PublicSiteData;
  const page = {} as PublicSitePage;
  const props = { site, page, basePath: "/future" };
  fakeRenderer(props);
  assert.deepEqual(receivedProps, props);
  assert.equal(receivedProps?.site, site);
  assert.equal(receivedProps?.page, page);
});

test("custom-page registry rejects duplicate, mismatched, and definitionless adapters", () => {
  assert.match(
    validatePremiumTemplateCustomPageRuntimeRegistry([supportedAdapter, supportedAdapter], definitions, lookup).join(" "),
    /duplicate custom-page runtime/,
  );
  assert.match(
    validatePremiumTemplateCustomPageRuntimeRegistry(
      [{ ...supportedAdapter, templateKey: "wrong" }],
      definitions,
      () => supportedDefinition,
    ).join(" "),
    /does not match definition/,
  );
  assert.match(
    validatePremiumTemplateCustomPageRuntimeRegistry([supportedAdapter], definitions, () => undefined).join(" "),
    /no premium definition/,
  );
  assert.throws(
    () => createPremiumTemplateCustomPageRuntimeResolver([supportedAdapter, supportedAdapter], lookup),
    /Duplicate premium custom-page runtime adapter/,
  );
});

test("supported definitions missing custom-page runtimes fail validation and resolution", () => {
  assert.match(
    validatePremiumTemplateCustomPageRuntimeRegistry([], definitions, lookup).join(" "),
    /supports custom pages but has no custom-page runtime adapter/,
  );
  const resolve = createPremiumTemplateCustomPageRuntimeResolver([], lookup);
  assert.throws(
    () => resolve(supportedDefinition.templateKey),
    /supports custom pages but is missing its custom-page runtime adapter/,
  );
});

test("unsupported definitions need no renderer and reject renderer registration", () => {
  assert.deepEqual(
    validatePremiumTemplateCustomPageRuntimeRegistry([], [unsupportedDefinition], lookup),
    [],
  );
  const resolve = createPremiumTemplateCustomPageRuntimeResolver([], lookup);
  assert.equal(resolve(unsupportedDefinition.templateKey), undefined);

  const unsupportedAdapter = {
    templateKey: unsupportedDefinition.templateKey,
    definition: unsupportedDefinition,
    customPageRenderer: fakeRenderer,
  } satisfies PremiumTemplateCustomPageRuntimeAdapter;
  assert.match(
    validatePremiumTemplateCustomPageRuntimeRegistry([unsupportedAdapter], definitions, lookup).join(" "),
    /registers a custom-page renderer for unsupported premium definition/,
  );
  assert.throws(
    () => createPremiumTemplateCustomPageRuntimeResolver([unsupportedAdapter], lookup),
    /unsupported premium definition/,
  );
});

test("unknown and empty template keys resolve to no custom-page runtime", () => {
  const resolve = createPremiumTemplateCustomPageRuntimeResolver([supportedAdapter], lookup);
  assert.equal(resolve("not-premium"), undefined);
  assert.equal(resolve(null), undefined);
  assert.equal(resolve(undefined), undefined);
});

test("real registry owns the NOIR custom-page renderer and keeps BEMBI/base separate", async () => {
  const [registry, adapter] = await Promise.all([
    read("../lib/public-site/premium-template-custom-page-runtime-registry.ts"),
    read("../lib/public-site/noir-premium-template-custom-page-runtime-adapter.tsx"),
  ]);
  assert.equal(getPremiumTemplateDefinition("premium-studio")?.templateKey, "premium-studio");
  assert.match(registry, /NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER/);
  assert.doesNotMatch(registry, /premium-kids-center|standard/);
  assert.match(adapter, /definition: NOIR_PREMIUM_TEMPLATE_CONTRACT/);
  assert.match(adapter, /customPageRenderer: NoirCustomPage/);
});

test("a second fixed-native custom-page renderer registers without central runtime dispatch changes", async () => {
  const secondDefinition = {
    templateKey: "future-second-custom-page",
    contractVersion: "1.0",
    nativeSections: [],
    customPages: { supported: true },
  } as const satisfies PremiumTemplateContract;
  const secondRenderer = (() => null) satisfies (props: PremiumTemplateCustomPageRendererProps) => null;
  const secondAdapter = {
    templateKey: secondDefinition.templateKey,
    definition: secondDefinition,
    customPageRenderer: secondRenderer,
  } satisfies PremiumTemplateCustomPageRuntimeAdapter;
  const futureDefinitions = [...definitions, secondDefinition];
  const futureLookup = (key: string) => futureDefinitions.find((definition) => definition.templateKey === key);

  assert.deepEqual(
    validatePremiumTemplateCustomPageRuntimeRegistry(
      [supportedAdapter, secondAdapter],
      futureDefinitions,
      futureLookup,
    ),
    [],
  );
  const resolve = createPremiumTemplateCustomPageRuntimeResolver(
    [supportedAdapter, secondAdapter],
    futureLookup,
  );
  assert.equal(resolve(secondDefinition.templateKey), secondAdapter);
  assert.equal(resolve(secondDefinition.templateKey)?.customPageRenderer, secondRenderer);

  const publicRuntime = await read("../components/public/PublicCustomPageRuntime.tsx");
  assert.match(publicRuntime, /getPremiumTemplateCustomPageRuntime\(templateKey\)/);
  assert.doesNotMatch(publicRuntime, /future-second-custom-page/);
});
