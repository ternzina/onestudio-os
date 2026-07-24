# OneStudio OS · Core Modules Contract 1.0

## The central rule

A **service** is what a business sells. A **resource** is what becomes occupied while the service is delivered.

Examples:

- Beauty appointment: service = manicure, resources = nail technician + desk.
- Studio rental: service = two-hour rental, resource = main hall.
- Dance class: service = beginner class, resources = instructor + room.
- Event venue: service = evening package, resources = hall + equipment.

This keeps appointments and rentals inside one booking engine instead of maintaining two parallel systems.

## Canonical modules

1. `businesses` and `business_members` define the workspace and permissions.
2. `clients` stores both guest and authenticated customers.
3. `services` defines public offers, duration rules and pricing models.
4. `resources` defines staff, rooms, equipment, seats or other capacity units.
5. `service_resources` links the offer to the capacity it needs.
6. `availability_rules` and `availability_exceptions` define schedules.
7. `bookings` stores one canonical order or appointment.
8. `booking_allocations` reserves every required resource for the booking.
9. `business_modules` records which modules are enabled per workspace.

## Conflict protection

`booking_allocations` uses a PostgreSQL exclusion constraint. An active allocation for the same resource cannot overlap another active allocation, even when two requests arrive at nearly the same moment.

A resource represents one exclusive capacity unit. A room with capacity ten is still one exclusive room. A class with ten customer places uses `services.capacity` for attendee limits and reserves its room/instructor once.

## Time and money

- Booking instants use `timestamptz`.
- Each business stores its IANA timezone name.
- Weekly availability is expressed in business-local time.
- Money uses integer minor units, such as cents or groszy.
- Currency uses an uppercase ISO-style three-letter code.

## Compatibility layer

The following prototype tables are intentionally left in place for now:

- `service_bookings`
- `resource_bookings`
- `packages`
- `service_options`
- `team`
- `service_catalog_items`

No new module should write to them. A later migration will copy validated data into the canonical tables and only then retire the compatibility layer.

## Security boundary

Anonymous visitors may read active public services and resources. They cannot write clients or bookings directly. Public booking creation will be added through a validated `security definer` RPC that calculates price server-side and inserts the booking plus allocations in one transaction.
