# OneStudio OS · Clients CRM 1.0

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
11. **Booking Calendar 1.0** projects working hours, blocked intervals and bookings onto a day or week timeline.
12. **Clients CRM 1.0** adds canonical client cards, notes, tags, booking history, archive rules and protected duplicate merges.

## Added in Clients CRM 1.0

- `/admin/clients` authenticated client workspace;
- canonical client cards reused by public and administrative bookings;
- searchable contacts, language, tags and internal notes;
- booking counts, upcoming appointments, booked value and full booking history;
- direct navigation between a client and an exact booking;
- protected client creation and editing with duplicate identity checks;
- archive and restore operations that protect active future bookings;
- duplicate review and transactional merge without losing reservations;
- append-only client activity events;
- viewer read-only access and strict anonymous denial.

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
- authenticated day/week booking calendar projection;
- working, available and blocked operational windows;
- canonical CRM clients with notes, tags, history, archive and merge operations;
- per-business module registry.

## Deliberately not included yet

- payment checkout, deposits and canonical payment records;
- booking confirmation and reminder emails;
- public cancellation and rescheduling links;
- CAPTCHA and configurable public rate limits;
- drag-and-drop calendar rescheduling and external calendar sync;
- automated marketing campaigns and consent management;
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
- `supabase/migrations/20260724070000_booking_calendar.sql`
- `supabase/migrations/20260725000000_clients_crm.sql`

## Validation

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.

## Clients CRM 1.0

Clients CRM reads and updates the same canonical client records already created by Booking Core and Public Booking UI. It adds a protected administrative workspace, booking history and duplicate cleanup without introducing a second customer table.
