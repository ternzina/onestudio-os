# OneStudio OS · Workspace Context 1.0

A brand-neutral foundation for studio and appointment-based business systems. This repository is no longer a copy of a specific client website. Client storefronts, languages, booking rules and visual themes are added as separate layers.

## Foundation layers

1. **Clean Base 2.0** removes client identity and secures the neutral schema.
2. **Clean Shell 1.0** preserves a generic application and admin shell.
3. **Core Modules 1.0** defines businesses, clients, services, resources, schedules and bookings.
4. **Workspace Context 1.0** selects the active business and enforces role-aware tenant boundaries.

## Added in Workspace Context 1.0

- one preferred workspace per authenticated user;
- deterministic `current_business_id()` resolution;
- owner, admin, manager, staff and viewer roles;
- separate view, operate, configure and manage permission tiers;
- tenant-safe RLS policies across CRM, catalog, scheduling and bookings;
- `/admin/workspace` for workspace selection and neutral identity settings;
- regression tests for workspace switching and cross-workspace access.

## Current module contract

- business workspaces and memberships;
- canonical clients and CRM records;
- one service catalog for appointments, rentals, classes and events;
- bookable resources for staff, spaces, equipment and capacity units;
- weekly availability and date-specific exceptions;
- one canonical booking table with conflict-safe resource allocations;
- per-business module registry.

## Deliberately not included yet

- client-specific public storefront pages;
- member invitations and ownership transfer UI;
- service and resource admin interfaces;
- public booking and admin booking interfaces;
- Stripe checkout and webhooks for the canonical booking table;
- business-specific legal documents;
- hardcoded languages, routes, prices, addresses or media.

## Database migrations

The canonical clean migration is:

`supabase/migrations/20260722000000_onestudio_clean_base.sql`

The core module contract is:

`supabase/migrations/20260724000000_core_modules_contract.sql`

The workspace context layer is:

`supabase/migrations/20260724010000_workspace_context.sql`

## Validation

Run locally:

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```

## Git checkpoints

- `clean-shell-1.0` preserves the pre-cleanup source snapshot.
- `core-foundation-v1.0` preserves the clean universal foundation.
- `core-modules-1.0` adds the universal module contract.
- `workspace-context-1.0` should be created only after database tests and the Next.js build pass.

Never commit `.env.local`, Vercel metadata, Supabase temporary files, build output or client secrets.
