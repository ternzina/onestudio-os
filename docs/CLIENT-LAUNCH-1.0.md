# Client Launch 1.0

Client Launch turns the one-time owner bootstrap into a complete first-business
setup. A new installation no longer opens with an empty catalog and no working
hours.

## First launch flow

The protected `/admin/bootstrap` wizard collects:

1. business name, type, timezone, locale, currency and country;
2. canonical business email, phone and address;
3. the first public service, price, duration and capacity;
4. the first bookable resource and its weekly working hours;
5. the optional modules needed by the workspace.

`launch_first_workspace(jsonb)` writes the complete setup in one database
transaction. If any validation or insert fails, the installation remains
unclaimed and no partial workspace is left behind.

## Module rules

Core, Catalog, Scheduling and CRM form the required operating foundation.
Optional modules can be changed later in `/admin/modules`.

Dependencies are normalized in the database:

- Portfolio enables Media.
- Notifications enables Payments.
- Documents enables Notifications and Payments.

Disabled modules disappear from the admin navigation and Command Center.
Direct navigation to a disabled module redirects to the module manager.

## Existing installations

The migration marks every existing workspace as already launched and preserves
its current enabled-module set. It does not overwrite company details,
catalog records, availability or existing module configuration.

## Verification

- `npm run lint`
- `npm run build`
- `npx supabase@beta db push --linked --dry-run`
- `npx supabase@beta migration up --local`
- `npx supabase@beta test db`

The Client Launch pgTAP file adds 26 checks for RPC privileges, tenant
boundaries, module dependency normalization and atomic first-workspace setup.
