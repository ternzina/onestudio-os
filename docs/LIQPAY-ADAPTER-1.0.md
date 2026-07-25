# OneStudio OS LiqPay Adapter 1.0

## Scope

Stage 1 connects LiqPay Checkout to the provider-neutral Payments Core:

- authorized server-side checkout payload creation;
- API v7 `data` and SHA3-256 `signature` generation;
- browser POST redirect to LiqPay Checkout;
- signed callback verification;
- successful payment recording through `append_payment_transaction`;
- idempotent provider references and immutable ledger entries;
- sandbox/live configuration status endpoint.

## Environment

```env
LIQPAY_PUBLIC_KEY=sandbox_...
LIQPAY_PRIVATE_KEY=sandbox_...
```

LiqPay creates separate sandbox and live key pairs. Keep the private key server-side only.

## Endpoints

- `POST /api/admin/payments/liqpay/checkout`
- `GET /api/admin/payments/liqpay/status`
- `POST /api/liqpay/callback`

The callback URL configured in checkout is:

```text
https://<site-domain>/api/liqpay/callback
```

## Security properties

- Checkout creation requires an authenticated workspace member with payment access.
- Callback processing requires a valid LiqPay SHA3-256 signature.
- The callback public key, booking, amount, currency and outstanding balance are validated.
- The existing Payments Core blocks overpayment and duplicate idempotency keys.
- Card details are entered on LiqPay Checkout and are not stored by OneStudio OS.

## Deferred to Stage 2

- provider-native full and partial refund button;
- payment status reconciliation job;
- adapter selector in workspace settings;
- production/sandbox readiness banner in the admin UI.
