# Booking Calendar 1.0

Booking Calendar adds an authenticated operational timeline without creating a second scheduling system.

## Admin route

- `/admin/calendar` opens a read-only day or week timeline.
- administrators can move between periods, return to today and filter by a bookable resource.
- working windows, available exceptions, blocked exceptions and bookings share one timezone-aware view.
- selected booking details show the canonical reference, client, service, resources, status, source and total.

## Calendar projection

`get_admin_booking_calendar(date, integer, uuid)`:

- resolves the authenticated user's current workspace;
- accepts a one-to-fourteen-day range;
- optionally narrows the projection to one active bookable resource;
- expands weekly availability rules into concrete local dates;
- clips date-specific available and blocked exceptions to each calendar day;
- returns only bookings overlapping the requested workspace-local range;
- joins safe operational client, service and resource labels;
- marks only `hold`, `pending` and `confirmed` bookings as resource-occupying;
- returns summary counts without mutating bookings.

The function is `SECURITY DEFINER`, but it requires authentication and checks the existing workspace membership contract. Anonymous callers receive no execution permission.

## Interface boundary

The calendar is deliberately read-only. Creating, rescheduling, cancelling and changing status continue through Booking Core RPCs and their transactional resource locks. This prevents calendar presentation code from becoming a parallel booking engine.

## Visual rules

- pale working windows show when a resource may operate;
- striped blocked windows show exceptions;
- active bookings are labelled as occupied;
- cancelled, completed and no-show records remain visible as history without occupying a resource;
- the resource filter narrows bookings and availability to one operational lane.

## Deliberately deferred

- drag-and-drop rescheduling;
- recurring bookings;
- staff-specific visual colors;
- external Google or Apple calendar synchronization;
- payment and notification overlays;
- multi-location aggregation.
