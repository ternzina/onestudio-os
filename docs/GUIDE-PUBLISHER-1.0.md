# Guide Publisher 1.0

Guide Publisher is the controlled bridge from QA-approved Markdown in **Ready to Publish** to the database-backed OneStudio Guides CMS.

## Goals

- No Git commit or Vercel deploy for ordinary Guide publication.
- No giant SQL pasted into a terminal or chat.
- Import is always draft-first.
- Publication is a separate, explicit action.
- Long Markdown files and multi-article batches are written through a temporary SQL file, not a command-line argument.
- The existing `platform_guide_articles` / `platform_guide_article_locales` tables remain the source of truth.
- Existing `lib/i18n/locales` remains the UI translation system.
- Future article translations use another locale row for the same canonical parent.

## Safety model

Write commands (`import`, `publish`, `unpublish`) require:

1. branch `main`;
2. clean working tree;
3. `HEAD == origin/main`;
4. linked Supabase project exactly `mmdjptpvofmjgrvgusma`;
5. successful Markdown and route validation before import.

`validate` never writes.

`import` only creates `draft` parent/locale rows. It never publishes.

`publish` is transactional. It publishes the selected locale and parent rows together. When no date is supplied, PostgreSQL `current_date` is used, so the same date comparison used by RLS cannot hide a just-published article because of the Kyiv/UTC midnight gap.

`unpublish` returns the parent and locale to `draft`; it does not delete content.

## Markdown contract

The parser understands the current QA-final format:

- initial `#` title;
- bold metadata fields such as `Status`, `Target query`, `SEO title`, `Meta description`, `Slug`, and `H1`;
- H1/H2 sections;
- H3+ subsections;
- paragraphs;
- bullet lists;
- numbered lists;
- checklists;
- Markdown tables;
- fenced code/template blocks;
- FAQ sections;
- root-relative Markdown links.

Editorial-only headings are removed from public content, including:

- `Internal-link suggestions`;
- research/claim notes;
- Content QA/source notes;
- implementation/editorial/developer notes.

A pending secondary CTA containing wording such as `once live`, `when live`, or `only after` is also excluded from runtime content.

## Category metadata

A QA-final Markdown file does not always contain the canonical OneStudio `primaryCategory`, `topics`, approved excerpt, or selected related links. For batch publication, put those values in a small manifest rather than guessing them.

Example: `examples/guide-publisher.manifest.example.json`.

The manifest is intentionally tiny. The article body still comes from the QA-final Markdown file.

## Commands

### Validate only

```bash
npm run guides:publisher -- validate --manifest=/path/to/publisher.json
```

For one article:

```bash
npm run guides:publisher -- validate \
  /path/to/article.md \
  --category=Booking \
  --topics=Booking,Marketing,Websites
```

Validation checks:

- slug/canonical slug format;
- supported locale;
- OneStudio Guide taxonomy;
- title/H1/description/excerpt/search intent;
- duplicate identities inside the batch;
- at least one content section;
- FAQ integrity;
- no literal `| OneStudio` brand suffix;
- no `/help` or `/blog` public links;
- all internal and related links resolve against the live `onestudioos.com` sitemap or another article in the same batch;
- no self/duplicate related links.

### Import drafts

```bash
npm run guides:publisher -- import --manifest=/path/to/publisher.json
```

The entire batch is one PostgreSQL transaction. If any article conflicts or fails, the batch rolls back.

Existing canonical parents can accept a new locale row for future translations. A non-original locale cannot create a new parent by itself.

### Publish a validated batch

```bash
npm run guides:publisher -- publish --manifest=/path/to/publisher.json
```

Or publish known draft slugs:

```bash
npm run guides:publisher -- publish slug-one slug-two
```

After the database transaction, Publisher verifies:

- every direct Guide URL returns successfully;
- the expected H1 is present when the manifest is supplied;
- every canonical URL appears in the dynamic sitemap.

No Vercel deployment is run.

### Status

```bash
npm run guides:publisher -- status booking-page-best-practices
```

### Unpublish without deleting

```bash
npm run guides:publisher -- unpublish booking-page-best-practices
```

## Translation-ready flow

The same parent article can later receive rows such as:

- `locale = ru`
- `locale = uk`
- `locale = pl`
- `locale = de`
- `locale = es`
- `locale = fr`
- `locale = pt`

The translation row is imported as `draft`, reviewed, and can be moved to `published` independently. Locale-prefixed public routes and hreflang remain a separate later phase.

## Current limitation

DB-only publication is automatically reflected in the dynamic Guide routes and sitemap. The existing Git-diff-based IndexNow release script cannot discover a DB-only publication by itself. IndexNow automation should be added as a small follow-up after Publisher 1.0 is accepted; it is deliberately not hidden inside the first production write path.
