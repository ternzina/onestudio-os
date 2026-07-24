# OneStudio OS · Admin i18n 1.0

A brand-neutral foundation for studio and appointment-based business systems. Client storefronts, languages, booking rules and visual themes are added as separate layers.

## Foundation layers

1. **Clean Base 2.0** removes client identity and secures the neutral schema.
2. **Clean Shell 1.0** preserves a generic application and admin shell.
3. **Core Modules 1.0** defines businesses, clients, services, resources, schedules and bookings.
4. **Workspace Context 1.0** selects the active business and enforces role-aware tenant boundaries.
5. **Admin Access & Bootstrap 1.0** creates the first owner and protects the administration area.
6. **Catalog Core 1.0** activates universal categories, services, resources, pricing and duration controls.
7. **Admin i18n 1.0** adds an independent Russian and English administration interface.

## Added in Admin i18n 1.0

- independent `RU / EN` administration preference;
- Russian administration interface by default;
- typed shared message catalog and placeholder interpolation;
- translated sign-in, owner registration and first-workspace bootstrap;
- translated admin shell, workspace, module map and Catalog Core;
- translated media, portfolio and foundation settings screens;
- locale-aware catalog prices;
- no coupling to the public website locale or workspace content language.

## Added in Catalog Core 1.0

- workspace-scoped service and resource categories;
- category links on canonical `services` and `resources`;
- database protection against cross-workspace and wrong-scope category links;
- atomic `replace_service_resources()` assignment;
- automatic module registry rows for future workspaces;
- `/admin/catalog` with working category, service and resource management;
- pricing models, duration ranges, capacity, visibility, active state and ordering;
- manager-level configuration with staff/viewer read-only access;
- regression tests for catalog security and tenant isolation.

## Current module contract

- business workspaces and memberships;
- first-owner bootstrap and protected administration;
- canonical clients and CRM records;
- categories for services and resources;
- one service catalog for appointments, rentals, classes and events;
- bookable resources for staff, spaces, equipment and capacity units;
- service-to-resource requirements;
- weekly availability and date-specific exceptions;
- one canonical booking table with conflict-safe resource allocations;
- per-business module registry.

## Deliberately not included yet

- public storefront catalog layouts;
- weekly schedules and availability administration;
- public booking and manual admin booking interfaces;
- Stripe checkout and payment records for canonical bookings;
- discounts, reminders and analytics;
- hardcoded languages, routes, prices, addresses or media.

## Database migrations

- `supabase/migrations/20260722000000_onestudio_clean_base.sql`
- `supabase/migrations/20260724000000_core_modules_contract.sql`
- `supabase/migrations/20260724010000_workspace_context.sql`
- `supabase/migrations/20260724020000_admin_access_bootstrap.sql`
- `supabase/migrations/20260724030000_catalog_core.sql`

## Validation

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.
