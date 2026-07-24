# OneStudio OS · Public Booking UI 1.0

A brand-neutral foundation for studio and appointment-based business systems. Client storefronts, languages, booking rules and visual themes are added as separate layers.

## Foundation layers

1. **Clean Base 2.0** removes client identity and secures the neutral schema.
2. **Clean Shell 1.0** preserves a generic application and admin shell.
3. **Core Modules 1.0** defines businesses, clients, services, resources, schedules and bookings.
4. **Workspace Context 1.0** selects the active business and enforces role-aware tenant boundaries.
5. **Admin Access & Bootstrap 1.0** creates the first owner and protects the administration area.
6. **Catalog Core 1.0** activates universal categories, services, resources, pricing and duration controls.
7. **Admin i18n 1.0** adds an independent Russian and English administration interface.
8. **Availability Core 1.0** activates weekly resource hours, date exceptions and conflict-aware service slots.
9. **Booking Core 1.0** turns free slots into conflict-safe bookings, clients, allocations and operational history.
10. **Public Booking UI 1.0** lets guests choose a service, date and slot without signing in.

## Added in Public Booking UI 1.0

- `/book/<business-slug>` public booking route with RU/EN interface;
- public-safe workspace and service context RPC;
- guest service, date, duration, party-size and slot selection;
- contact form and immediate confirmation screen;
- guarded anonymous booking creation on the canonical booking table;
- resource locking and a second availability check inside the transaction;
- workspace-scoped idempotency keys that prevent duplicate submissions;
- pending status for services requiring approval and confirmed status otherwise;
- no anonymous direct access to clients, bookings, allocations or history;
- regression tests for storefront filtering, validation, conflicts and tenant isolation.

## Current module contract

- business workspaces and memberships;
- first-owner bootstrap and protected administration;
- independent RU/EN administration locale;
- categories, services, prices, duration ranges and resources;
- service-to-resource requirements;
- weekly resource availability and date-specific exceptions;
- booking notice, horizon and slot cadence;
- calculated service slots with buffers and conflict detection;
- one canonical booking table with conflict-safe resource allocations;
- public booking context and idempotent guest booking creation;
- per-business module registry.

## Deliberately not included yet

- payment checkout, deposits and canonical payment records;
- booking confirmation and reminder emails;
- public cancellation and rescheduling links;
- CAPTCHA and configurable public rate limits;
- discounts and analytics;
- hardcoded languages, routes, prices, addresses or media.

## Database migrations

- `supabase/migrations/20260722000000_onestudio_clean_base.sql`
- `supabase/migrations/20260724000000_core_modules_contract.sql`
- `supabase/migrations/20260724010000_workspace_context.sql`
- `supabase/migrations/20260724020000_admin_access_bootstrap.sql`
- `supabase/migrations/20260724030000_catalog_core.sql`
- `supabase/migrations/20260724040000_availability_core.sql`
- `supabase/migrations/20260724050000_booking_core.sql`
- `supabase/migrations/20260724051000_booking_conflict_hardening.sql`
- `supabase/migrations/20260724060000_public_booking_ui.sql`

## Validation

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.

## Public Booking UI 1.0

Public Booking UI uses the same service catalog, availability calculator, canonical booking record and resource locks as the administration area. It adds a public guest contract and interface without granting anonymous table access or creating a parallel booking engine. Payments and notifications remain separate future layers.
