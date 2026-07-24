# Payments Core 1.0

Payments Core attaches one immutable, provider-neutral money ledger to the canonical OneStudio booking and client records.

## Included

- `/admin/payments` authenticated balance and transaction workspace;
- payment-required, unpaid, partially paid, paid and refunded booking states;
- cached gross paid and refunded totals on each booking;
- append-only payment and refund ledger entries in minor currency units;
- manual cash, card, bank transfer, online, gift-card and other methods;
- provider name, external reference and idempotency fields for future adapters;
- guarded manual payment and refund RPCs;
- a service-role-only provider adapter seam;
- overpayment, over-refund, currency-change and total-below-paid protection;
- direct navigation between payments, bookings and CRM clients;
- viewer read-only access and strict anonymous denial.

## Accounting boundary

A posted transaction is never edited or deleted. Corrections are represented by a new payment or refund entry. The booking stores a derived summary, while `payment_transactions` remains the source of truth.

## Provider boundary

Payments Core does not contain Stripe, PayPal or another checkout implementation. A provider adapter may later append a final idempotent payment or refund through the protected service-role seam without replacing bookings or changing the ledger model.

## Deliberately deferred

- hosted checkout and webhook endpoints;
- deposits and automatic payment schedules;
- saved payment methods;
- invoices, receipts and tax documents;
- disputes, chargebacks and failed-attempt tracking;
- automated refunds;
- provider credentials in the shared codebase.

## Validation

```bash
npx supabase@beta test db
npm run build
```
