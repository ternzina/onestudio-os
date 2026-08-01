\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(4);

insert into auth.users (id, email)
values ('e7100000-0000-4000-8000-000000000001', 'services.runtime.owner@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  'e7200000-0000-4000-8000-000000000001',
  'services-runtime-test',
  'Services Runtime Test',
  'Europe/Kyiv',
  'en',
  'EUR',
  'active'
);

insert into public.business_members (business_id, user_id, role, is_default)
values (
  'e7200000-0000-4000-8000-000000000001',
  'e7100000-0000-4000-8000-000000000001',
  'owner',
  true
);

select set_config('request.jwt.claim.sub', 'e7100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'e7200000-0000-4000-8000-000000000001',
      'en',
      '{"hero_title":"Runtime-safe services draft","show_services":true}'::jsonb,
      true
    )
  $sql$,
  'legacy draft save executes after services presentation fields are added'
);

reset role;

select is(
  (
    select draft_content->>'hero_title'
    from public.public_site_locales
    where business_id = 'e7200000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'Runtime-safe services draft',
  'draft content is persisted by the runtime-safe save function'
);

select is(
  (
    select draft_content->>'services_layout'
    from public.public_site_locales
    where business_id = 'e7200000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'cards',
  'services presentation defaults are persisted'
);

select ok(
  position(
    'save_public_site_draft_v22'
    in pg_get_functiondef(
      'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'legacy save RPC delegates to v22'
);

select * from finish();
rollback;
