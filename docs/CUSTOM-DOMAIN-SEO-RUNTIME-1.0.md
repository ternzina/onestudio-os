# Custom Domain SEO Runtime 1.0

## Purpose

Serve host-aware `robots.txt` and `sitemap.xml` for both OneStudio OS and every active client domain.

## Contract

- `onestudioos.com/robots.txt` points to the platform sitemap.
- `onestudioos.com/sitemap.xml` contains the platform plus published sites that do not have an active custom domain.
- An active client domain receives its own `robots.txt`.
- An active client domain receives a sitemap containing only that workspace.
- Client-domain sitemap URLs use clean paths such as `/`, `/pl`, `/portfolio`, and `/p/{slug}`.
- Hidden pages, site-level `noindex`, and page-level `noindex` remain excluded.
- An unknown or inactive custom hostname receives `Disallow: /` and an empty sitemap.
- Existing page metadata, canonical URLs, domain connection, publishing, and editor state are unchanged.

## Database

`public.list_public_site_seo_paths(text)` exposes only published locale paths and the active primary custom domain. It is a stable security-definer function executable by `anon` and `authenticated`.

## Runtime

`lib/public-site/domain-resolution.ts` is the shared hostname resolver used by domain routing and SEO metadata routes.

`app/robots.ts` and `app/sitemap.ts` read request headers directly, making the special metadata routes request-aware.

`proxy.ts` excludes metadata routes from proxy processing, matching the Next.js metadata-route contract.
