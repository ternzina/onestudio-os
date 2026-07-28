# Public Site Foundation 1.0

Public Site Foundation turns a configured workspace into a publishable,
server-rendered business site without duplicating catalog, portfolio or company
data.

## Public routes

- `/site/[businessSlug]` renders the primary published language.
- `/site/[businessSlug]/[locale]` renders another published language.
- `/book/[businessSlug]` remains the canonical booking flow.

Unknown, suspended and unpublished workspaces return no public projection.
Published locale routes include canonical and language-alternate metadata.
Published routes are added to the generated sitemap.

## Draft and publication contract

- `public_site_settings` stores workspace publication state and the primary
  locale.
- `public_site_locales` stores separate draft and published snapshots for each
  language.
- Saving a draft never changes the visitor-facing snapshot.
- Publishing copies one locale draft to its immutable live snapshot.
- Unpublishing hides every public locale without deleting drafts or the last
  published snapshots.

All table access is private. The browser reads public content only through
`get_public_site`, which returns a deliberately limited projection.

## One source of truth

The public projection reads:

- identity and locale from `businesses`;
- contact details from `company_profiles`;
- public active offers from `services`;
- selected work from `portfolio_projects` and `media_library`;
- feature availability from `business_modules`.

Disabling Portfolio removes it from the public projection. Disabling Scheduling
removes the booking capability. Draft section switches can hide a section
without modifying its source records.

## Tenant isolation

The legacy media and portfolio tables now carry `business_id`. Existing records
are assigned to the stable installation workspace; new records are written
under the current workspace. Composite foreign keys prevent categories,
projects and media from being linked across businesses. Anonymous table access
is removed, and authenticated reads and writes are protected by workspace RLS.

R2 uploads use a workspace prefix:

`businesses/<business-id>/portfolio/...`

R2 synchronization imports only objects under the active workspace prefix.

## Administration

`/admin/site` provides:

- locale drafts;
- primary-language selection;
- hero, section, navigation and SEO copy;
- section visibility controls;
- a draft preview;
- explicit save, publish and unpublish actions;
- a stable public link.

The first workspace launch receives a locale draft automatically. A clean
Client Launch rename refreshes the untouched default draft, while later custom
drafts remain unchanged.

## Verification

`onestudio-public-site-foundation-tests.sql` verifies:

- draft privacy and RPC permissions;
- publication and unpublication behavior;
- locale fallback and multiple published languages;
- service and portfolio filtering;
- disabled-module behavior;
- sitemap projection;
- cross-workspace isolation for public data, media and portfolio;
- editor authorization.
