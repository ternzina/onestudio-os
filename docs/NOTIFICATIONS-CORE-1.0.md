# OneStudio OS Notifications Core 1.0

Notifications Core turns booking and payment events into durable, language-aware email jobs without coupling the product to Resend, SMTP or another delivery provider.

## Contract

- Booking pending, confirmed and cancelled events enqueue idempotent messages.
- Active future bookings enqueue one reminder based on workspace settings.
- Payment and refund ledger entries enqueue matching messages.
- Booking locale wins, followed by client locale, business locale and English fallback.
- Subject and body are rendered when the job is created, so later template edits do not rewrite history.
- Notification failures never roll back a booking or payment transaction.
- Provider adapters claim due jobs with `FOR UPDATE SKIP LOCKED`.
- Every provider attempt is appended to delivery history.
- Administrators may retry failed or cancelled jobs and cancel jobs that have not started delivery.
- Viewers have read-only access. Anonymous users have no access.

## Admin surface

`/admin/notifications` contains:

1. Queue status and job details.
2. Template editing for any supported locale.
3. Reminder lead time, retry limit and reply-to settings.

The core does not send external email. A provider adapter must call:

- `claim_notification_jobs(provider, limit)`
- `mark_notification_sent(job_id, provider_message_id)`
- `mark_notification_failed(job_id, error, retry_at)`

## Validation

```bash
npx supabase@beta migration up
npx supabase@beta test db
npm run build
```
