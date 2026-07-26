# OneStudio OS Company Profile 1.0

Company Profile is the canonical workspace-scoped source of company identity, contact, tax, banking and localization data.

## Route

`/admin/settings/company`

## Database

`public.company_profiles`, one row per `business_id`.

## Permissions

- Members may read their workspace profile.
- Owner, admin and manager may create or update it.
- Anonymous users have no direct table access.

## Legal integration

`get_public_legal_page()` renders legal templates from `company_profiles`. Values previously stored by Legal Engine 1.0 are migrated automatically.

## Verification

```bash
npx supabase@beta db reset
npx supabase@beta test db
npm run build
```
