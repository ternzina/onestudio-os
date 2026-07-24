# OneStudio OS · Catalog Core 1.0

## Purpose

Catalog Core turns the service and resource contract into a usable workspace module.

- A **service** is the offer a customer can buy or request.
- A **resource** is the staff member, space, piece of equipment, seat or asset occupied while the service is delivered.
- A **category** is a presentation group. Service and resource categories are intentionally separate scopes.

The catalog remains neutral across appointments, rentals, classes, events, memberships and other service businesses.

## Database additions

- `catalog_categories` stores workspace-scoped service and resource groups.
- `services.category_id` and `resources.category_id` are optional.
- Database triggers reject category links from another workspace or the wrong scope.
- Deleting a category keeps its items and clears only their category reference.
- `replace_service_resources()` atomically replaces the required resources assigned to a service.
- New workspaces receive a complete `business_modules` registry automatically.

## Access tiers

- anonymous visitors read only active public categories, services and resources;
- viewers and staff read the complete catalog in their assigned workspace;
- owners, administrators and managers configure the catalog;
- outsiders cannot see private or inactive workspace catalog records.

## Admin interface

`/admin/catalog` contains three working areas:

1. services, pricing, duration, capacity and required resources;
2. resources, capacity, timezone and bookable status;
3. service and resource categories with public, active and ordering controls.

## Explicitly deferred

Catalog Core does not create availability, bookings, checkout, discounts, reminders or public storefront layouts. Those layers must consume the canonical catalog later.
