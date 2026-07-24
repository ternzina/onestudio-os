# OneStudio OS Booking Core 1.0

Booking Core turns one calculated Availability slot into the canonical operational booking record.

## Stable contract

- `clients` remains the reusable workspace CRM identity.
- `bookings` remains the single booking record for appointments, rentals, classes and events.
- `booking_allocations` reserves every required resource using the existing exclusion constraint.
- `booking_events` preserves creation, edits, status changes and cancellations.
- Cancellation releases allocations but never deletes the booking history.

## Transaction boundaries

`create_admin_booking` performs these steps in one database transaction:

1. verifies the operator and workspace;
2. validates the active service, duration and party size;
3. rechecks Availability Core at save time;
4. creates or reuses the client by normalized workspace email;
5. snapshots the service price and booking totals;
6. creates the booking;
7. reserves every required resource.

If another transaction takes the resource first, the whole operation rolls back with a slot conflict.

`update_admin_booking` rechecks the target slot while ignoring only the booking being edited, then atomically replaces its allocations.

## Status lifecycle

The guarded operational transitions are:

- `draft` → `hold`, `pending`, `confirmed`, `cancelled`
- `hold` → `pending`, `confirmed`, `cancelled`
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `completed`, `no_show`, `cancelled`

Final records are not silently reopened. Payments and notifications will attach to this lifecycle in later layers.

## Access

- `owner`, `admin`, `manager`, `staff`: create and operate bookings.
- `viewer`: read bookings and activity only.
- anonymous visitors: no access to the administrative booking functions or activity trail.

The public booking interface is intentionally not part of this layer.


## Conflict hardening

Booking writes are serialized by required resource before the final availability check. This closes the tiny race window created by two near-simultaneous button presses or requests.

A deferred database invariant also requires every active booking to finish its transaction with all required allocations. The existing exclusion constraint remains the final physical barrier against overlapping active allocations.

The admin form additionally ignores repeated submit events while one save request is in flight. Database protection remains authoritative even if a client bypasses the interface.
