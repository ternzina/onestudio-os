# OneStudio OS · Resend Adapter 1.0

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
15. **Resend Adapter 1.0** delivers due queue jobs through Resend with safe modes, stable idempotency and interrupted-run recovery.

## Added in Resend Adapter 1.0

- protected Resend delivery behind the existing provider-neutral queue;
- delivery modes `disabled`, `test` and `live`, with `disabled` as the safe default;
- test-recipient redirection before real client delivery is enabled;
- stable Resend `Idempotency-Key` values based on notification job IDs;
- service-role claiming with workspace sender name and reply-to data;
- automatic exponential retries for transport, rate-limit and temporary provider errors;
- recovery of stale `processing` jobs after an interrupted serverless run;
- protected `/api/cron/notifications` endpoint using `CRON_SECRET`;
- authenticated manual queue processing from `/admin/notifications`;
- API keys and service-role credentials kept on the server only.

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
- Resend delivery with safe test mode, idempotent requests and stale-run recovery;
- per-business module registry.

## Deliberately not included yet

- hosted payment checkout, deposits and provider webhooks;
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
- `supabase/migrations/20260725030000_resend_adapter.sql`

## Validation

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.

## Resend Adapter 1.0

Resend Adapter claims only due queue jobs through the protected service-role seam. It is disabled unless `NOTIFICATION_DELIVERY_MODE` is explicitly set to `test` or `live`. Test mode redirects every message to `NOTIFICATION_TEST_RECIPIENT`; live mode preserves the real recipient.

Required server variables for test or live delivery:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
SUPABASE_SECRET_KEY=
CRON_SECRET=
NOTIFICATION_DELIVERY_MODE=disabled
NOTIFICATION_TEST_RECIPIENT=
```

Optional controls:

```env
NOTIFICATION_BATCH_SIZE=25
NOTIFICATION_RETRY_BASE_SECONDS=60
NOTIFICATION_STALE_PROCESSING_MINUTES=15
```

The adapter exposes `/api/cron/notifications` for an external scheduler and `/api/admin/notifications/adapter` for authenticated status and manual processing. No scheduler cadence is hardcoded because Vercel plan limits differ.
