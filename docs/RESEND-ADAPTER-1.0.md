# OneStudio OS · Resend Adapter 1.0

## Boundary

Notifications Core remains the source of truth for templates, rendered jobs, scheduling, retries and delivery attempts. Resend Adapter only:

1. recovers abandoned `processing` jobs;
2. atomically claims due jobs through the service-role RPC;
3. sends one email request per claimed job;
4. records `sent` or `failed` through the existing immutable attempt history.

Bookings, clients, payments and templates do not call Resend directly.

## Safe delivery modes

`NOTIFICATION_DELIVERY_MODE=disabled`

- default;
- claims nothing;
- sends nothing;
- admin UI reports that delivery is disabled.

`NOTIFICATION_DELIVERY_MODE=test`

- requires `NOTIFICATION_TEST_RECIPIENT`;
- redirects every email to that one address;
- prefixes the subject with the original recipient;
- still records the queue job as sent, so use this only in a local or test installation.

`NOTIFICATION_DELIVERY_MODE=live`

- sends to the real queue recipient;
- should be enabled only after the sender domain and test flow are verified.

## Required server variables

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
SUPABASE_SECRET_KEY=
CRON_SECRET=
NOTIFICATION_DELIVERY_MODE=disabled
NOTIFICATION_TEST_RECIPIENT=
```

`SUPABASE_SERVICE_ROLE_KEY` is accepted as a fallback for `SUPABASE_SECRET_KEY`.

The following controls are optional:

```env
NOTIFICATION_BATCH_SIZE=25
NOTIFICATION_RETRY_BASE_SECONDS=60
NOTIFICATION_STALE_PROCESSING_MINUTES=15
```

## Idempotency and interrupted runs

Every Resend call uses:

```text
Idempotency-Key: onestudio/<notification-job-id>
```

The database already prevents a sent job from being claimed again. The Resend key adds protection when the provider accepted a request but the serverless function stopped before the database was updated.

Before each run, the adapter recovers jobs that stayed `processing` beyond the configured stale threshold. Their abandoned delivery attempt is finalized as failed. Jobs below their attempt limit return to `pending`; exhausted jobs become `failed`.

## Routes

### Authenticated admin route

```text
GET  /api/admin/notifications/adapter
POST /api/admin/notifications/adapter
```

`GET` returns only safe configuration status. It never returns API keys.

`POST` manually processes a due batch. Only owner, admin and manager roles may invoke it.

### Scheduler route

```text
GET  /api/cron/notifications
POST /api/cron/notifications
Authorization: Bearer <CRON_SECRET>
```

The route refuses requests when `CRON_SECRET` is missing or shorter than 16 characters.

No `vercel.json` schedule is included in this layer. Scheduler cadence must be selected during deployment because plan limits differ. The protected route can be called by Vercel Cron or another scheduler.

## Provider errors

Temporary transport errors, timeouts, rate limits and server errors are retried with exponential delay. Permanent validation or authentication errors are recorded as final failures. Every provider attempt remains append-only.

## Validation

```bash
npx supabase@beta migration up
npx supabase@beta test db
npm run build
```

Expected database result:

```text
Files=13, Tests=816
Result: PASS
```
