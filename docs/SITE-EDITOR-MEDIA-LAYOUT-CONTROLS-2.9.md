# Site Editor 2.9 — Media & Layout Controls

Site Editor 2.9 introduces one canonical media-layout vocabulary for Standard custom blocks, BEMBI universal blocks, and built-in section backgrounds. The same values drive the inspector, editor preview, and public runtime.

## Controls

Supported media blocks can expose:

- desktop size, aspect, height, fit, focal point, frame, corner radius, opacity and overlay;
- image/text placement and collage alignment where the block supports it;
- multi-image columns and gap for collages;
- mobile aspect, height, fit, focal point, image/text order and image columns;
- a shared ordered media-list editor with add, replace, move and remove actions.

The capability registry decides which controls each block receives. Native template-owned semantic sections remain unchanged. System background images use the shared fit, focal-point, opacity, overlay and mobile overrides without imposing custom-block framing or dimensions.

## Runtime contract

`PublicSiteMediaLayoutSettings` is the persisted flat contract. `publicSiteMediaVariables` converts it into bounded `--os-media-*` variables. Standard preview, `PublicCustomBlock`, `PublicSliderBlock`, BEMBI universal blocks and system backgrounds consume those variables through the shared `os-managed-media-*` classes.

Legacy background position and overlay presets are bridged to focal-point and overlay values when explicit 2.9 values are absent. Existing drafts therefore retain their visual intent.

## Persistence and safety

Migration `20260811223000_site_editor_media_layout_controls_2_9.sql` wraps the existing custom-block and system-section normalizers. It validates enum tokens, clamps numeric percentages to `0…100`, keeps system settings sparse, and preserves the previous normalization pipeline. Premium template content remains inside its existing bounded template namespace. Saving a draft does not publish it.

## Defaults

New media blocks use soft corners, centered focal points, full opacity and no overlay. New collages default to four desktop columns and two mobile columns; media + text defaults to placing media after text on mobile. Missing values in older drafts resolve to equivalent runtime fallbacks.

## Validation

The 2.9 regression suite covers token bounds, shared capabilities, inspector fields, Standard/Premium wiring, public runtime consumption and SQL normalization. The complete project test, typecheck, lint and production build commands are the release gate.
