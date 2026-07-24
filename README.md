# OneStudio OS · Availability Core 1.0

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

## Added in Availability Core 1.0

- workspace booking notice, calendar horizon and slot cadence;
- weekly schedules per bookable resource;
- multiple intervals per day for breaks and split shifts;
- blocked and extra-availability exceptions for specific dates;
- timezone-safe exception creation from local dates and times;
- service slot calculation across required resources;
- service duration, step, capacity and before/after buffer validation;
- booking allocation conflict checks;
- public-safe slot RPC without exposing raw schedules or private resource names;
- `/admin/availability` with RU/EN settings, weekly hours, exceptions and slot preview;
- manager configuration with staff/viewer read-only access;
- regression tests for role boundaries, tenant isolation and scheduling logic.

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
- per-business module registry.

## Deliberately not included yet

- public booking form and manual admin booking creation;
- booking holds and final allocation workflow;
- Stripe checkout and canonical payment records;
- discounts, reminders and analytics;
- hardcoded languages, routes, prices, addresses or media.

## Database migrations

- `supabase/migrations/20260722000000_onestudio_clean_base.sql`
- `supabase/migrations/20260724000000_core_modules_contract.sql`
- `supabase/migrations/20260724010000_workspace_context.sql`
- `supabase/migrations/20260724020000_admin_access_bootstrap.sql`
- `supabase/migrations/20260724030000_catalog_core.sql`
- `supabase/migrations/20260724040000_availability_core.sql`

## Validation

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.

## Booking Core 1.0

Booking Core turns a calculated Availability slot into one canonical booking transaction. It creates or reuses the client, snapshots the price, reserves every required resource, rejects overlaps, supports status transitions and preserves an append-only activity trail. Public checkout, payments and notifications remain separate future layers.
