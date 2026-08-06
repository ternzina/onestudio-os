# Site Editor System Sections 2.3

Date: 2026-08-06

## Goal

Extend the visual controls from custom blocks to the built-in public-site sections while preserving every template's existing appearance until a user explicitly changes a setting.

## Editor controls

Built-in sections now support:

- default or panel composition;
- full, wide, medium or narrow content width;
- independent top and bottom spacing;
- minimum section height;
- left, center or right text alignment;
- template, custom-color, image or transparent background;
- background image position and overlay strength;
- none, fade, rise or scale reveal animation;
- mobile animation switch;
- independent visibility on desktop, tablet and mobile.

The generic controls are shown for standard sections. The hero keeps its existing dedicated controls.

## Preview and public rendering

The editor preview and both public renderers use the same shared settings helpers:

- `lib/public-site/system-sections.ts`
- `components/public/PublicReveal.tsx`

Supported public sections:

- services;
- portfolio;
- booking;
- about;
- team;
- reviews;
- membership;
- gift certificates;
- FAQ;
- safety;
- contacts.

The public renderers preserve each template's original spacing, alignment and background until the corresponding setting is explicitly edited.

## Persistence and validation

Migration `20260806213000_site_editor_system_sections_2_3.sql` adds:

- `normalize_public_site_system_section_settings(jsonb)`;
- sparse validation of known section settings;
- safe media URL normalization for section backgrounds;
- preservation of `system_section_settings` through `save_public_site_draft`.

Unknown section names are discarded. Invalid values fall back safely. Unchanged keys are not materialized, so template defaults remain intact.

## Tests

`onestudio-site-editor-system-sections-2-3-tests.sql` covers:

- all accepted visual values;
- invalid-value fallbacks;
- unsafe background URLs;
- unknown section removal;
- sparse persistence and inherited template spacing.

## Files

- `app/admin/site/page.tsx`
- `app/globals.css`
- `components/public/GlossBusinessSite.tsx`
- `components/public/PublicBusinessSite.tsx`
- `components/public/PublicReveal.tsx`
- `lib/public-site/system-sections.ts`
- `lib/public-site/types.ts`
- `supabase/migrations/20260806213000_site_editor_system_sections_2_3.sql`
- `supabase/tests/onestudio-site-editor-system-sections-2-3-tests.sql`
