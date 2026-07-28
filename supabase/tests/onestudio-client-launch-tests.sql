\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(26);

select has_table(
  'public',
  'business_launch_profiles',
  'client launch profile table exists'
);
select has_column(
  'public',
  'business_launch_profiles',
  'completed_at',
  'client launch profile records completion'
);
select has_function(
  'public',
  'configure_business_modules',
  array['uuid', 'text[]'],
  'dependency-safe module configuration RPC exists'
);
select has_function(
  'public',
  'launch_first_workspace',
  array['jsonb'],
  'atomic first workspace launch RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.configure_business_modules(uuid,text[])',
    'EXECUTE'
  ),
  'authenticated owners may request module configuration'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.configure_business_modules(uuid,text[])',
    'EXECUTE'
  ),
  'anonymous visitors cannot configure modules'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.launch_first_workspace(jsonb)',
    'EXECUTE'
  ),
  'authenticated first owner may launch a workspace'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.launch_first_workspace(jsonb)',
    'EXECUTE'
  ),
  'anonymous visitors cannot launch a workspace'
);
select ok(
  (
    select completed_at is not null
    from public.business_launch_profiles
    where business_id = '00000000-0000-4000-8000-000000000001'
  ),
  'existing stable workspace is marked as already launched'
);

insert into auth.users (id, email)
values ('d1000000-0000-4000-8000-000000000001', 'modules.owner@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency
)
values (
  'd2000000-0000-4000-8000-000000000001',
  'module-selection-test',
  'Module Selection Test',
  'UTC',
  'en',
  'EUR'
);

insert into public.business_members (
  business_id, user_id, role, is_default
)
values (
  'd2000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000001',
  'owner',
  true
);

select set_config(
  'request.jwt.claim.sub',
  'd1000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select *
    from public.configure_business_modules(
      'd2000000-0000-4000-8000-000000000001',
      array['analytics']
    )
  $sql$,
  'owner saves a minimal optional module selection'
);
select is(
  (
    select count(*)
    from public.business_modules
    where business_id = 'd2000000-0000-4000-8000-000000000001'
      and enabled
  ),
  5::bigint,
  'required operational modules plus analytics are enabled'
);
select ok(
  (
    select enabled
    from public.business_modules
    where business_id = 'd2000000-0000-4000-8000-000000000001'
      and module_key = 'core'
  ),
  'core cannot be disabled'
);
select isnt(
  (
    select enabled
    from public.business_modules
    where business_id = 'd2000000-0000-4000-8000-000000000001'
      and module_key = 'media'
  ),
  true,
  'unselected media module is disabled'
);
select is(
  (
    select cardinality(enabled_modules)
    from public.business_launch_profiles
    where business_id = 'd2000000-0000-4000-8000-000000000001'
  ),
  5,
  'launch profile stores the normalized module selection'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  'd1000000-0000-4000-8000-000000000099',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $sql$
    select *
    from public.configure_business_modules(
      'd2000000-0000-4000-8000-000000000001',
      array['media']
    )
  $sql$,
  '42501',
  'module_configuration_forbidden',
  'outsider cannot configure another workspace'
);

reset role;
update public.system_installation
set bootstrapped_at = null,
    owner_user_id = null,
    business_id = null,
    updated_at = now()
where id = 1;

insert into auth.users (id, email, raw_user_meta_data)
values (
  'd1000000-0000-4000-8000-000000000002',
  'launch.owner@example.test',
  '{"full_name":"Launch Owner"}'::jsonb
);

select set_config(
  'request.jwt.claim.sub',
  'd1000000-0000-4000-8000-000000000002',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $launch$
    select *
    from public.launch_first_workspace(
      '{
        "business_name":"Launch Studio",
        "business_type":"photo_studio",
        "timezone":"Europe/Kyiv",
        "locale":"uk",
        "currency":"UAH",
        "country_code":"UA",
        "email":"hello@launch.example",
        "phone":"+380501234567",
        "address":"Kyiv",
        "service_title":"Portrait session",
        "service_kind":"appointment",
        "pricing_model":"fixed",
        "price_minor":250000,
        "duration_minutes":90,
        "service_capacity":4,
        "resource_name":"Main studio",
        "resource_kind":"space",
        "resource_capacity":8,
        "open_time":"09:00",
        "close_time":"18:00",
        "work_days":[1,2,3,4,5],
        "enabled_modules":["portfolio"]
      }'::jsonb
    )
  $launch$,
  'first owner launches the complete workspace atomically'
);
select is(
  (
    select name
    from public.businesses
    where id = '00000000-0000-4000-8000-000000000001'
  ),
  'Launch Studio',
  'launch saves workspace identity'
);
select is(
  (
    select email
    from public.company_profiles
    where business_id = '00000000-0000-4000-8000-000000000001'
  ),
  'hello@launch.example',
  'launch saves the canonical company contact'
);
select is(
  (
    select count(*)
    from public.services
    where id = (
      select first_service_id
      from public.business_launch_profiles
      where business_id = '00000000-0000-4000-8000-000000000001'
    )
      and title = 'Portrait session'
  ),
  1::bigint,
  'launch creates the first public service'
);
select is(
  (
    select count(*)
    from public.resources
    where id = (
      select first_resource_id
      from public.business_launch_profiles
      where business_id = '00000000-0000-4000-8000-000000000001'
    )
      and name = 'Main studio'
  ),
  1::bigint,
  'launch creates the first bookable resource'
);
select is(
  (
    select count(*)
    from public.availability_rules
    where resource_id = (
      select first_resource_id
      from public.business_launch_profiles
      where business_id = '00000000-0000-4000-8000-000000000001'
    )
  ),
  5::bigint,
  'launch creates weekly availability for selected work days'
);
select is(
  (
    select count(*)
    from public.service_resources
    where service_id = (
      select first_service_id
      from public.business_launch_profiles
      where business_id = '00000000-0000-4000-8000-000000000001'
    )
      and resource_id = (
        select first_resource_id
        from public.business_launch_profiles
        where business_id = '00000000-0000-4000-8000-000000000001'
      )
  ),
  1::bigint,
  'launch connects the first service to its resource'
);
select is(
  (
    select count(*)
    from public.business_modules
    where business_id = '00000000-0000-4000-8000-000000000001'
      and enabled
  ),
  6::bigint,
  'portfolio selection automatically includes media and required operations'
);
select isnt(
  (
    select enabled
    from public.business_modules
    where business_id = '00000000-0000-4000-8000-000000000001'
      and module_key = 'payments'
  ),
  true,
  'unselected payment module remains disabled'
);
select ok(
  (
    select completed_at is not null
      and business_type = 'photo_studio'
    from public.business_launch_profiles
    where business_id = '00000000-0000-4000-8000-000000000001'
  ),
  'launch audit records completion and business type'
);
select throws_ok(
  $launch$
    select *
    from public.launch_first_workspace(
      '{
        "business_name":"Second Launch",
        "business_type":"other",
        "timezone":"UTC",
        "locale":"en",
        "currency":"EUR",
        "country_code":"UA",
        "email":"second@launch.example",
        "service_title":"Second service",
        "service_kind":"appointment",
        "pricing_model":"fixed",
        "price_minor":1000,
        "duration_minutes":60,
        "service_capacity":1,
        "resource_name":"Second resource",
        "resource_kind":"other",
        "resource_capacity":1,
        "open_time":"09:00",
        "close_time":"18:00",
        "work_days":[1],
        "enabled_modules":[]
      }'::jsonb
    )
  $launch$,
  '23505',
  'account_already_has_workspace',
  'the first owner cannot launch a second installation workspace'
);

reset role;
select * from finish();
rollback;
