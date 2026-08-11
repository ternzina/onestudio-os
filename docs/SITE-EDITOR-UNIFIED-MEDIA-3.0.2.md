# Site Editor Unified Media 3.0.2

## Outcome

Demo/template images and manually added images use one OneStudio-owned media field. A customer sees the same preview, URL input, media-library action and reset action regardless of how the block was created.

## Shared interface

`SiteEditorMediaField` is rendered directly by the shared inspector `media` field type and reused by Standard blocks, universal Premium blocks, cards, sliders/collages and GLOSS structured controls. BEMBI native slots, NOIR nested content paths and VELORA content paths all emit that same inspector contract instead of template-owned picker buttons.

Template media includes an `originalValue`. The field therefore shows `Original` or `Changed` and restores that one image without resetting the rest of the section. Manually assembled media has no package original, so the same secondary action safely clears it.

## Persistence and compatibility

Each adapter continues to write through its existing durable content boundary:

- Standard and universal blocks use their canonical block media properties;
- GLOSS uses existing root content fields and indexed image arrays;
- BEMBI uses its sparse `native_media.urls` overrides;
- NOIR and VELORA update their existing template-content paths.

No existing image is rewritten during installation, no public page changes until the draft is published, and no database migration is required.
