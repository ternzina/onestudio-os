# Premium Template Package 1.0

The canonical registration is the serializable `PREMIUM_TEMPLATE_PACKAGE_MANIFESTS` catalog in `premium-template-package-catalog.ts`. A manifest owns the stable template key, aliases, library behavior, persistence compatibility, capabilities, native section IDs, assets and all `/demos` preview copy. It contains data only: no functions, React components, Next.js helpers, seeds, editor schemas or runtime adapters.

## Registration and keys

`PremiumTemplateKey` is inferred from the manifest tuple. `TemplateKey`, `TEMPLATE_KEYS`, the general template catalog, library choices, new-site choices and package lookup are derived from that source. Package templates use `{ kind: "premium-package" }`; there is no closed GLOSS/NOIR adapter union and no `legacyAdapter` that can misroute a new design through an existing implementation. Unknown identities fail closed.

Adding a third package means adding one manifest entry with its own stable key and implementing the capabilities declared by it. Capability registries are exhaustive `Record<PremiumTemplateKey, …>` values, so TypeScript reports every missing seed, contract, editor, public-home or custom-page binding as soon as the manifest is registered. No second hand-maintained key union or permissive fallback exists.

## Capability boundaries

Bindings are split by execution capability:

- `premium-template-seed-registry.ts` contains synchronous seed factories used by the current creation wizard.
- `premium-template-registry.ts` contains universal contracts only.
- `premium-template-editor-registry.ts` contains editor adapters and schemas only.
- `premium-template-runtime-registry.ts` contains public-home adapters and statically analyzable `next/dynamic` renderer loaders.
- `premium-template-custom-page-runtime-registry.ts` does the same for public custom pages.

Manifest consumers therefore cannot pull React or implementation code. Public runtime entrypoints have no import path to editor adapters, editor schemas or admin components; editor lookup does not import public renderers. The public renderer imports remain lazy. This split also avoids circular imports: capability registries depend on the manifest-derived key type and contracts, never on each other.

## Demo metadata

`preview` explicitly defines `collectionVisible`, `group`, localized title/description/alt text, route, image and stable order, alongside palette metadata. `/demos` derives package cards from these fields, not from commercial `library.tier` and not from template-key branches. Thus standard-tier GLOSS and premium-tier NOIR both appear with their own copy. A future package cannot inherit NOIR, GLOSS or BEMBI labels accidentally.

## Persistence and BEMBI

GLOSS and NOIR keep their existing keys, routes, seed implementations, contract behavior and persistence formats. No migration is involved; `layout_order`, custom blocks and `template_content` remain round-trippable.

BEMBI (`premium-kids-center`) intentionally remains outside the premium package manifest registry. Its protected runtime, routes, content and `bembi.biz` behavior are unchanged. A separate explicit demo record preserves its existing catalog presence without claiming package membership.
