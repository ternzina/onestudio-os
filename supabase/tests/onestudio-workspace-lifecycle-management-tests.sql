\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(26);

select has_function('public', 'list_my_workspace_management', array[]::text[], 'workspace management list exists');
select has_function('public', 'archive_my_workspace', array['uuid'], 'workspace archive RPC exists');
select has_function('public', 'restore_my_workspace', array['uuid'], 'workspace restore RPC exists');
select has_function('public', 'delete_my_empty_workspace', array['uuid','text'], 'workspace delete RPC exists');

insert into auth.users (id, email) values
  ('84000000-0000-4000-8000-000000000001', 'workspace.lifecycle.owner@example.test'),
  ('84000000-0000-4000-8000-000000000002', 'workspace.lifecycle.single@example.test'),
  ('84000000-0000-4000-8000-000000000003', 'workspace.lifecycle.manager@example.test');

insert into public.profiles (id, name, email, role) values
  ('84000000-0000-4000-8000-000000000001', 'Lifecycle Owner', 'workspace.lifecycle.owner@example.test', 'client'),
  ('84000000-0000-4000-8000-000000000002', 'Single Workspace Owner', 'workspace.lifecycle.single@example.test', 'client'),
  ('84000000-0000-4000-8000-000000000003', 'Lifecycle Manager', 'workspace.lifecycle.manager@example.test', 'client')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency, status) values
  ('85000000-0000-4000-8000-000000000001', 'lifecycle-alpha', 'Lifecycle Alpha', 'Europe/Kyiv', 'ru', 'UAH', 'active'),
  ('85000000-0000-4000-8000-000000000002', 'lifecycle-beta', 'Lifecycle Beta', 'Europe/Kyiv', 'ru', 'UAH', 'active'),
  ('85000000-0000-4000-8000-000000000003', 'lifecycle-data', 'Lifecycle Data', 'Europe/Kyiv', 'ru', 'UAH', 'active'),
  ('85000000-0000-4000-8000-000000000004', 'lifecycle-archived', 'Lifecycle Archived', 'Europe/Kyiv', 'ru', 'UAH', 'archived'),
  ('85000000-0000-4000-8000-000000000005', 'lifecycle-single', 'Lifecycle Single', 'Europe/Kyiv', 'ru', 'UAH', 'active');

insert into public.business_members (business_id, user_id, role, is_active, is_default) values
  ('85000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', 'owner', true, true),
  ('85000000-0000-4000-8000-000000000002', '84000000-0000-4000-8000-000000000001', 'owner', true, false),
  ('85000000-0000-4000-8000-000000000003', '84000000-0000-4000-8000-000000000001', 'owner', true, false),
  ('85000000-0000-4000-8000-000000000004', '84000000-0000-4000-8000-000000000001', 'owner', true, false),
  ('85000000-0000-4000-8000-000000000005', '84000000-0000-4000-8000-000000000002', 'owner', true, true),
  ('85000000-0000-4000-8000-000000000002', '84000000-0000-4000-8000-000000000003', 'manager', true, true);

insert into public.clients (id, business_id, name, email, locale)
values (
  '86000000-0000-4000-8000-000000000001',
  '85000000-0000-4000-8000-000000000003',
  'Lifecycle Client',
  'lifecycle.client@example.test',
  'ru'
);

select set_config('request.jwt.claim.sub', '84000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.list_my_workspace_management()), 4::bigint, 'management list includes every assigned workspace');
select is((select count(*) from public.list_my_workspace_management() where status = 'archived'), 1::bigint, 'management list includes archived workspaces');
select ok((select can_delete from public.list_my_workspace_management() where business_id = '85000000-0000-4000-8000-000000000001'), 'empty disposable workspace may be deleted');
select isnt((select can_delete from public.list_my_workspace_management() where business_id = '85000000-0000-4000-8000-000000000003'), true, 'workspace with a client may not be deleted');
select is((select client_count from public.list_my_workspace_management() where business_id = '85000000-0000-4000-8000-000000000003'), 1::bigint, 'workspace usage includes client count');

select is(
  public.archive_my_workspace('85000000-0000-4000-8000-000000000001'),
  '85000000-0000-4000-8000-000000000002'::uuid,
  'archiving current workspace returns replacement context'
);
select is((select status from public.businesses where id = '85000000-0000-4000-8000-000000000001'), 'archived', 'workspace is archived');
select is(public.current_business_id(), '85000000-0000-4000-8000-000000000002'::uuid, 'another workspace becomes current');
select ok(public.restore_my_workspace('85000000-0000-4000-8000-000000000001'), 'owner restores archived workspace');
select is((select status from public.businesses where id = '85000000-0000-4000-8000-000000000001'), 'active', 'restored workspace is active');

select throws_ok(
  $$select public.delete_my_empty_workspace('85000000-0000-4000-8000-000000000001', 'wrong name')$$,
  '22023',
  'workspace_confirmation_mismatch',
  'permanent deletion requires exact workspace name'
);
select throws_ok(
  $$select public.delete_my_empty_workspace('85000000-0000-4000-8000-000000000003', 'Lifecycle Data')$$,
  'P0001',
  'workspace_has_operational_data',
  'workspace with operational records cannot be deleted'
);
select is(
  public.delete_my_empty_workspace('85000000-0000-4000-8000-000000000001', 'Lifecycle Alpha'),
  '85000000-0000-4000-8000-000000000002'::uuid,
  'empty workspace is permanently deleted'
);
select is((select count(*) from public.businesses where id = '85000000-0000-4000-8000-000000000001'), 0::bigint, 'deleted workspace is gone');
select is((select count(*) from public.business_members where business_id = '85000000-0000-4000-8000-000000000001'), 0::bigint, 'workspace membership cascades on deletion');

reset role;
select set_config('request.jwt.claim.sub', '84000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$select public.archive_my_workspace('85000000-0000-4000-8000-000000000005')$$,
  'P0001',
  'cannot_archive_last_workspace',
  'last active workspace cannot be archived'
);
select is(
  public.delete_my_empty_workspace('85000000-0000-4000-8000-000000000005', 'Lifecycle Single'),
  null::uuid,
  'last empty demo workspace may be deleted'
);
select is(
  (select count(*) from public.businesses where id = '85000000-0000-4000-8000-000000000005'),
  0::bigint,
  'last deleted workspace is gone'
);

reset role;
select set_config('request.jwt.claim.sub', '84000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$select public.archive_my_workspace('85000000-0000-4000-8000-000000000002')$$,
  '42501',
  'workspace_owner_required',
  'manager cannot archive workspace'
);
select throws_ok(
  $$select public.restore_my_workspace('85000000-0000-4000-8000-000000000002')$$,
  '42501',
  'workspace_owner_required',
  'manager cannot restore workspace'
);
select throws_ok(
  $$select public.delete_my_empty_workspace('85000000-0000-4000-8000-000000000002', 'Lifecycle Beta')$$,
  '42501',
  'workspace_owner_required',
  'manager cannot delete workspace'
);

reset role;
select set_config('request.jwt.claim.sub', '84000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$select public.delete_my_empty_workspace('00000000-0000-4000-8000-000000000001', 'Main workspace')$$,
  'P0001',
  'workspace_foundation_cannot_be_deleted',
  'foundation workspace cannot be permanently deleted'
);

select * from finish();
rollback;
