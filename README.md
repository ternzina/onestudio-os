# OneStudio OS · Core Modules Contract 1.0

A brand-neutral foundation for studio and appointment-based business systems. This repository is no longer a copy of a specific client website. Client storefronts, languages, booking rules and visual themes are added as separate layers.

## Included in this foundation

- Next.js 16 and React 19 application shell
- Supabase authentication and role-based admin access
- Clean, locale-neutral Supabase schema
- Admin overview and global settings
- Cloudflare R2 media library
- Portfolio categories and reusable portfolio projects
- Private client-gallery redirect page
- Password recovery through Resend
- Generic SEO, manifest, robots and sitemap

## Added in the Core Modules contract

- Business workspaces and memberships
- Canonical clients and CRM records
- One service catalog for appointments, rentals, classes and events
- Bookable resources for staff, spaces, equipment and capacity units
- Weekly availability and date-specific exceptions
- One canonical booking table with conflict-safe resource allocations
- Per-business module registry

The database contract is installed before the public booking and admin interfaces. This prevents UI decisions from dictating the data model.

## Deliberately not included yet

- Client-specific public storefront pages
- Service and resource booking interfaces
- CRM, payment and analytics interfaces
- Stripe checkout and webhooks
- Business-specific legal documents
- Hardcoded languages, routes, prices, addresses or media

The database already contains the neutral service-booking and resource-booking primitives. Their interfaces will be rebuilt as independent core modules instead of carrying forward the previous client implementation.

## Local setup

1. Copy `.env.example` to `.env.local` and fill the required values.
2. Install dependencies with `npm ci`.
3. Run `npm run dev`.
4. Validate changes with `npm run lint` and `npm run build`.

## Database

The canonical clean migration is:

`supabase/migrations/20260722000000_onestudio_clean_base.sql`

The additive core modules contract is:

`supabase/migrations/20260724000000_core_modules_contract.sql`

Security regression tests are stored in:

`supabase/tests/onestudio-clean-base-security-tests.sql`

## Git checkpoints

- `clean-shell-1.0` preserves the pre-cleanup source snapshot.
- `core-foundation-v1.0` preserves the clean universal foundation.
- `core-modules-1.0` adds the universal module contract without changing that checkpoint.

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.
