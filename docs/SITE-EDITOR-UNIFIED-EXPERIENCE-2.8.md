# Site Editor 2.8 — Unified Editor Experience

Site Editor 2.8 makes Admin locale, canonical block terminology, and overlapping editor actions consistent across Standard and Premium while keeping BEMBI template ownership intact.

## Contracts preserved

- Standard retains all eight canonical custom block kinds and its system-section models, including FAQ.
- BEMBI semantic sections remain template-owned and continue through the BEMBI renderer.
- Premium universal blocks remain limited to `text`, `media_text`, and `columns`; the text/image direction choices are presets over the canonical registry.
- Header, Hero, and Footer remain normalization-protected required blocks.
- FAQ, review, and teacher values remain `string[]` with the existing `·` delimiter contract. Their structured editor serializes back to those strings and never stores rich-text documents inside them.
- Existing long-form scalar fields continue using the established `RichTextEditor` and public rich-text compatibility layer.
- No database field, migration, block kind, renderer unification, payload limit, or responsive visibility field was added.

## Shared editor surface

`EditorChrome.tsx` contains focused block-row, visibility-toggle, inspector-action, and compact-field primitives. Premium consumes these primitives without weakening its capability checks. The template shell, Premium editor, universal settings, rich-text toolbar, typography controls, and Premium media picker consume the existing `AdminI18nProvider` context.

Universal library metadata originates in `PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY`. Premium filters canonical entries by `premiumSupported` and expands only the existing media-position presets.

## Final pass

- Shared inspector groups and Premium universal-block controls now resolve every user-facing label through the active Admin locale.
- Standard home sections, Standard custom-page blocks, and BEMBI custom-page blocks expose the move controls already supported by their reorder handlers. Standard custom-page blocks also expose the existing duplicate and delete actions.
- Navigator and inspector collapse state now changes the desktop workspace grid. Compact block/settings switching remains isolated below the shared `1024px` breakpoint.
- The block library has dialog labelling, initial focus, Escape close, a Tab focus loop, scroll locking, and focus restoration.
- The shared navigator adds an accessible navigation label and tooltips for descriptions and move controls.

The final pass changes editor UI and source contracts only. It adds no migration, production mutation, deployment, template-specific shell, or renderer fork.
