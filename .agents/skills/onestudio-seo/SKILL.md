---
name: onestudio-seo
description: Use this skill when planning, auditing, implementing, testing, or releasing SEO work for OneStudio OS, including metadata, canonicals, sitemap, robots, structured data, internal linking, SEO pages, Journal articles, demos, tenant SEO, custom domains, IndexNow, Google Search Console, Bing, and search visibility.
---

# OneStudio SEO

## Purpose

Improve OneStudio OS search visibility without breaking:

- tenant routing
- custom domains
- Site Editor
- public client sites
- sitemap behavior
- indexing controls
- production release safety

Always inspect the current repository before changing SEO code.

Do not rely on an old route list, old file path, previous branch, or previous conversation when the current repository says otherwise.

## Two SEO surfaces

OneStudio has two different SEO surfaces.

### Platform

Canonical platform:

`https://onestudioos.com`

### Tenant sites

Tenant sites may use:

- OneStudio hosted routes
- their own custom domains

Never apply platform canonical rules blindly to tenant sites.

Never canonicalize a tenant custom domain to `onestudioos.com`.

Never canonicalize OneStudio platform pages to a tenant domain.

## Canonical platform host

The canonical platform host is exactly:

`https://onestudioos.com`

Do not create canonical platform URLs on:

- `www.onestudioos.com`
- `http://onestudioos.com`
- `*.vercel.app`
- preview deployment domains
- technical deployment hosts
- tenant custom domains

## Language architecture

The canonical indexed OneStudio marketing site currently uses English URLs without `/en`.

Do not create `/en` or `/ru` SEO routes unless implementing a complete multilingual SEO architecture.

A client-side language switch is not enough reason to create duplicate indexed language URLs.

If multilingual SEO is introduced later, define:

- canonical behavior
- hreflang behavior
- locale routing
- sitemap behavior
- duplicate-content protection

as one coherent system.

## Current SEO sources of truth

Discover current paths before editing.

Important files may include:

- `app/_seo/platform.ts`
- `app/_seo/site.ts`
- `app/sitemap.ts`
- `app/robots.ts`
- `lib/seo/features.ts`
- `lib/seo/solutions.ts`
- `lib/seo/journal-articles.ts`
- `lib/demo-catalog.ts`
- `lib/public-site/template-catalog.ts`
- `lib/public-site/premium-template-package-catalog.ts`
- `lib/public-site/metadata.ts`
- `lib/public-site/premium-route-metadata.ts`
- `lib/public-site/indexnow.ts`
- domain normalization and routing files
- SEO and IndexNow regression tests

Do not create a second frozen list of routes if an existing registry can be reused.

## Before making changes

Report:

- current branch
- current HEAD
- `origin/main`
- worktree status
- target SEO surface
- exact SEO problem
- expected files to change

Do not make production changes from a feature branch.

Do not deploy unless explicitly requested.

## Search data

Never invent:

- keyword volume
- traffic
- CTR
- ranking positions
- backlink counts
- competitor traffic
- search demand

Use live data when available from sources such as:

- Google Search Console
- Bing Webmaster Tools
- Semrush
- Serpstat
- Keyword.com

If data is too sparse to support a decision, say so.

For a young SEO property, prioritize technical correctness and useful pages before producing large quantities of content.

## Page quality

Every indexable page must have a genuine purpose.

Avoid doorway pages.

Do not create many nearly identical pages by replacing only an industry, service, or city name.

Useful SEO pages normally include:

- clear search intent
- focused H1
- useful introduction
- real OneStudio capabilities
- realistic workflow
- relevant internal links
- relevant demo when useful
- FAQ only when it adds real information
- truthful structured data when appropriate

Never invent:

- customer results
- conversion improvements
- rankings
- revenue gains
- testimonials
- customer counts

Do not claim functionality OneStudio does not actually provide.

## Titles and metadata

Inspect the root title template before writing page titles.

Do not duplicate the brand suffix.

Avoid output such as:

`Page | OneStudio OS | OneStudio OS`

Each canonical page should have:

- descriptive title
- useful meta description
- correct canonical
- correct robots behavior

Do not keyword-stuff.

## Headings

Use one clear H1 for the primary page topic.

Use H2 and H3 structure to help humans understand the page.

Do not use headings merely to repeat keywords.

## Canonicals

Platform canonical URLs must use:

`https://onestudioos.com/...`

Self-canonical platform pages must point to the canonical platform host.

Never use:

- Vercel deployment URLs
- preview URLs
- tenant domains

as platform canonicals.

## Tenant and custom-domain safety

When changing platform SEO, verify tenant behavior remains unchanged.

When changing tenant SEO, verify:

- publication status
- `seo_no_index`
- custom-domain canonical
- tenant sitemap
- primary locale
- supported alternate locale behavior
- custom pages
- premium pages
- custom-domain routing

Treat live custom domains such as BEMBI as production safety checks, not as platform canonical domains.

## Robots and indexability

Technical hosts must not become indexable platform duplicates.

Unpublished or intentionally hidden tenant content must remain noindex.

Do not remove noindex merely to increase indexed page count.

Indexability must reflect publication intent.

## Sitemap

The sitemap should contain canonical, public, indexable URLs.

Before adding a route verify that it:

- exists
- is public
- is canonical
- should be indexed
- is not a technical duplicate

Reuse current registries for:

- platform marketing routes
- solutions
- Journal articles
- demos
- premium template previews

## Structured data

Structured data must match visible reality.

Possible schema types include:

- Organization
- WebSite
- SoftwareApplication
- Article
- FAQPage when visible FAQ content exists

Do not fabricate:

- reviews
- aggregate ratings
- offers
- authors
- dates
- locations
- events

Do not include structured data for facts that are absent or false on the page.

## Internal linking

Build useful contextual links among:

- feature pages
- solution pages
- Journal guides
- demos
- pricing
- core product pages

Use descriptive natural anchors.

Avoid repetitive SEO link blocks that exist only for crawlers.

## Journal

Journal articles should answer real questions or help a business make a decision.

Prefer:

- explanatory guides
- practical checklists
- workflows
- comparisons grounded in real product capabilities

Do not create articles only to increase URL count.

Do not fabricate author or modification dates.

## Demo SEO

Demo pages can support product discovery and search visibility.

Their text must accurately describe the demo.

Do not invent customer performance or results for demos.

Demo route inventories should come from current registries, not hardcoded copies.

## IndexNow

Tenant publishing already has its own IndexNow workflow.

Do not replace or merge tenant IndexNow with the platform release workflow.

Platform SEO releases use:

`npm run deploy:seo`

Platform IndexNow may submit only:

`https://onestudioos.com/...`

Never submit from the platform workflow:

- `www.onestudioos.com`
- HTTP URLs
- BEMBI
- tenant custom domains
- Vercel deployment domains
- alternate ports

IndexNow status:

- 200 = accepted
- 202 = accepted and pending processing

Both are successful submissions.

IndexNow acceptance does not guarantee indexing or ranking.

## Normal SEO release workflow

1. Work on a feature branch.
2. Run focused SEO tests.
3. Run TypeScript.
4. Run `git diff --check`.
5. Fetch and review current `origin/main`.
6. Merge into current `main`.
7. Push `main`.
8. Run:

   `npm run deploy:seo -- --dry-run`

9. Verify changed canonical URL list.
10. When production release is explicitly approved, run:

   `npm run deploy:seo`

Do not normally provide an old manual `--base`.

Use `--base=<sha>` only for an intentional replay, backfill, or diagnostic test.

If no platform SEO URLs changed, IndexNow should be skipped.

## Production safety

Before a real SEO deploy verify:

- branch is `main`
- working tree is clean
- HEAD equals `origin/main`
- Vercel project is `onestudioos/onestudio-os`
- no unexpected migration is involved
- no production database mutation is required

Do not restore deleted editor files, old dependencies, or old branches during SEO work.

## Testing

Discover current test filenames before running them.

Relevant tests may include:

- SEO foundation
- solution network
- feature network
- Journal
- title branding
- sitemap
- tenant metadata
- custom-domain SEO
- IndexNow publish
- IndexNow format
- platform IndexNow automation

Always run:

`npx tsc --noEmit`

and:

`git diff --check`

Do not edit unrelated Puck/editor code merely to make unrelated broad tests pass.

Report unrelated failures separately.

## Scope discipline

Do not mix SEO work with unrelated:

- Site Editor redesign
- booking logic
- CRM logic
- payment logic
- database migrations
- large refactors

A small SEO task should normally have a small diff.

## Visible website copy

Do not introduce Unicode em dash U+2014 into visible OneStudio website copy.

Use ordinary punctuation.

## Required final report

Before declaring SEO work ready, report:

### SEO TARGET

- platform or tenant
- target URLs
- search intent or technical problem

### CHANGES

- files changed
- metadata impact
- canonical impact
- sitemap impact
- structured-data impact
- internal-link impact
- IndexNow impact

### SAFETY

- tenant behavior changed: YES/NO
- custom-domain routing changed: YES/NO
- production data changed: YES/NO
- technical hosts indexable: YES/NO

### TESTS

List every relevant command with PASS or FAIL.

### RELEASE

- ready for commit: YES/NO
- ready for merge: YES/NO
- ready for production deploy: YES/NO
- blockers

Never claim READY when a relevant failure is unexplained.
