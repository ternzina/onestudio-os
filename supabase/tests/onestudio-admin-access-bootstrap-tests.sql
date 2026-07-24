\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(38);

select has_table('public', 'system_installation', 'single-row installation state table exists');
select has_column('public', 'system_installation', 'bootstrapped_at', 'installation records bootstrap completion');
select has_column('public', 'system_installation', 'owner_user_id', 'installation records the first owner');
select has_column('public', 'system_installation', 'business_id', 'installation records the first workspace');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.system_installation'::regclass),
  'installation state has RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'public.system_installation', 'SELECT'),
  'anonymous visitors cannot read installation internals directly'
);

select has_function('public', 'admin_bootstrap_available', array[]::text[], 'bootstrap availability RPC exists');
select has_function('public', 'get_admin_access_state', array[]::text[], 'admin access state RPC exists');
select has_function(
  'public',
  'bootstrap_first_workspace',
  array['text', 'text', 'text', 'text'],
  'first workspace bootstrap RPC exists'
);
select has_trigger('auth', 'users', 'on_auth_user_created', 'new auth users receive a profile');
select ok(
  not has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
  'profile trigger function is not callable by anonymous visitors'
);

select ok(
  has_function_privilege('anon', 'public.admin_bootstrap_available()', 'EXECUTE'),
  'anonymous visitors may check whether first-owner setup is open'
);
select ok(
  not has_function_privilege('anon', 'public.get_admin_access_state()', 'EXECUTE'),
  'anonymous visitors cannot inspect admin access state'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.bootstrap_first_workspace(text,text,text,text)',
    'EXECUTE'
  ),
  'anonymous visitors cannot bootstrap a workspace'
);
select ok(
  has_function_privilege('authenticated', 'public.get_admin_access_state()', 'EXECUTE'),
  'authenticated users may resolve their admin access state'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.bootstrap_first_workspace(text,text,text,text)',
    'EXECUTE'
  ),
  'authenticated users may attempt the guarded bootstrap operation'
);
select ok(public.admin_bootstrap_available(), 'fresh installation allows one first-owner bootstrap');

insert into auth.users (
  id,
  email,
  raw_user_meta_data
) values (
  '31000000-0000-4000-8000-000000000001',
  'first.owner@example.test',
  '{"full_name":"First Owner"}'::jsonb
);

select is(
  (select count(*) from public.profiles where id = '31000000-0000-4000-8000-000000000001'),
  1::bigint,
  'auth trigger creates exactly one profile'
);
select is(
  (select role from public.profiles where id = '31000000-0000-4000-8000-000000000001'),
  'client',
  'new account is not silently promoted before bootstrap'
);

select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (select access_state from public.get_admin_access_state()),
  'bootstrap_required',
  'first authenticated account is sent to initial setup'
);
select is(
  (select business_id from public.get_admin_access_state()),
  null::uuid,
  'no workspace is assigned before bootstrap'
);
select is(
  (
    select business_id
    from public.bootstrap_first_workspace(
      'OneStudio Test Workspace',
      'Europe/Kyiv',
      'uk',
      'uah'
    )
  ),
  '00000000-0000-4000-8000-000000000001'::uuid,
  'bootstrap activates the stable main workspace'
);

reset role;

select is(
  (select role from public.profiles where id = '31000000-0000-4000-8000-000000000001'),
  'admin',
  'first installation owner receives legacy admin compatibility'
);
select is(
  (select name from public.businesses where id = '00000000-0000-4000-8000-000000000001'),
  'OneStudio Test Workspace',
  'bootstrap saves the workspace name'
);
select is(
  (select timezone from public.businesses where id = '00000000-0000-4000-8000-000000000001'),
  'Europe/Kyiv',
  'bootstrap validates and saves the timezone'
);
select is(
  (select default_locale from public.businesses where id = '00000000-0000-4000-8000-000000000001'),
  'uk',
  'bootstrap saves a neutral locale code'
);
select is(
  (select default_currency from public.businesses where id = '00000000-0000-4000-8000-000000000001'),
  'UAH',
  'bootstrap normalizes the currency code'
);
select is(
  (
    select role
    from public.business_members
    where business_id = '00000000-0000-4000-8000-000000000001'
      and user_id = '31000000-0000-4000-8000-000000000001'
  ),
  'owner',
  'first administrator is the workspace owner'
);
select ok(
  (
    select is_default
    from public.business_members
    where business_id = '00000000-0000-4000-8000-000000000001'
      and user_id = '31000000-0000-4000-8000-000000000001'
  ),
  'bootstrapped workspace becomes the current workspace'
);

select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (select access_state from public.get_admin_access_state()),
  'ready',
  'owner receives ready admin access after bootstrap'
);
select is(
  (select business_role from public.get_admin_access_state()),
  'owner',
  'admin access state exposes the active workspace role'
);
select throws_ok(
  $sql$
    select * from public.bootstrap_first_workspace('Duplicate', 'UTC', 'en', 'EUR')
  $sql$,
  '23505',
  'account_already_has_workspace',
  'the same account cannot run bootstrap twice'
);

reset role;
select isnt(public.admin_bootstrap_available(), true, 'first-owner bootstrap closes after success');

insert into auth.users (
  id,
  email,
  raw_user_meta_data
) values (
  '31000000-0000-4000-8000-000000000002',
  'second.user@example.test',
  '{"full_name":"Second User"}'::jsonb
);

select is(
  (select count(*) from public.profiles where id = '31000000-0000-4000-8000-000000000002'),
  1::bigint,
  'later auth accounts still receive profiles'
);

select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (select access_state from public.get_admin_access_state()),
  'denied',
  'unassigned account cannot enter another workspace admin'
);
select throws_ok(
  $sql$
    select * from public.bootstrap_first_workspace('Second Workspace', 'UTC', 'en', 'EUR')
  $sql$,
  '42501',
  'bootstrap_already_completed',
  'a second account cannot seize first-owner bootstrap'
);

reset role;

select is(
  (select role from public.profiles where id = '31000000-0000-4000-8000-000000000002'),
  'client',
  'denied account remains an ordinary client profile'
);
select is(
  (
    select count(*)
    from public.business_members
    where user_id = '31000000-0000-4000-8000-000000000002'
  ),
  0::bigint,
  'denied account receives no hidden workspace membership'
);

select * from finish();
rollback;
