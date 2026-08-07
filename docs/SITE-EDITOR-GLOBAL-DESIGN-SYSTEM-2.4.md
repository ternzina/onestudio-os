# Site Editor Global Design System 2.4

## Purpose

Global Design System 2.4 extends the existing OneStudio public-site theme without replacing `theme_accent`, `theme_dark` or `theme_surface`.

The design layer is intentionally sparse. Missing settings mean **inherit the original template design**.

## Runtime precedence

1. Template original design
2. Existing global palette (`theme_accent`, `theme_dark`, `theme_surface`)
3. `design_system` typography / buttons / cards
4. Per-section colors (`section_colors`)
5. System Section Settings 2.3 (`system_section_settings`)

## Controls

### Typography
- body font: template / system / humanist / editorial
- heading font: template / system / humanist / editorial
- heading weight: template / regular / medium / semibold / bold
- heading tracking: template / tight / normal / wide

### Buttons
- radius: template / square / soft / rounded / pill
- shadow: template / none / soft / strong

### Cards
- radius: template / square / soft / rounded
- border: template / none / subtle / strong
- shadow: template / none / soft / strong

## Compatibility contract

- Existing sites with no `design_system` keep their current appearance.
- Choosing “Из шаблона” is normalized back to a sparse object and does not impose new visual defaults.
- Standard and GLOSS use the shared runtime.
- `premium-kids-center` / BEMBI remains isolated in its existing premium `HomeExperience` runtime and is not visually modified by 2.4.
- Draft and publish continue through the existing `save_public_site_draft` / `publish_public_site` flow.

## Database

Migration:

`20260807100000_site_editor_global_design_system_2_4.sql`

Adds:

`normalize_public_site_design_system(jsonb)`

and extends the compatibility `save_public_site_draft` wrapper to preserve normalized `design_system` state.

No table is added and no existing published content is rewritten.

## Test

`onestudio-site-editor-global-design-system-2-4-tests.sql`

24 pgTAP assertions cover valid tokens, invalid token removal, sparse inheritance, template reset semantics and normalization.

## UX refinement (2026-08-07)

The global design controls now open in a dedicated 360px inspector beside the live site preview instead of requiring the full-screen Site Settings dialog.

- The canvas stays visible while colors, typography, button shape and card style change.
- The top-level control is named **Дизайн сайта**.
- Colors and design controls are grouped into collapsible sections.
- Common button/card choices use familiar visual presets; fine controls live under **Дополнительно / Точная настройка**.
- **Вернуть дизайн шаблона** clears the sparse `design_system` override.
- **Все настройки сайта…** still opens the existing full Site Settings dialog for SEO, languages, analytics and other infrequent settings.
- Selecting a page/block returns the right inspector to block settings.
- Premium template runtime remains isolated and is not restyled by Global Design System 2.4.
