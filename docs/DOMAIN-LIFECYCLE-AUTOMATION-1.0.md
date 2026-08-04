# Domain Lifecycle Automation 1.0

## Problem fixed

The client dashboard removed a custom domain from Vercel before deleting a workspace, but the admin workspace screen called `delete_my_empty_workspace` directly. Because `public_site_domains.business_id` uses `ON DELETE CASCADE`, Supabase deleted the domain row while Vercel kept the domain. That created historical orphan domains such as a domain that no longer existed in OneStudio OS but still received aliases and SSL attempts in Vercel.

## Runtime contract

Both deletion surfaces now call one server route:

`POST /api/client/workspaces/delete`

The route:

1. authenticates the signed-in user;
2. loads `list_my_workspace_management` and verifies ownership, exact-name confirmation and `can_delete`;
3. reads the connected primary and redirect domains with the service role;
4. creates a durable `domain_lifecycle_events` audit row;
5. removes both domains from Vercel;
6. calls `delete_my_empty_workspace`;
7. records completion;
8. if database deletion fails after Vercel detachment, attempts to reconnect the domain and records the rollback.

The audit table intentionally has no foreign key to `businesses`, so its evidence survives deletion of the workspace.

## Safety properties

- No workspace is deleted when Vercel domain removal fails.
- No Vercel domain is touched before the workspace deletion preflight passes.
- The foundation workspace remains undeletable.
- Workspaces with operational data remain archive-only.
- Exact-name confirmation remains mandatory.
- The browser no longer coordinates several independent destructive requests.

## Historical orphan cleanup

This layer prevents new orphan domains. Existing historical orphans must be removed once after explicitly comparing the Vercel project-domain list with the current `public_site_domains` table. Never remove platform domains or `.vercel.app` domains through bulk cleanup.
