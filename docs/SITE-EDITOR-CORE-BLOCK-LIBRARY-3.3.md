# Site Editor Core Block Library & Unified Block Experience 3.3

## Audit findings

OneStudio already had one useful universal-block architecture: `PublicSiteCustomBlock`, its registry/factory, Supabase normalization, standard and Premium renderers, `SharedEditorInspector`, and Premium editor/runtime adapters. Standard, GLOSS, NOIR and VELORA store universal blocks in `content.custom_blocks`; BEMBI intentionally keeps its working `template_content.blocks[].props.universal_block` adapter. Save normalizes draft JSON and Publish copies the saved draft. The 3.2.7 wrapper separately preserves `native_action_styles`.

The visible weak spots were the eight technical choices in Add Block, English-only registry copy, no business-oriented starter presets, no safe HTML/embed primitive, and no lightweight spacer. Standard and Premium editors already reused rich text, typography, media, composition and unified action components, but their library presentation and some inspector construction differed.

## Architecture

`PUBLIC_SITE_CORE_BLOCK_LIBRARY` is the user-facing catalog. A preset has a stable semantic `preset_id`, category, bilingual label/description and an existing universal `kind`. `createPublicSiteCoreBlockPreset` fills the normal shared block with useful starter content. The preset is creation metadata, not a new persistence schema or renderer. Old blocks without `preset_id` remain unchanged.

The catalog is grouped into Business, Social proof, Content, Conversion and Advanced:

- Business: About, Services, Team, Pricing / Packages, Contact
- Social proof: Portfolio, Gallery, Reviews, FAQ
- Content: Text, Text + Media, Cards, Video
- Conversion: Call to Action / CTA
- Advanced: HTML / Embed, Spacer / Divider

About, Contact and Text + Media use `media_text`; services, team, prices, reviews, FAQ and generic cards use `columns`; portfolio/gallery use existing multi-media primitives; CTA uses the shared action contract. Semantic identity lets navigator/editor copy describe “About” instead of exposing only `media_text`.

## Shared editor contract

Common blocks continue through the existing rich heading/body editors, `TypographyControls`, `SiteEditorMediaField`, media-layout fields, `BlockCompositionEditor`, `SiteEditorActionField`, shared button appearance and `SharedEditorInspector` field model. Controls are capability-driven. The normal lifecycle—add, visibility, reorder, duplicate, delete, reset where supported, undo/redo, Save, reload and Publish—operates on the same serializable block object.

Premium templates keep their own CSS, tokens, canvas and native sections. Shared blocks are rendered by the existing template adapters/runtimes, so GLOSS, BEMBI, NOIR and VELORA retain their visual identity. There is no per-template database schema and BEMBI persistence was not rewritten.

## HTML / Embed security model

HTML / Embed provides two deliberately separate inputs:

- safe HTML, capped at 20,000 characters and restricted to common headings, paragraphs, lists, links, images and structural markup;
- one HTTPS iframe URL with a client-visible title and a height clamped to 180–900px.

The shared sanitizer removes scripts, styles, iframes from HTML source, forms, object/embed plugins, SVG/MathML/template metadata, inline event handlers, inline styles, `srcdoc`, unsafe URL schemes and unsupported tags/attributes. Normalization sanitizes at the persistence boundary and the public runtime sanitizes again immediately before its narrowly scoped `dangerouslySetInnerHTML` call. The container constrains width and overflow. The separate iframe is lazy, responsive, referrer-restricted and sandboxed with bounded permissions. `javascript:`, insecure HTTP and executable data URLs are rejected. Arbitrary JavaScript and script-based third-party widgets are intentionally unsupported.

## Spacer / Divider

Spacer is a minimal universal block with compact, normal or airy vertical space and an optional theme-colored divider. It uses the shared visibility/order/lifecycle and layout container; it introduces no separate subsystem.

## Persistence and compatibility

Migration `20260813160000_site_editor_core_block_library_3_3.sql` wraps the current 3.0 custom-block normalizer. It preserves all prior normalized fields and adds only bounded `preset_id`, HTML/embed and spacer fields. The current Save wrapper—including Premium Native Button Persistence 3.2.7—remains the entry point and is not replaced or weakened. Publish still copies the saved draft. No old drafts are rewritten merely because presets exist.

The migration is required because the database normalizer is an explicit allow-list: without an additive wrapper it would convert the two new kinds to `text` and discard their new fields. It must be reviewed/applied through the normal release process; this implementation does not apply it remotely.

## Intentional limits

HTML blocks cannot execute JavaScript, submit arbitrary forms, inject CSS, render active SVG, use iframe `srcdoc`, or run script-based Custom Code. Embed support prioritizes HTTPS iframe-compatible forms, maps, calendars, booking tools and videos; services that require injected scripts need a future privileged feature.
