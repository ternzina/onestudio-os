# OneStudio OS · Notifications Core 1.0

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
13. **Payments Core 1.0** adds a provider-neutral immutable payment and refund ledger linked to bookings and clients.
14. **Notifications Core 1.0** adds language-aware templates, an idempotent queue, reminders and provider delivery attempts.

## Added in Notifications Core 1.0

- `/admin/notifications` authenticated queue, template and reminder workspace;
- confirmation, pending, cancellation, reminder, payment and refund events;
- booking-locale-first template resolution with business and English fallback;
- durable rendered subjects and bodies that do not change after enqueueing;
- automatic reminder jobs for new active bookings and an idempotent backfill action;
- provider-neutral claiming, sent and failed seams for Resend, SMTP or another adapter;
- append-only delivery attempts, retry limits and administrator retry or cancellation;
- notification failures isolated from booking and payment transactions;
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
- provider-neutral immutable payment and refund ledger;
- derived booking payment balances with protected manual operations;
- language-aware notification templates and durable queue jobs;
- reminder scheduling, retry policy and append-only delivery attempts;
- per-business module registry.

## Deliberately not included yet

- hosted payment checkout, deposits and provider webhooks;
- provider adapter that actually sends queued email through Resend, SMTP or another service;
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
- `supabase/migrations/20260725010000_payments_core.sql`
- `supabase/migrations/20260725020000_notifications_core.sql`

## Validation

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.

## Notifications Core 1.0

Notifications Core prepares durable language-aware email jobs and delivery attempts without choosing a provider. A later Resend or SMTP adapter will claim due jobs and report sent or failed results through the protected service-role seam.
