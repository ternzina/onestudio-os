# Site Editor Visual Controls 2.2

Status: implementation package for branch `feature/site-editor-visual-controls-2.2`.

## Scope

Visual controls apply to custom blocks on the home page and on custom public pages.

- tablet preview alongside desktop and phone preview;
- content width: full, wide, medium, narrow;
- independent top and bottom spacing;
- minimum section height;
- media height override while preserving the existing aspect-ratio mode;
- reveal animations: fade, rise, scale;
- separate switch to disable reveal animation on mobile;
- draft and published persistence through the custom-block normalizer;
- reduced-motion support and no-animation fallback on mobile;
- pgTAP coverage for accepted and rejected persisted values.

## Compatibility

Existing blocks keep their current appearance through defaults:

- width: `wide`;
- top and bottom spacing: `normal`;
- section height: `auto`;
- media height: `auto`;
- animation: `none`;
- mobile animation: enabled.

No table is added. The migration only extends validation of JSON content already stored in `public_site_locales`.
