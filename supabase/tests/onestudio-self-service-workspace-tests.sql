\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

select has_function(
  'public', 'create_configured_workspace', array['jsonb'],
  'self-service workspace RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.create_configured_workspace(jsonb)', 'EXECUTE'),
  'authenticated users may create their workspace'
);
select ok(
  not has_function_privilege('anon', 'public.create_configured_workspace(jsonb)', 'EXECUTE'),
  'anonymous visitors cannot create a workspace'
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  'e1000000-0000-4000-8000-000000000001',
  'self-service@example.test',
  '{"full_name":"Self Service Owner"}'::jsonb
);

select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select * from public.create_configured_workspace(
      '{
        "demo_slug":"lumiere",
        "business_name":"Luna Beauty",
        "tagline":"Красота в вашем ритме",
        "palette_index":1,
        "locales":["ru","en"],
        "currency":"EUR",
        "enabled_modules":["core","catalog","scheduling","crm","notifications"]
      }'::jsonb
    )
  $sql$,
  'authenticated user creates an isolated configured workspace'
);

select is(
  (select count(*) from public.business_members
   where user_id = 'e1000000-0000-4000-8000-000000000001' and role = 'owner'),
  1::bigint,
  'creator is the workspace owner'
);
select is(
  (select name from public.businesses b join public.business_members m on m.business_id = b.id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  'Luna Beauty',
  'workspace name comes from configurator'
);
select is(
  (select demo_slug from public.business_launch_profiles p
   join public.business_members m on m.business_id = p.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  'lumiere',
  'selected demo is stored'
);
select is(
  (select cardinality(locales) from public.business_launch_profiles p
   join public.business_members m on m.business_id = p.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  2,
  'selected languages are stored'
);
select ok(
  (select enabled from public.business_modules module
   join public.business_members m on m.business_id = module.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and module.module_key = 'notifications'),
  'selected notification module is enabled'
);
select ok(
  (select enabled from public.business_modules module
   join public.business_members m on m.business_id = module.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and module.module_key = 'payments'),
  'notification dependency enables payments'
);
select is(
  (select count(*) from public.public_site_locales locale
   join public.business_members m on m.business_id = locale.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  2::bigint,
  'draft site locales are created'
);
select throws_ok(
  $sql$
    select * from public.create_configured_workspace(
      '{"demo_slug":"lumiere","business_name":"Duplicate","locales":["en"],"currency":"EUR"}'::jsonb
    )
  $sql$,
  '23505',
  'account_already_has_workspace',
  'retry cannot create a duplicate workspace'
);
select is(
  (select count(*) from public.business_members
   where user_id = 'e1000000-0000-4000-8000-000000000001'),
  1::bigint,
  'failed retry leaves exactly one membership'
);

select * from finish();
rollback;
