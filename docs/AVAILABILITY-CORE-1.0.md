# Availability Core 1.0

Availability Core turns the scheduling tables introduced by Core Modules 1.0 into a usable, tenant-safe scheduling engine.

## Boundary

This layer answers one question: **when can a service and all of its required resources be used?** It does not create clients, bookings, payments, emails or checkout sessions.

## Canonical records

- `business_availability_settings` stores notice, horizon and slot cadence for one workspace.
- `availability_rules` stores recurring local working intervals for one resource and weekday.
- `availability_exceptions` stores blocked or additionally available timestamp ranges.
- `service_resources` declares the resources that must be available for a service.
- `booking_allocations` blocks occupied resource ranges when bookings exist.

## Slot calculation

`get_service_available_slots()` generates candidate starts in the workspace timezone and keeps only candidates that satisfy:

1. active public service visibility, or authenticated workspace access;
2. configured duration range and duration step;
3. service capacity;
4. minimum booking notice;
5. booking horizon;
6. required active, bookable resources;
7. weekly resource intervals or a covering available exception;
8. no overlapping blocked exception;
9. service buffers before and after the requested duration;
10. no held or confirmed booking allocation conflict.

The public RPC returns timestamps and local start/end times only. Raw weekly rules, exception reasons and private resource names remain inaccessible to anonymous visitors.

## Role tiers

- `owner`, `admin`, `manager`: configure settings, weekly hours and exceptions;
- `staff`, `viewer`: inspect workspace availability and preview slots;
- outsiders: see no workspace scheduling internals;
- anonymous visitors: may request calculated slots for active public services only.

## Admin route

`/admin/availability` contains four sections:

- booking window;
- weekly resource hours;
- date exceptions;
- service slot preview.

The interface uses the independent Admin i18n RU/EN preference.
