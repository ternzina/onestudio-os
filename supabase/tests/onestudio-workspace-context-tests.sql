\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(37);

select has_column('public', 'business_members', 'is_default', 'memberships store the preferred workspace');
select has_function('public', 'business_role', array['uuid'], 'business role helper exists');
select has_function('public', 'current_business_id', array[]::text[], 'current workspace helper exists');
select has_function('public', 'can_view_business', array['uuid'], 'workspace read permission helper exists');
select has_function('public', 'can_operate_business', array['uuid'], 'workspace operations permission helper exists');
select has_function('public', 'can_configure_business', array['uuid'], 'workspace configuration permission helper exists');
select has_function('public', 'can_manage_business', array['uuid'], 'workspace ownership permission helper exists');
select has_function('public', 'list_my_businesses', array[]::text[], 'workspace list RPC exists');
select has_function('public', 'set_default_business', array['uuid'], 'preferred workspace RPC exists');

insert into auth.users (id, email) values
  ('22000000-0000-4000-8000-000000000001', 'owner.workspace@example.test'),
  ('22000000-0000-4000-8000-000000000002', 'manager.workspace@example.test'),
  ('22000000-0000-4000-8000-000000000003', 'staff.workspace@example.test'),
  ('22000000-0000-4000-8000-000000000004', 'viewer.workspace@example.test'),
  ('22000000-0000-4000-8000-000000000005', 'outsider.workspace@example.test');

insert into public.profiles (id, name, email, role) values
  ('22000000-0000-4000-8000-000000000001', 'Workspace Owner', 'owner.workspace@example.test', 'client'),
  ('22000000-0000-4000-8000-000000000002', 'Workspace Manager', 'manager.workspace@example.test', 'client'),
  ('22000000-0000-4000-8000-000000000003', 'Workspace Staff', 'staff.workspace@example.test', 'client'),
  ('22000000-0000-4000-8000-000000000004', 'Workspace Viewer', 'viewer.workspace@example.test', 'client'),
  ('22000000-0000-4000-8000-000000000005', 'Workspace Outsider', 'outsider.workspace@example.test', 'client')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency) values
  ('23000000-0000-4000-8000-000000000001', 'workspace-alpha', 'Workspace Alpha', 'Europe/Warsaw', 'pl', 'PLN'),
  ('23000000-0000-4000-8000-000000000002', 'workspace-beta', 'Workspace Beta', 'Europe/Kyiv', 'uk', 'UAH');

select lives_ok($sql$
  insert into public.business_members (business_id, user_id, role, is_default) values
    ('23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', 'owner', true),
    ('23000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', 'admin', false),
    ('23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000002', 'manager', true),
    ('23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000003', 'staff', true),
    ('23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000004', 'viewer', true)
$sql$, 'owner, admin, manager, staff and viewer roles are accepted');

select throws_ok($sql$
  insert into public.business_members (business_id, user_id, role, is_default)
  values ('23000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', 'manager', true)
$sql$, '23505', null, 'a user cannot have two active preferred workspaces');

insert into public.clients (id, business_id, name, email, locale)
values ('24000000-0000-4000-8000-000000000001', '23000000-0000-4000-8000-000000000001', 'Workspace Client', 'client.workspace@example.test', 'pl');

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes
) values (
  '25000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000001',
  'workspace-service',
  'appointment',
  'Workspace Service',
  'fixed',
  10000,
  'PLN',
  60,
  60,
  60
);

-- Owner can see both assigned workspaces and switch the preferred one.
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(public.current_business_id(), '23000000-0000-4000-8000-000000000001'::uuid, 'preferred workspace is returned first');
select is(public.business_role('23000000-0000-4000-8000-000000000001'), 'owner', 'membership role is returned');
select ok(public.can_view_business('23000000-0000-4000-8000-000000000001'), 'owner may view workspace');
select ok(public.can_operate_business('23000000-0000-4000-8000-000000000001'), 'owner may operate workspace');
select ok(public.can_configure_business('23000000-0000-4000-8000-000000000001'), 'owner may configure workspace');
select ok(public.can_manage_business('23000000-0000-4000-8000-000000000001'), 'owner may manage workspace');
select is((select count(*) from public.list_my_businesses()), 2::bigint, 'workspace list contains only assigned workspaces');
select ok(public.set_default_business('23000000-0000-4000-8000-000000000002'), 'owner can change preferred workspace');
select is(public.current_business_id(), '23000000-0000-4000-8000-000000000002'::uuid, 'changed workspace becomes current');
select isnt(public.set_default_business('00000000-0000-4000-8000-000000000099'), true, 'unassigned workspace cannot become preferred');

reset role;

-- Manager can configure catalog records but not workspace identity.
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select ok(public.can_view_business('23000000-0000-4000-8000-000000000001'), 'manager may view workspace');
select ok(public.can_operate_business('23000000-0000-4000-8000-000000000001'), 'manager may operate workspace');
select ok(public.can_configure_business('23000000-0000-4000-8000-000000000001'), 'manager may configure workspace modules');
select isnt(public.can_manage_business('23000000-0000-4000-8000-000000000001'), true, 'manager cannot change workspace ownership settings');
select lives_ok($sql$
  update public.services
  set title = 'Manager Updated Service'
  where id = '25000000-0000-4000-8000-000000000001'
$sql$, 'manager can update the service catalog');
select is((select title from public.services where id = '25000000-0000-4000-8000-000000000001'), 'Manager Updated Service', 'manager catalog update is visible');
select lives_ok($sql$
  update public.businesses
  set name = 'Manager Must Not Rename'
  where id = '23000000-0000-4000-8000-000000000001'
$sql$, 'unauthorized workspace update is safely filtered by RLS');

reset role;
select is((select name from public.businesses where id = '23000000-0000-4000-8000-000000000001'), 'Workspace Alpha', 'manager could not rename workspace');

-- Staff can operate CRM but cannot configure the catalog.
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select ok(public.can_operate_business('23000000-0000-4000-8000-000000000001'), 'staff may operate workspace');
select isnt(public.can_configure_business('23000000-0000-4000-8000-000000000001'), true, 'staff cannot configure catalog');
select lives_ok($sql$
  update public.clients
  set notes = 'Updated by staff'
  where id = '24000000-0000-4000-8000-000000000001'
$sql$, 'staff can update CRM records');
select throws_ok($sql$
  insert into public.services (
    business_id, slug, kind, title, pricing_model, price_minor, currency,
    duration_min_minutes, duration_max_minutes, duration_step_minutes
  ) values (
    '23000000-0000-4000-8000-000000000001', 'staff-service', 'appointment',
    'Staff Service', 'fixed', 1000, 'PLN', 30, 30, 30
  )
$sql$, '42501', null, 'staff cannot create catalog records');

reset role;

-- Viewer gets read-only access; outsider gets no private workspace rows.
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.clients where business_id = '23000000-0000-4000-8000-000000000001'), 1::bigint, 'viewer can read workspace CRM');
select throws_ok($sql$
  insert into public.clients (business_id, name, locale)
  values ('23000000-0000-4000-8000-000000000001', 'Viewer Insert', 'en')
$sql$, '42501', null, 'viewer cannot write workspace CRM');

reset role;
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000005', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.clients where business_id = '23000000-0000-4000-8000-000000000001'), 0::bigint, 'outsider cannot read workspace CRM');
select is((select count(*) from public.list_my_businesses()), 0::bigint, 'outsider workspace list is empty');

select * from finish();
rollback;
