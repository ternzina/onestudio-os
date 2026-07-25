# OneStudio OS Stripe Adapter 1.0

Stage 1 connects Stripe Checkout to the existing immutable Payments Core ledger.

Included:
- authorized Checkout Session creation for the current outstanding booking balance;
- signed Stripe webhook processing;
- idempotent insertion through `append_payment_transaction`;
- admin button that opens Stripe Checkout;
- test/live mode inferred from the Stripe secret key.

Required environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SITE_URL` or `NEXT_PUBLIC_SITE_URL`

Webhook endpoint:
- `/api/stripe/webhook`

Subscribe to:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

This stage does not yet create refunds through Stripe. Existing manual ledger refunds remain available until the refund adapter is added and tested separately.
