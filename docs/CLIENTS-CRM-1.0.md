# OneStudio OS Clients CRM 1.0

## Purpose

Clients CRM turns the canonical client records already used by Booking Core into an operational workspace. It does not create a parallel customer table.

## Admin interface

- `/admin/clients`
- searchable active and archived clients
- name, email, phone, preferred language, notes and tags
- booking counts, next booking and booked value
- complete booking history with direct links to exact reservations
- protected archive, restore and duplicate merge actions
- client activity timeline

## Data contract

Clients remain stored in `public.clients`. The layer adds:

- `archived_at` and `archived_by`
- `public.client_events`
- protected client create, update, archive and merge RPCs
- workspace-scoped CRM summary and history RPCs
- identity reuse for administrative booking creation
- automatic restoration when an archived identity receives a new booking

## Duplicate protection

- email remains unique inside one business
- matching name and normalized phone is reused when no email is supplied
- identity locks prevent concurrent duplicate creation
- possible duplicates may be merged transactionally
- merge moves bookings and client events before removing the source record
- clients linked to different login accounts cannot be merged automatically

## Security

- anonymous visitors cannot execute CRM functions or read client data
- viewers may read CRM summaries and history
- owner, admin, manager and staff roles may create and update clients
- active future bookings block archival
- all functions verify the current business boundary
