# Premium Template Package 1.0

## Single registration source

`lib/public-site/premium-template-package-source.mjs` is the only manually maintained package list. Each entry contains a serializable manifest and five project-root-relative module/export bindings: synchronous seed, contract, editor adapter, public-home runtime adapter and custom-page runtime adapter. `PremiumTemplateKey`, `TemplateKey`, `TEMPLATE_KEYS`, package lookup, library/new-site choices and `/demos` metadata are derived from its generated manifest tuple.

Adding a package requires creating its package-owned implementation modules and adding exactly one entry to `PREMIUM_TEMPLATE_PACKAGE_SOURCE`. For example, a package normally adds:

- `<package>-premium-template-seed.ts`
- `<package>-premium-template-contract.ts`
- `<package>-premium-template-editor-adapter.ts`
- `<package>-premium-template-runtime-adapter.ts`
- `<package>-premium-template-custom-page-runtime-adapter.ts`

The package key is not added manually to any central capability map. The previous `satisfies Record<PremiumTemplateKey, …>` maps only reported missing keys after a manifest edit; they did not create or connect bindings and therefore were not automatic registration.

## Deterministic generated registries

Run:

```sh
npm run generate:premium-templates
npm run check:premium-templates
```

The small deterministic generator in `scripts/premium-template-package-generator.mjs` produces these checked-in files:

- `premium-template-package-catalog.ts` — data-only manifests and inferred key union
- `premium-template-seed-registry.ts` — synchronous seed imports only
- `premium-template-registry.ts` — contract imports only
- `premium-template-editor-registry.ts` — editor adapter imports only
- `premium-template-runtime-registry.ts` — public-home runtime imports only
- `premium-template-custom-page-runtime-registry.ts` — custom-page runtime imports only

`npm run check:premium-templates` fails when any generated output is stale. It runs before `npm test` and `npm run build`; the package test also compares every generated file byte-for-byte, so direct `node --test tests/*.test.ts` fails on stale output too.

## Capability and Next.js boundaries

The registration source contains strings and data, never runtime imports. The generated manifest entrypoint imports only manifest helpers. `template-catalog.ts` is a serializable metadata/capability view: catalog records contain no seed functions and its runtime graph cannot reach seed, editor or public-renderer implementations. Navigation helpers such as `newSitePathForTemplate` therefore remain safe for Client Component catalog consumers.

Creation and seed orchestration lives separately in `template-creation.ts`. Its `resolveCreationContract` validates catalog capabilities and resolves `createTemplateSeed` synchronously, preserving the wizard's synchronous seed payload without exposing that capability through the catalog module. Public adapter modules own top-level, literal `next/dynamic` calls, keeping renderer paths statically analyzable and lazy. Public registries do not reach editor adapters, editor schemas or admin components; the editor registry does not reach public renderers.

`tests/premium-template-import-graph.test.ts` uses the TypeScript compiler AST to walk the real transitive local graph. It recognizes single-line and multiline static imports, value re-exports, mixed type/value clauses and literal dynamic imports, while excluding `import type`, `export type` and type-only specifiers. Relative paths and `@/` aliases are resolved. Dedicated fixtures prove multiline and dynamic edges are followed and type-only edges are omitted. Assertions cover both catalogs, the `/demos` Client Component entry, both public runtime registries and the editor registry, including exclusion of the canonical source/generator from client runtime graphs.

## Third-package proof

`tests/premium-template-package-1.0.test.ts` defines one temporary AURORA source entry whose bindings point to package-owned fixture modules and appends that one entry to the real NOIR/GLOSS source. The production generator creates temporary capability registries from the resulting source. The test imports those generated registries and calls the production manifest, contract, editor, public-home, custom-page, seed, catalog and demo builders/lookups. It verifies AURORA metadata and implementations, fail-closed unknown keys, isolation from NOIR/GLOSS and exclusion of BEMBI.

## Compatibility and BEMBI

GLOSS and NOIR retain their keys, routes, preview copy, seed behavior, contracts, editor controls, lazy public renderers and persistence formats. `layout_order`, custom blocks and `template_content` continue to round-trip without a migration.

BEMBI (`premium-kids-center`) remains intentionally outside this registry because it is a separate protected template/runtime with its own lifecycle and `bembi.biz` behavior. Its explicit protected demo entry remains unchanged; it is not a universal premium package.
