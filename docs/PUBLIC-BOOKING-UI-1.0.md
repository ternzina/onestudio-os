# Public Booking UI 1.0

Public Booking UI exposes the canonical Catalog, Availability and Booking Core flow to a guest without requiring an account.

## Public route

- `/book/<business-slug>` opens one workspace booking flow.
- `/book` redirects automatically when the installation has exactly one active workspace.
- the interface supports Russian and English independently from the admin locale.

## Public contract

`get_public_booking_context(text)` returns only:

- active workspace identity;
- safe booking date bounds;
- active public services with presentation, duration, capacity and price data.

It does not expose raw weekly schedules, exceptions, private resources, clients, bookings or activity history.

`create_public_booking(...)`:

- requires a client-generated UUID idempotency key;
- validates the active workspace and public service;
- validates duration, capacity, name, email, phone and locale;
- serializes writes across required resources;
- checks availability again inside the transaction;
- creates or safely reuses a client by normalized email;
- creates the canonical `public.bookings` record;
- reserves all required resources;
- creates `pending` status for services requiring confirmation and `confirmed` otherwise;
- returns only the new booking confirmation fields.

Anonymous roles still have no direct insert or select access to clients, bookings, allocations or booking history.

## Idempotency

`bookings.public_request_key` is scoped by workspace with a partial unique index. Retrying the same browser request returns the original booking rather than creating a duplicate.

## Deliberately deferred

- email verification and confirmation messages;
- payment checkout and deposits;
- CAPTCHA and configurable public rate limits;
- public cancellation and rescheduling links;
- custom storefront themes and embedded widgets.
