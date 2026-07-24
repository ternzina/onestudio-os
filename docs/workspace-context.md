# OneStudio OS · Workspace Context 1.0

## Why this layer exists

Core Modules 1.0 already created `businesses` and `business_members`. Workspace Context 1.0 does not duplicate them with a second `studios` table. It turns that contract into the active security and navigation boundary for the application.

Every future catalog, client, schedule, booking, payment and notification operation must resolve a business workspace first.

## Current workspace

Each active membership has an `is_default` flag. A user can have at most one active preferred workspace.

- `current_business_id()` returns the preferred workspace.
- If no membership is marked preferred, it selects a deterministic fallback.
- `list_my_businesses()` returns only workspaces assigned to the signed-in user.
- `set_default_business()` refuses workspaces where the user has no active membership.

## Roles

- `owner`: full workspace identity, membership and module control.
- `admin`: full workspace identity, membership and module control.
- `manager`: catalog, resources and scheduling configuration plus daily operations.
- `staff`: daily CRM and booking operations without structural configuration.
- `viewer`: read-only access to workspace operational data.

Global platform administrators retain access through the existing `is_admin()` foundation helper.

## Permission helpers

- `can_view_business()` covers every active member.
- `can_operate_business()` covers owner, admin, manager and staff.
- `can_configure_business()` covers owner, admin and manager.
- `can_manage_business()` covers owner and admin.

These helpers are `security definer` functions with a fixed `search_path`, so RLS policies can query membership without recursive policy evaluation.

## Admin interface

`/admin/workspace` lets an assigned member:

- switch between assigned workspaces;
- choose the preferred workspace;
- view role and status;
- edit name, timezone, locale and currency when the role is owner or admin.

The page uses the authenticated browser Supabase client. Database RLS remains the final authority, so hiding a button is never the security boundary.

## Deliberately postponed

- inviting members by email;
- ownership transfer workflow;
- custom role permissions;
- domains and SaaS tenant routing;
- module subscription billing;
- public storefront selection by hostname.

Those features should be added only after the catalog and booking interfaces consistently use `current_business_id()`.
