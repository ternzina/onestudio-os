\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(27);

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
        "launch_id":"e2000000-0000-4000-8000-000000000001",
        "demo_slug":"lumiere",
        "business_name":"Luna Beauty",
        "tagline":"Красота в вашем ритме",
        "palette_index":1,
        "locales":["ru","en"],
        "primary_locale":"ru",
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
  (select launch_key::text from public.business_launch_profiles p
   join public.business_members m on m.business_id = p.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  'e2000000-0000-4000-8000-000000000001',
  'launch idempotency key is stored'
);
select is(
  (select locales[1] from public.business_launch_profiles p
   join public.business_members m on m.business_id = p.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  'ru',
  'selected language order is preserved'
);
select is(
  (select b.default_locale from public.businesses b
   join public.business_members m on m.business_id = b.id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'),
  'ru',
  'explicit primary language becomes the workspace default'
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
select is(
  (select locale.draft_content->>'theme_accent'
   from public.public_site_locales locale
   join public.business_members m on m.business_id = locale.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and locale.locale = 'ru'),
  '#d7bd88',
  'chosen demo palette is transferred to the real public site'
);
select ok(
  (select locale.published_content is not null
   from public.public_site_locales locale
   join public.business_members m on m.business_id = locale.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and locale.locale = 'ru'),
  'primary locale is published'
);
select ok(
  (select locale.published_content is null
   from public.public_site_locales locale
   join public.business_members m on m.business_id = locale.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and locale.locale = 'en'),
  'secondary locale remains an unpublished draft'
);
select is(
  (select locale.draft_content->>'hero_eyebrow'
   from public.public_site_locales locale
   join public.business_members m on m.business_id = locale.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and locale.locale = 'en'),
  'Beauty salon',
  'secondary locale receives its own localized demo copy'
);
select is(
  (select locale.draft_content->>'hero_title'
   from public.public_site_locales locale
   join public.business_members m on m.business_id = locale.business_id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and locale.locale = 'ru'),
  'Красота в вашем ритме',
  'primary locale keeps the configured tagline'
);

select lives_ok(
  $sql$
    select * from public.create_configured_workspace(
      '{
        "launch_id":"e2000000-0000-4000-8000-000000000001",
        "demo_slug":"lumiere",
        "business_name":"Luna Beauty",
        "tagline":"Красота в вашем ритме",
        "palette_index":1,
        "locales":["ru","en"],
        "primary_locale":"ru",
        "currency":"EUR",
        "enabled_modules":["core","catalog","scheduling","crm","notifications"]
      }'::jsonb
    )
  $sql$,
  'an identical retry returns the original launch safely'
);
select is(
  (select count(*) from public.business_members
   where user_id = 'e1000000-0000-4000-8000-000000000001'),
  1::bigint,
  'identical retry does not create another workspace'
);
select is(
  (select count(*) from public.business_launch_profiles
   where launch_key = 'e2000000-0000-4000-8000-000000000001'),
  1::bigint,
  'one launch key maps to exactly one workspace'
);

select lives_ok(
  $sql$
    select * from public.create_configured_workspace(
      '{
        "launch_id":"e2000000-0000-4000-8000-000000000002",
        "demo_slug":"frame-house",
        "business_name":"Second Studio",
        "tagline":"Пространство для ваших историй",
        "palette_index":0,
        "locales":["en","ru"],
        "primary_locale":"en",
        "currency":"USD",
        "enabled_modules":["core","catalog","scheduling","portfolio"]
      }'::jsonb
    )
  $sql$,
  'a new launch id may create a second isolated workspace'
);
select is(
  (select count(*) from public.business_members
   where user_id = 'e1000000-0000-4000-8000-000000000001'),
  2::bigint,
  'a genuinely new launch creates a second workspace'
);
select is(
  (select count(*) from public.business_members
   where user_id = 'e1000000-0000-4000-8000-000000000001'
     and is_default),
  1::bigint,
  'the account still has exactly one current workspace'
);
select is(
  (select b.name from public.businesses b
   join public.business_members m on m.business_id = b.id
   where m.user_id = 'e1000000-0000-4000-8000-000000000001'
     and m.is_default),
  'Second Studio',
  'the newly created workspace becomes current'
);

select lives_ok(
  $sql$
    select * from public.create_configured_workspace(
      '{
        "launch_id":"e2000000-0000-4000-8000-000000000003",
        "demo_slug":"north-flow",
        "business_name":"Bordeaux Pilates",
        "tagline":"Сильное тело. Спокойный ум.",
        "palette_index":3,
        "locales":["ru","en"],
        "primary_locale":"ru",
        "currency":"EUR",
        "enabled_modules":["core","catalog","scheduling","crm"]
      }'::jsonb
    )
  $sql$,
  'the fourth Bordeaux palette creates a workspace successfully'
);
select is(
  (select locale.draft_content->>'theme_accent'
   from public.public_site_locales locale
   join public.businesses business on business.id = locale.business_id
   where business.name = 'Bordeaux Pilates'
     and locale.locale = 'ru'),
  '#9d3151',
  'the fourth palette is transferred to the created public site'
);

select * from finish();
rollback;
