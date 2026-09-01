# Puck Site Editor pilot rollout and rollback

Status: **READY_FOR_SITE_EDITOR_PILOT** (local/test, additive foundation)

This decision authorizes a bounded pilot only. It does not authorize a
production migration, database migration, tenant write, public-route switch,
deployment, or replacement of the current Site Editor.

## Architecture and ownership

The pilot adds an optional `puck_document` to the existing
`PublicSiteContent` shape. Version 1 is deterministic JSON, validated against
the `onestudio-puck-1` allow-list, bounded by document size/depth/component
limits, and rejects unknown identifiers, arbitrary props, functions, unsafe
objects, and unsupported versions.

The dependency direction is:

```text
production-safe document + manifest + renderer + adapters
                         ↑
                editor/lab QA routes
```

Production-safe modules do not import `editor-lab`, Fast Batch routes, Control
routes, or the Puck QA harness. The editor preview and public pilot renderer
use the same production block registry.

SEO, canonical URLs, robots, OG data, structured data, tenant/domain
resolution, and the current page metadata remain owned by the existing
OneStudio runtime. They are not stored in arbitrary Puck component props.

## Pilot scope

The versioned production manifest currently contains eight deduplicated,
proven blocks under product-facing taxonomy:

- Navigation 12
- Hero 14
- CTA 9
- Pricing 3
- Social Proof 10 (Gallery)
- Scheduling 3
- Contact 6
- Glow Cursor (Free Visuals)

Blocked, direct-only, dev/core QA, Ballpit, unsafe-runtime entries, aliases,
and unknown physical duplicates are excluded.

The local fixture contains one instance of each item and exercises adapted
content, arrays, media, layout width, mobile override, motion metadata,
interactive controls, save/reload, publish transformation, and public render.

## Feature flag and entry points

Flag: `PUCK_SITE_EDITOR_PILOT`

Default: **OFF**. Only `1` or `true` enables the gated admin pilot route.

- Current editor: `/admin/site` (unchanged and always the fallback)
- Authenticated pilot: `/admin/site/puck-pilot`
- Authenticated pilot preview: `/admin/site/puck-pilot/preview`
- Local E2E fixture: `/editor-lab/puck-pilot`
- Local public-render fixture: `/editor-lab/puck-pilot/public`

The admin pilot inherits the existing admin authentication layout. Workspace
identity is resolved server-side through `list_my_businesses`; neither the
editor nor preview accepts a client-selected `businessId`. Locale is bounded
to the pilot RU/EN contract and persists independently per tenant, locale, and
page id.

## Storage and publish boundary

Current production storage remains
`public_site_locales.draft_content` / `published_content`. The current
`save_public_site_draft` and `publish_public_site` functions are unchanged.
Legacy content without `puck_document` continues to normalize and render as
before.

The committed SQL file
`20260901090000_puck_site_editor_pilot_foundation.sql` is a **migration draft**.
It defines an isolated, permission-checked save function that updates only the
optional `puck_document` key. It was not applied locally or remotely and must
not be applied without a separate rollout approval and database review.

For this foundation task:

- localStorage is the browser E2E persistence adapter;
- the in-memory repository proves tenant/locale isolation and permissions;
- save verifies a validated JSON round-trip;
- publish is a pure draft-to-published snapshot plus local simulation;
- no production RPC executed and no tenant row was written.

## Generic media upload adapter

The tenant-safe adapter reuses the established 30 MB and image MIME
conventions, writes under
`businesses/{businessId}/site-editor/...`, inserts one `media_library` record,
and returns a serializable URL/path. It never chooses a portfolio category and
never creates a portfolio record/link.

It is dependency-injected and tested locally. It is not yet exposed as a
production API route, so no schema change is required for the adapter itself.

## Existing templates and demos

- **BEMBI (`premium-kids-center`) — COEXIST_ONLY.** Its protected native
  editor, `template_content`, custom pages, demo, and public runtime stay
  authoritative.
- **VELORA (`velora-event-venue`) — UNCHANGED / ADAPTER_POSSIBLE_LATER.** Its
  Premium contract, cinematic interactions, native sections, seeds, and
  routes are not converted.
- **GLOSS (`premium-nail-studio`) — PREMIUM UNCHANGED.** It remains on the
  generated Premium editor/public contracts; the Puck pilot is an additive
  page-document path only.
- **Standard (`standard`) — UNCHANGED.** Standard pages keep the current Site
  Editor and `PublicBusinessSite` runtime. A future explicitly selected pilot
  page may carry `puck_document` alongside the legacy fields.

No demo seed, template package, existing page, or public content is migrated.
Custom-domain routing remains upstream and unchanged.

## Local E2E evidence

The pilot was exercised in a normal Chrome session:

1. Loaded the eight-block fixture in the Puck editor.
2. Edited Hero text and media URL.
3. Changed layout width and mobile width override.
4. Edited two Pricing array records.
5. Edited a Navigation array record.
6. Saved and reloaded; all edits persisted.
7. Ran publish simulation; a validated published snapshot was created.
8. Opened the public pilot renderer; published edits rendered without editor
   chrome.
9. Exercised public controls, including Scheduling select interaction.

Browser errors were zero. The only Puck console notice was its known
informational message that runtime style injection was skipped because the
styles were already loaded.

## Tablet and mobile authoring

- **Tablet (768 px): PASS for pilot.** Both sidebars, Properties, viewport
  controls, save, publish, and preview remain reachable. The central preview
  is narrow while both panels are open, but either panel can be collapsed.
- **Mobile (390 px): PASS for bounded pilot.** Puck switches to compact
  Blocks/Outline/Fields tabs; the preview, save action, viewport controls, and
  selected block Properties remain usable with no horizontal body overflow.
- **Deferred:** full mobile UX polish, larger touch targets, accessibility
  audit, and production device matrix. These do not block the desktop/tablet
  pilot and do block any claim of general production migration readiness.

## Controlled rollout procedure

1. Use only an explicitly approved non-production workspace and one pilot
   page/locale; take a current content export first.
2. Keep `PUCK_SITE_EDITOR_PILOT` OFF globally. Enable it only in the isolated
   test environment.
3. Confirm `/admin/site` still loads the current editor before opening the
   pilot route.
4. Run document, boundary, persistence, tenant, locale, renderer, and HTTP
   tests against the exact build.
5. If database persistence is desired later, review and apply the isolated
   draft migration in a disposable environment first; verify legacy save and
   publish byte-for-byte behavior before any production approval.
6. Save and publish only the approved pilot fixture/page. Never auto-convert
   existing `PublicSiteContent`, template content, demos, or domain routes.
7. Compare editor preview and public pilot render at desktop, tablet, and
   mobile widths before expanding the allow-list or workspace cohort.

## Rollback procedure

Rollback is immediate and non-destructive:

1. Set `PUCK_SITE_EDITOR_PILOT` to OFF (or remove it).
2. Restart the affected application environment.
3. Verify `/admin/site` serves the current Site Editor and the pilot route
   reports disabled/redirects to the current editor.
4. Continue serving the existing `published_content` through the unchanged
   Standard/Premium/domain runtime.

No reverse content migration is required: existing legacy fields were never
rewritten, and an optional `puck_document` is ignored by the current runtime.
If the isolated SQL draft is ever applied, revoking/dropping only
`save_public_site_puck_draft` is sufficient; do not delete locale rows or
rewrite stored legacy content.

## Hard boundaries after this phase

- Production migration readiness remains a separate decision.
- The feature flag stays default OFF.
- No production table rewrite, row write, routing switch, push, PR, deploy, or
  automatic content conversion is part of this phase.
- Fast Batch and Control review routes can be renamed or removed only after
  their remaining QA consumers are replaced; production core already has no
  dependency on them.
