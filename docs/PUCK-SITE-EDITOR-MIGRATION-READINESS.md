# Puck Site Editor migration readiness

Status: **ADAPTER_REQUIRED / NOT_READY for production migration**
Scope: Phase 7 read-only architecture audit; no production data, RPC, public
runtime, routing, domain, demo, template, or deployment changes were made.

## Decision

Puck V3 is ready to continue as a bounded editor pilot, but it is not a
drop-in replacement for the current OneStudio Site Editor. The correct path is
an additive adapter, not a rewrite of `PublicSiteContent` or the established
template runtimes.

The lab proves a strong authoring surface: an official-source-first block
library, safe adapted props, native inline editing, responsive field values,
style transfer/presets, history, iframe interaction and local draft recovery.
Production still owns capabilities that the lab intentionally does not:
workspace authorization, locale drafts, tenant media uploads, SEO, database
normalization, publish confirmation, custom-domain routing, and protected
template runtimes.

## Current production storage and publish path

| Stage | Current contract | Evidence |
| --- | --- | --- |
| Editor load | `get_public_site_editor` returns locale `draft_content` / `published_content`; `contentFromLocale` chooses draft first | `app/admin/site/page.tsx` |
| Client model | `PublicSiteContent` is the typed document with `template_id`, `template_content`, `custom_blocks`, `pages`, `layout_order`, SEO and system-section fields | `lib/public-site/types.ts` |
| History | `replaceDraft` and grouped history retain whole `PublicSiteContent` snapshots | `app/admin/site/page.tsx` |
| Save | `saveDraft` canonicalizes template layout, validates media, calls `save_public_site_draft`, and verifies template/layout/action-style round trips | `app/admin/site/page.tsx` |
| Database | `public_site_locales.draft_content` and `published_content` are JSONB objects protected behind RPC/RLS | `supabase/migrations/20260728170000_public_site_foundation_1_0.sql` |
| Normalization | the current save pipeline is a chain of allow-listing compatibility wrappers; the last wrapper explicitly preserves `native_action_styles` | `supabase/migrations/20260813090000_premium_native_action_persistence_3_2_7.sql` |
| Publish | `publish_public_site` copies the normalized `draft_content` to `published_content` without a second content transform | `supabase/migrations/20260728170000_public_site_foundation_1_0.sql` |
| Public read | `get_public_site` returns published JSON as `site.content`, plus tenant capabilities, services and portfolio | `supabase/migrations/20260728170000_public_site_foundation_1_0.sql` |
| Public render | `PublicSiteTemplateRuntime` resolves the template and dispatches to a registered Premium renderer or Standard runtime | `components/public/PublicSiteTemplateRuntime.tsx` |

An unrecognized top-level Puck document would currently be lost during save:
the SQL pipeline rebuilds the content from explicit keys, and later wrappers
preserve specific namespaces. JSONB capacity is not the blocker; normalization
and public rendering are. This is why direct lab-to-RPC wiring is unsafe.

## Additive adapter design

Introduce a versioned, bounded optional namespace only after an explicit SQL
normalizer and round-trip gate exist:

```ts
type PublicSitePuckDocument = {
  schema_version: "1.0";
  registry_version: string;
  pages: Record<string, {
    puck_data: { root: { props: Record<string, unknown> }; content: unknown[] };
  }>;
};

type PublicSiteContentWithPuck = PublicSiteContent & {
  puck_document?: PublicSitePuckDocument;
};
```

Required adapter boundaries:

1. `PuckDataAdapter.toEditor(content, pageId)` creates bounded Puck `Data`
   from `puck_document` and never guesses from native template JSX.
2. `PuckDataAdapter.toPublicSiteContent(data, previous)` validates component
   types/props against a versioned allow-list and updates only
   `puck_document`.
3. `save_public_site_draft` gains a bounded `normalize_public_site_puck_document`
   wrapper and the client gains an exact round-trip check, matching existing
   `template_content` and `layout_order` safeguards.
4. `PuckPublicRenderer` imports the production component registry and runtime
   hosts, not `Puck`, `editor-lab`, inspector fields or editor navigation
   guards.
5. A per-workspace/per-page feature gate selects the Puck renderer. Existing
   Standard/Premium/BEMBI/VELORA documents remain on their current path.
6. Publish remains unchanged after normalized draft persistence: it continues
   to copy the saved draft exactly.

Do not serialize callbacks, React nodes, refs, raw shaders, arbitrary nested
objects, editor-only host metadata, preview state, selection state or history.
Persist only allow-listed component ids and serializable props.

## Puck versus current Site Editor

| Capability | Puck V3 lab | Current Site Editor | Migration implication |
| --- | --- | --- | --- |
| Visual component composition | Strong | Strong for system/native/custom blocks | Puck can pilot additive pages |
| Inline safe text editing | Proven on 18 adapted blocks | Inspector/native editor paths | Puck advantage for adapted content |
| Properties/search/grouping | Proven; searchable fields | Shared inspector | Productize shared contracts |
| Responsive editing | Desktop/tablet/mobile plus inherit/override/reset | Device preview and template controls | Needs production mobile QA |
| Undo/redo | Native Puck history | Whole-document grouped history | Define save/history boundary |
| Style copy/paste/presets | Proven in lab | Template-specific/shared controls | Safe only for metadata-allow-listed style props |
| Media selection | Existing OneStudio media library field is reused | Tenant-aware shared media workflow | Picker reusable; upload context unresolved in lab |
| Media upload | Deferred | Production workflow owns business/category writes | Must expose a tenant-safe upload service, not reuse the portfolio endpoint blindly |
| Alt text | No eligible adapted semantic alt prop in this phase | Supported where production contracts define it | Add only per proven source prop |
| Draft persistence | Versioned localStorage pilot | Supabase locale JSONB/RPC | Adapter and SQL normalizer required |
| Publish | Deliberately deferred | Permissioned save-review-publish flow | Keep existing flow |
| SEO/locales/domains | Not present | Production-ready | Must remain production-owned |
| Template-native interactions | React Bits iframe QA proven | BEMBI and package runtimes proven | Do not flatten native templates into Puck |
| Registry/source provenance | Official React Bits source + explicit adapters | OneStudio template registries | Production registry must be versioned and allow-listed |

## Media and alt decision

- Picker: **REUSE_EXISTING_PICKER** via `SiteEditorMediaField`,
  `MediaLibraryPicker` and `media_library`.
- Upload: **DEFER_UPLOAD_WITH_EXACT_REASON**. The currently discovered
  `/api/admin/portfolio/upload` contract requires a portfolio category and
  creates portfolio-category links. The Puck page editor has no proven category
  selection contract; choosing one implicitly would contaminate tenant
  portfolio state.
- Alt-capable adapted media fields in this phase: **0**.
- Alt fields implemented in this phase: **0**. Existing hard-coded official
  alt values are not exposed as editable props unless the adapted source
  contract proves a semantic alt slot.

## Existing templates and demos

### BEMBI (`premium-kids-center`)

BEMBI is a protected core runtime, excluded from the generated package
registry and customer creation. It persists native content in its existing
`template_content` namespace and renders through `PremiumTemplateEditor`,
`HomeExperience` and BEMBI custom-page routes. It is **COEXIST_ONLY** for the
pilot. No automatic Puck conversion is safe or necessary.

### VELORA (`velora-event-venue`)

VELORA has a generated Premium contract, editor adapter, seed, public-home
runtime, custom-page runtime and normalized `layout_order`. It is
**ADAPTER_POSSIBLE_LATER**, but excluded from the first Puck pilot so its
cinematic interactions, native sections and package namespace remain intact.

### Other current demos/templates

Standard remains on `PublicBusinessSite`. The generated package registry
currently covers BLOOM, PAWHAUS, RITMO, ALIGN, GLOSS, NOIR, VELORA, VOW,
LUMEA, RASTEM and BLACKLINE with paired editor/public contracts. They remain
the source of truth. A future Puck page may coexist as a new versioned page
document; it must not rewrite seeds, native `template_content`, demo routes or
custom-domain resolution.

## Lab debt classification

| Classification | Paths | Action after pilot gate |
| --- | --- | --- |
| PROMOTE | `components/editor-lab/puck/` contracts for fields, arrays, nested content, forms, visual/layout/motion/style metadata and runtime host | Move to a production-neutral builder namespace with import-boundary tests |
| PROMOTE | official-source adapters selected for the pilot | Move only audited adapters; retain source provenance and default-fidelity tests |
| KEEP_LAB | `app/editor-lab/puck-v3`, `components/editor-lab/puck-v3` | Keep as isolated QA/review harness until Supabase adapter E2E passes |
| KEEP_LAB | `reactbits-free-showcase` and direct routes needed for GPU/pointer fidelity | Retain while they are the independent direct-vs-Puck oracle |
| DELETE_LATER | Fast Batch 1–12 route shells and duplicate direct preview plumbing | Remove only after registry contract tests and replacement review surfaces exist |
| KEEP | official `components/react-bits` sources | Never fold editor behavior into official source |

No lab files are deleted in Phase 7.

## Migration readiness hard gate

Production migration is **NOT_READY** until all items below pass:

- versioned `puck_document` type, size/depth limits and component/prop allow-list;
- SQL normalizer plus draft and publish round-trip tests;
- public renderer that has no editor-lab dependency;
- tenant-safe media upload service and permission tests;
- locale, SEO, routing, custom-domain and page-path integration tests;
- Standard pilot page E2E in preview and published runtime;
- BEMBI and every package demo unchanged under visual/runtime regression;
- mobile editing usability and accessibility pass;
- rollback/feature-flag plan and existing-document fallback;
- security review for URL fields, HTML/embed blocks and registry version skew.

Recommended pilot: one non-production Standard workspace, one locale, one
feature-gated Puck-managed page, no template migration and no automatic publish.

## Phase 7 verdict

- Puck editor implementation: **PILOT_CAPABLE**.
- Existing production Site Editor: **RETAIN AS SYSTEM OF RECORD**.
- Direct replacement: **NO**.
- Additive adapter: **YES, REQUIRED**.
- Production migration readiness: **NOT_READY**.
