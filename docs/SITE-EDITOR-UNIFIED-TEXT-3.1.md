# Site Editor Unified Text 3.1

Unified Text 3.1 completes the existing Rich Text and Heading Typography 2.6 layers. It does not add another editor shell.

## Shared interface

- Scalar text, multiline text and rich text all render through `SiteEditorTextField` inside the shared inspector.
- Template-owned text exposes `Original` / `Changed` and restores only the selected field.
- Manually assembled blocks use the same field component and can clear their own value.
- Media, layout, ordering and unrelated text remain untouched by a text restore.

## Shared typography

- Rich text and local heading typography use one allow-list of twenty safe font families.
- Existing `template`, `system`, `humanist` and `editorial` values remain valid for compatibility.
- Base, GLOSS, BEMBI, NOIR and VELORA apply local heading typography in editor preview and public runtime.
- Missing typography stays sparse, so untouched templates retain their original CSS exactly.

## Persistence

- Base/GLOSS/custom blocks/custom pages continue using the established `heading_typography` and `title_typography` fields.
- BEMBI continues using its per-block `heading_typography` namespace.
- NOIR and VELORA store sparse per-native-section `headingTypography` maps inside their bounded `template_content` namespaces.
- Migration `20260812003000_site_editor_unified_text_3_1.sql` expands only the existing typography validator.
