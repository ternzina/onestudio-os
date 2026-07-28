# Analytics Core 1.0

Analytics Core derives workspace metrics from the same canonical records used by
Bookings, Clients CRM and Payments. It does not introduce a second writable
statistics store.

## Included

- tenant-safe `get_admin_analytics` RPC;
- workspace-local date ranges up to 366 days;
- booking, cancellation, completion, client and booked-hour metrics;
- booked value, net collected money and outstanding balances;
- daily booking/payment series;
- top services, booking statuses and booking sources;
- default-currency totals with explicit disclosure of excluded foreign-currency
  bookings;
- `/admin/analytics` with 7, 30, 90-day and custom period filters.

## Metric boundaries

- Draft bookings do not enter operational analytics.
- Cancelled bookings are reported separately and do not add booked value or
  booked hours.
- Booking metrics use the scheduled date in the workspace timezone.
- Payment metrics use the transaction occurrence date.
- Money totals use the workspace default currency; currencies are never summed
  together.
- Payment totals come from the immutable payment ledger.

## Security

The RPC requires workspace read access through `can_view_business`. Anonymous
visitors and users from another workspace cannot execute it.
