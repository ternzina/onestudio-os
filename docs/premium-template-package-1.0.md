# Premium Template Package 1.0

`PremiumTemplatePackage` is the canonical unit for universal premium templates. Each entry combines a serializable `manifest` (stable key, library/catalog/Preview metadata, compatibility, capabilities, sections and assets) with typed `bindings` (default-content factory, universal contract, editor adapter, public-home adapter and custom-page adapter).

## Registration

The only registration point is `PREMIUM_TEMPLATE_PACKAGES` in `lib/public-site/premium-template-package-catalog.ts`. NOIR and GLOSS each have one entry there. The former contract, editor, home-runtime and custom-page registries are compatibility views derived from this catalog; the general template catalog also derives its NOIR/GLOSS records from the package manifests.

To add another universal premium template:

1. Implement its existing-style contract and adapters.
2. Add one `definePremiumTemplatePackage(...)` entry to `PREMIUM_TEMPLATE_PACKAGES`.
3. Supply stable persistence/schema compatibility metadata, a default factory, native section IDs, custom-block and SEO capabilities, Preview route/image and owned asset references.
4. Run the package contract test, all universal premium phase tests, TypeScript and the production build.

That one entry automatically feeds the template library, template catalog, Preview metadata, editor lookup, public home lookup, custom-page lookup and universal contract lookup. Public renderers remain dynamically imported so registering runtime bindings does not eagerly place template presentation code in the administrative client chunk.

Unknown keys resolve to no premium package and therefore receive no premium contract or adapter. Keys, routes and persisted content remain unchanged; factories wrap the existing GLOSS and NOIR seed/content functions rather than introducing a migration.

## BEMBI exclusion

BEMBI (`premium-kids-center`) deliberately remains outside `PREMIUM_TEMPLATE_PACKAGES`. It is a protected, separate runtime with its existing catalog record, routes, data and explicit public runtime handling. The package regression test enforces this boundary.
