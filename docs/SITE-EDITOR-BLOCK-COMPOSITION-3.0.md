# Site Editor Block Composition 3.0

Block Composition 3.0 adds one shared, opt-in internal layout contract to canonical universal blocks in Standard and Premium templates.

## Compatibility contract

- Existing blocks do not receive `composition_enabled` and continue through their established renderer behavior.
- No existing draft, published site, template namespace, image, or block order is rewritten by the migration.
- Composition is enabled per block. Disabling it returns the block to its template layout without deleting the saved advanced values.
- Standard and Premium keep their separate visual renderers while sharing the composition types, inspector, responsive tokens, validation, and behavioral tests.

## Controls

Desktop and mobile can independently configure:

- stack, split, or grid layout where the block kind supports it;
- one to four desktop columns and one or two mobile columns;
- column ratio for split compositions;
- element gap, alignment, and text alignment;
- vertical or horizontal cards;
- ordered eyebrow, heading, text, media, cards, and action slots;
- card order through the existing structured card editor.

The available layout choices and order slots are kind-aware. For example, `media_text` exposes split/stack composition and continues to use the Site Editor 2.9 media-placement controls, while `columns` and `features` expose card-grid controls.

## Runtime

`lib/public-site/block-composition.ts` resolves bounded defaults and emits responsive CSS variables. Public renderers add `data-os-composition="enabled"` only when the stored opt-in flag is true. `app/globals.css` therefore cannot affect legacy blocks.

The Standard canvas preview, Standard public runtime, BEMBI Premium canvas/public runtime, and universal blocks embedded in other Premium templates consume the same contract.

## Persistence

Migration `20260811235500_site_editor_block_composition_3_0.sql` wraps the existing 2.9 custom-block normalizer. It accepts only bounded enum values, one to four desktop columns, one or two mobile columns, and a deduplicated allow-listed element order. It does not update rows or publish drafts.

## Verification

- focused Block Composition 3.0 unit/contract tests;
- legacy Site Editor 2.8 and Media & Layout 2.9 regression tests;
- full Node test suite;
- TypeScript;
- ESLint;
- Next.js production build;
- pgTAP migration contract when a linked/local Supabase test database is available.
