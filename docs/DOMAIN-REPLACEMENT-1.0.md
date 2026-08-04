# Domain Replacement 1.0

## Goal

A client can disconnect a custom domain without deleting the website, or replace it without downtime.

## Client flows

### Disconnect domain

- Removes the primary and redirect domain from Vercel.
- Cancels any unfinished replacement.
- Removes domain state from Supabase.
- Keeps the website, content and OneStudio public URL.

### Replace domain

1. The current domain stays active.
2. The candidate domain is added to Vercel and stored in `public_site_domain_replacements`.
3. OneStudio shows the exact verification and routing DNS records for the candidate.
4. The candidate must become verified, DNS-configured and HTTPS-ready.
5. `promote_public_site_domain_replacement()` atomically makes the candidate the primary database domain.
6. OneStudio removes the previous primary and redirect domains from Vercel.
7. If old-domain cleanup fails, the new domain remains active and the replacement stays in `cleanup_pending` for a safe retry.

## Safety rules

- A site can have only one replacement in progress.
- A candidate domain can be reserved only once.
- The current domain is never removed before the candidate is active with HTTPS.
- Cancelling a replacement does not touch the current domain.
- Workspace deletion removes the current domain, candidate domain and any previous cleanup-pending domain before deleting the workspace.
- Database promotion is atomic. Vercel cleanup happens after promotion so a cleanup failure cannot take the new website offline.

## Files

- `components/dashboard/ClientDomainManager.tsx`
- `app/api/client/domains/route.ts`
- `app/api/client/workspaces/delete/route.ts`
- `supabase/migrations/20260804223000_domain_replacement_1_0.sql`
- `supabase/tests/onestudio-domain-replacement-tests.sql`
