# Context Navigation 1.0

Context Navigation keeps the selected business object while moving between admin modules.

## Included

- Smart Client Workspace opens `/admin/payments?client=<client_id>`.
- Payments reads the `client` query parameter and filters the ledger to that client.
- The active client context is shown above the payment filters.
- “Show all payments” clears only the client filter without reloading the page.
- Existing `booking=<booking_id>` deep links continue to select a specific booking.

## No database migration

This release changes admin navigation and filtering only.
