# Guide CMS and i18n 1.0

OneStudio Guides now have platform-owned database records in Supabase:

- `platform_guide_articles` stores canonical identity, taxonomy, publication state, and dates.
- `platform_guide_article_locales` stores one localized content row per `article_id` and locale.
- Public runtime reads use the publishable Supabase key and RLS. Only a published parent, a non-future publication date, and a published locale row can render or enter the canonical sitemap.

The current release seeds the 13 canonical English Guides. Existing TypeScript content remains in the repository temporarily as a migration safety net: it is used only if a Guide CMS database query fails. A successful empty or unpublished database result never falls back to a static article, so unpublishing works. Remove that fallback after the DB cutover has been confirmed in production.

## Future translation flow

The future localized-content flow is:

`EN source` → `translation row` → `QA` → `published` → `localized route/hreflang phase`

The translation keeps the same `article_id`, adds the target `locale`, and stores localized `slug`, metadata, sections, related links, and optional FAQ content in its own row. It remains invisible while `translation_status` is `draft` or `review`. This release does not create machine translations, locale-prefixed public routes, or hreflang tags.

## IndexNow follow-up

The existing git-diff-based IndexNow release script remains unchanged and continues to discover the current static Guide publication graph. A future DB-only publication will not appear in that git diff, so the next small stage should add a narrow publication-event or DB-aware URL submission hook. This release does not perform live IndexNow submissions.
