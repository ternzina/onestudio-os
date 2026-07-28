# OneStudio OS Core Suite 1.0

Core Suite 1.0 is the first integrated release of the shared OneStudio OS
foundation plus nine enabled product modules.

## Included modules

1. Media library
2. Portfolio
3. Catalog
4. Scheduling
5. Clients and CRM
6. Payments
7. Notifications
8. Documents and Legal
9. Analytics

The shared Core module provides authentication, workspace isolation, roles,
business identity and common configuration.

## Integration guarantees

- Every existing and newly created workspace receives the same ten canonical
  `business_modules` records: Core plus the nine product modules.
- The former database key `legal` is migrated to the canonical `documents` key.
- The frontend module registry and database module registry use the same keys.
- Analytics declares its dependency on Payments because it reads the immutable
  payment ledger.
- The Command Center reads live, workspace-local counts for today's bookings,
  unpaid bookings, unsent documents and failed notifications.
- The Command Center RPC accepts viewers but rejects anonymous users and users
  outside the selected workspace.
- Reusable source code contains no personal company, tax or bank defaults.

## Release verification

Before tagging the release:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Apply migrations to a local Supabase instance.
4. Run all database tests with `npx supabase@beta test db`.
5. Apply the single Core Suite migration to the linked project.
6. Verify `/admin`, `/admin/modules` and all nine product module routes.
7. Confirm the four Command Center cards show live numeric values.
