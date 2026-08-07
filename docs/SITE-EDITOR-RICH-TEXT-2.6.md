# Site Editor Rich Text 2.6

Rich Text 2.6 adds familiar inline formatting to custom block body text without introducing a third-party editor dependency.

## Scope

- bold, italic and underline
- bulleted and numbered lists
- left, center and right alignment
- links
- text color
- clear formatting
- plain-text fallback mode
- live editor preview and public runtime rendering

## Storage

Existing `PublicSiteCustomBlock.text` remains a string. Plain legacy strings stay valid. Formatted values are stored as a versioned JSON document prefixed with `__osrt1__:`. No database migration is required.

The public renderer never injects stored HTML. It decodes the versioned document and renders an allow-listed React tree, which keeps the runtime safe even if stored content is malformed.

## Compatibility

- existing plain-text blocks render exactly as before
- premium template routing is not changed
- no schema migration
- no new npm dependency
