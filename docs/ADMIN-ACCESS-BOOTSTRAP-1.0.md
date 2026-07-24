# Admin Access & Bootstrap 1.0

This layer adds the first real administration door to OneStudio OS.

## Contract

- Supabase Auth owns identity and password security.
- `@supabase/ssr` stores the browser session in cookies shared with Next.js.
- root `proxy.ts` refreshes the session and protects every `/admin` route.
- `get_admin_access_state()` returns one deterministic state: `signed_out`, `bootstrap_required`, `ready`, or `denied`.
- `bootstrap_first_workspace()` is authenticated, transaction-locked and can succeed only once.
- the first installation owner is linked to the stable `main` workspace as `owner` and receives the legacy `profiles.role = admin` compatibility flag.
- later accounts are never promoted automatically and cannot seize the first workspace.

## Deliberately not included

- team invitations;
- password recovery delivery configuration;
- Google or Apple sign-in;
- multi-workspace self-service registration;
- module-specific permission screens.

Those belong to later layers after the first owner and protected admin shell are stable.
