\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(89);

select has_column('public', 'clients', 'archived_at', 'clients may be archived without deletion');

select has_column('public', 'clients', 'archived_by', 'client archive actor is recorded');

select has_table('public', 'client_events', 'client activity table exists');

select has_column('public', 'client_events', 'changes', 'client activity keeps structured changes');

select ok((select relrowsecurity from pg_class where oid = 'public.client_events'::regclass), 'RLS is enabled on client events');

select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='clients_business_archived_name_idx'), 'client archive listing index exists');

select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='clients_business_phone_identity_idx'), 'client phone identity index exists');

select has_function('public', 'normalize_client_phone', array['text'], 'client phone normalizer exists');

select has_function('public', 'normalize_client_tags', array['text[]'], 'client tag normalizer exists');

select has_function('public', 'create_admin_client', array['uuid','text','text','text','text','text','text[]'], 'client creation RPC exists');

select has_function('public', 'update_admin_client', array['uuid','text','text','text','text','text','text[]'], 'client update RPC exists');

select has_function('public', 'set_admin_client_archived', array['uuid','boolean'], 'client archive RPC exists');

select has_function('public', 'merge_admin_clients', array['uuid','uuid'], 'client merge RPC exists');

select has_function('public', 'get_admin_clients_crm', array['uuid','boolean'], 'CRM summary RPC exists');

select has_function('public', 'get_admin_client_bookings', array['uuid'], 'client booking history RPC exists');

select has_function('public', 'get_admin_client_events', array['uuid'], 'client activity RPC exists');

select has_trigger('public', 'bookings', 'reactivate_booking_client_on_booking', 'bookings restore archived client identities');

select ok(has_function_privilege('authenticated', 'public.create_admin_client(uuid,text,text,text,text,text,text[])', 'EXECUTE'), 'authenticated operators may call client creation');

select ok(not has_function_privilege('anon', 'public.create_admin_client(uuid,text,text,text,text,text,text[])', 'EXECUTE'), 'anonymous visitors cannot call client creation');

select ok(has_function_privilege('authenticated', 'public.get_admin_clients_crm(uuid,boolean)', 'EXECUTE'), 'authenticated members may read CRM summaries');

select ok(not has_function_privilege('anon', 'public.get_admin_clients_crm(uuid,boolean)', 'EXECUTE'), 'anonymous visitors cannot read CRM summaries');

select ok(not has_table_privilege('anon', 'public.client_events', 'SELECT'), 'anonymous visitors cannot read client activity');

select ok(has_table_privilege('authenticated', 'public.client_events', 'SELECT'), 'authenticated members may read client activity through RLS');

select ok(not has_table_privilege('authenticated', 'public.client_events', 'INSERT'), 'authenticated users cannot forge client activity');
select ok(not has_table_privilege('authenticated', 'public.clients', 'INSERT'), 'authenticated operators cannot bypass guarded client creation');
select ok(not has_table_privilege('authenticated', 'public.clients', 'UPDATE'), 'authenticated operators cannot bypass guarded client updates');
select ok(not has_table_privilege('authenticated', 'public.clients', 'DELETE'), 'authenticated operators cannot delete canonical clients directly');

select ok(obj_description('public.client_events'::regclass, 'pg_class') is not null, 'client activity table is documented');

select ok(obj_description('public.create_admin_client(uuid,text,text,text,text,text,text[])'::regprocedure, 'pg_proc') is not null, 'client creation RPC is documented');

select ok(obj_description('public.merge_admin_clients(uuid,uuid)'::regprocedure, 'pg_proc') is not null, 'client merge RPC is documented');


insert into auth.users (id, email) values
  ('91000000-0000-4000-8000-000000000001', 'crm.owner@example.test'),
  ('91000000-0000-4000-8000-000000000002', 'crm.viewer@example.test'),
  ('91000000-0000-4000-8000-000000000003', 'crm.outsider@example.test'),
  ('91000000-0000-4000-8000-000000000004', 'crm.login.one@example.test'),
  ('91000000-0000-4000-8000-000000000005', 'crm.login.two@example.test');

insert into public.profiles (id, name, email, role) values
  ('91000000-0000-4000-8000-000000000001', 'CRM Owner', 'crm.owner@example.test', 'client'),
  ('91000000-0000-4000-8000-000000000002', 'CRM Viewer', 'crm.viewer@example.test', 'client'),
  ('91000000-0000-4000-8000-000000000003', 'CRM Outsider', 'crm.outsider@example.test', 'client'),
  ('91000000-0000-4000-8000-000000000004', 'CRM Login One', 'crm.login.one@example.test', 'client'),
  ('91000000-0000-4000-8000-000000000005', 'CRM Login Two', 'crm.login.two@example.test', 'client')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values
  ('92000000-0000-4000-8000-000000000001', 'crm-alpha', 'CRM Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('92000000-0000-4000-8000-000000000002', 'crm-beta', 'CRM Beta', 'UTC', 'en', 'EUR', 'active');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('92000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001', 'owner', true),
  ('92000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000002', 'viewer', true);

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  capacity, is_public, is_active, sort_order
) values
  ('93000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'crm-session', 'appointment', 'CRM Session', 'fixed', 8000, 'EUR', 60, 60, 30, 5, true, true, 1),
  ('93000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000002', 'crm-other', 'appointment', 'CRM Other', 'fixed', 9000, 'EUR', 60, 60, 30, 5, true, true, 1);

insert into public.resources (
  id, business_id, slug, kind, name, capacity, timezone,
  is_bookable, is_public, is_active, sort_order
) values
  ('94000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'crm-room', 'space', 'CRM Room', 10, 'UTC', true, true, true, 1),
  ('94000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000002', 'crm-other-room', 'space', 'CRM Other Room', 10, 'UTC', true, true, true, 1);

insert into public.service_resources (business_id, service_id, resource_id, allocation_mode) values
  ('92000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001', '94000000-0000-4000-8000-000000000001', 'required'),
  ('92000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000002', '94000000-0000-4000-8000-000000000002', 'required');

insert into public.clients (
  id, business_id, name, email, phone, locale, auth_user_id
) values
  ('95000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000002', 'Other Tenant', 'other.tenant@example.test', '+380700000001', 'en', null),
  ('95000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000001', 'Login One', 'login.one.client@example.test', '+380700000002', 'en', '91000000-0000-4000-8000-000000000004'),
  ('95000000-0000-4000-8000-000000000003', '92000000-0000-4000-8000-000000000001', 'Login Two', 'login.two.client@example.test', '+380700000003', 'en', '91000000-0000-4000-8000-000000000005');

select is((select enabled from public.business_modules where business_id='92000000-0000-4000-8000-000000000001' and module_key='crm'), true, 'new workspaces enable CRM');

select is((select version from public.business_modules where business_id='92000000-0000-4000-8000-000000000001' and module_key='crm'), '1.1.0', 'new workspaces record Clients CRM version');

select is((select (config->>'clients_crm')::boolean from public.business_modules where business_id='92000000-0000-4000-8000-000000000001' and module_key='crm'), true, 'CRM config enables client workspace');

select is((select (config->>'client_merge')::boolean from public.business_modules where business_id='92000000-0000-4000-8000-000000000001' and module_key='crm'), true, 'CRM config enables protected merges');


select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($sql$
  select public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    '  Anna CRM  ',
    'ANNA.CRM@EXAMPLE.TEST',
    '+380 (67) 111-22-33',
    'en',
    'First note',
    array['VIP', ' rental ', 'vip']
  )
$sql$, 'owner can create a canonical CRM client');

select is((select count(*) from public.clients where business_id='92000000-0000-4000-8000-000000000001' and email='anna.crm@example.test'), 1::bigint, 'client creation stores one normalized email identity');

select is((select name from public.clients where email='anna.crm@example.test'), 'Anna CRM', 'client name is trimmed');

select is((select tags from public.clients where email='anna.crm@example.test'), array['rental','vip']::text[], 'client tags are normalized and deduplicated');

select is((select count(*) from public.client_events event join public.clients client on client.id=event.client_id where client.email='anna.crm@example.test' and event.event_type='created'), 1::bigint, 'client creation writes activity');

select is((select count(*) from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true) where email='anna.crm@example.test'), 1::bigint, 'owner CRM summary includes created client');

select is((select booking_count from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true) where email='anna.crm@example.test'), 0::bigint, 'new client starts with zero bookings');

select throws_ok($sql$
  select public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Duplicate Email',
    'anna.crm@example.test',
    null,
    'en',
    '',
    '{}'::text[]
  )
$sql$, '23505', 'client_already_exists', 'duplicate email identity is rejected');

select lives_ok($sql$
  select public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Phone Person',
    null,
    '+380 50 555 66 77',
    'en',
    '',
    array['phone']
  )
$sql$, 'client without email can be created from name and phone');

select throws_ok($sql$
  select public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Phone Person',
    null,
    '380505556677',
    'en',
    '',
    '{}'::text[]
  )
$sql$, '23505', 'client_already_exists', 'matching name and normalized phone is rejected');

select lives_ok($sql$
  select public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Family Member',
    null,
    '+380 50 555 66 77',
    'en',
    '',
    '{}'::text[]
  )
$sql$, 'same phone may be used by a different named client');

select lives_ok($sql$
  select public.update_admin_client(
    (select id from public.clients where email='anna.crm@example.test'),
    'Anna Updated',
    'anna.updated@example.test',
    '+380671112233',
    'ru',
    'Updated note',
    array['Returning', 'VIP']
  )
$sql$, 'owner can update the selected client');

select is((select name from public.clients where email='anna.updated@example.test'), 'Anna Updated', 'client update changes the name');

select is((select locale from public.clients where email='anna.updated@example.test'), 'ru', 'client update changes preferred language');

select is((select tags from public.clients where email='anna.updated@example.test'), array['returning','vip']::text[], 'client update normalizes tags');

select is((select count(*) from public.client_events event join public.clients client on client.id=event.client_id where client.email='anna.updated@example.test' and event.event_type='updated'), 1::bigint, 'client update writes activity');

select throws_ok($sql$
  select public.update_admin_client(
    (select id from public.clients where name='Phone Person'),
    'Phone Person',
    'anna.updated@example.test',
    '+380505556677',
    'en',
    '',
    '{}'::text[]
  )
$sql$, '23505', 'client_already_exists', 'client update cannot steal another email identity');


reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select ok((select count(*) from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true)) >= 5, 'viewer can read workspace CRM summaries');

select is((select count(*) from public.get_admin_client_bookings((select id from public.clients where email='anna.updated@example.test'))), 0::bigint, 'viewer can read an empty client booking history');

select throws_ok($sql$
  select public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Viewer Write',
    'viewer.write@example.test',
    null,
    'en',
    '',
    '{}'::text[]
  )
$sql$, '42501', 'client_operation_forbidden', 'viewer cannot create clients');

select throws_ok($sql$
  select public.set_admin_client_archived(
    (select id from public.clients where email='anna.updated@example.test'),
    true
  )
$sql$, '42501', 'client_operation_forbidden', 'viewer cannot archive clients');


reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true)), 0::bigint, 'outsider cannot read another workspace CRM');

select is((select count(*) from public.get_admin_client_bookings('95000000-0000-4000-8000-000000000002')), 0::bigint, 'outsider cannot read another client history');

select throws_ok($sql$
  select public.update_admin_client(
    '95000000-0000-4000-8000-000000000002',
    'Outsider Edit',
    'anna.updated@example.test',
    null,
    'en',
    '',
    '{}'::text[]
  )
$sql$, '42501', 'client_operation_forbidden', 'outsider cannot update another workspace client');


reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

reset role;
insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency, payment_status
) values (
  '96000000-0000-4000-8000-000000000001',
  '92000000-0000-4000-8000-000000000001',
  'BK-CRM-ACTIVE',
  (select id from public.clients where email='anna.updated@example.test'),
  '93000000-0000-4000-8000-000000000001',
  'confirmed',
  'admin',
  now() + interval '1 day',
  now() + interval '1 day 1 hour',
  'UTC',
  'ru',
  1,
  8000,
  0,
  8000,
  'EUR',
  'not_required'
);

insert into public.booking_allocations (
  business_id, booking_id, resource_id, status, starts_at, ends_at
) values (
  '92000000-0000-4000-8000-000000000001',
  '96000000-0000-4000-8000-000000000001',
  '94000000-0000-4000-8000-000000000001',
  'confirmed',
  now() + interval '1 day',
  now() + interval '1 day 1 hour'
);

select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok($sql$
  select public.set_admin_client_archived(
    (select id from public.clients where email='anna.updated@example.test'),
    true
  )
$sql$, '55000', 'client_has_active_bookings', 'active future booking blocks client archival');

select is((select archived_at is null from public.clients where email='anna.updated@example.test'), true, 'blocked archival leaves client active');


reset role;
update public.bookings
set status='completed',
    ends_at=now() - interval '1 hour',
    starts_at=now() - interval '2 hours'
where id='96000000-0000-4000-8000-000000000001';
update public.booking_allocations
set status='released',
    ends_at=now() - interval '1 hour',
    starts_at=now() - interval '2 hours'
where booking_id='96000000-0000-4000-8000-000000000001';

select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(public.set_admin_client_archived((select id from public.clients where email='anna.updated@example.test'), true), true, 'client without future active bookings can be archived');

select ok((select archived_at is not null from public.clients where email='anna.updated@example.test'), 'client archive timestamp is stored');

select is((select archived_by from public.clients where email='anna.updated@example.test'), '91000000-0000-4000-8000-000000000001'::uuid, 'client archive actor is stored');

select is(public.set_admin_client_archived((select id from public.clients where email='anna.updated@example.test'), false), true, 'archived client can be restored');

select ok((select archived_at is null from public.clients where email='anna.updated@example.test'), 'restored client is active again');

select is(public.set_admin_client_archived((select id from public.clients where name='Phone Person'), true), true, 'test client can be archived before booking restoration');


reset role;
insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency, payment_status
) values (
  '96000000-0000-4000-8000-000000000002',
  '92000000-0000-4000-8000-000000000001',
  'BK-CRM-RESTORE',
  (select id from public.clients where name='Phone Person'),
  '93000000-0000-4000-8000-000000000001',
  'completed',
  'admin',
  now() - interval '3 hours',
  now() - interval '2 hours',
  'UTC',
  'en',
  1,
  8000,
  0,
  8000,
  'EUR',
  'not_required'
);

select ok((select archived_at is null from public.clients where name='Phone Person'), 'new booking automatically restores archived identity');

select ok(exists(select 1 from public.client_events event join public.clients client on client.id=event.client_id where client.name='Phone Person' and event.event_type='restored'), 'booking restoration writes client activity');


select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
begin
  perform public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Merge Target',
    'merge.target@example.test',
    '+380991111111',
    'en',
    'Target note',
    array['target']
  );
  perform public.create_admin_client(
    '92000000-0000-4000-8000-000000000001',
    'Merge Source',
    'merge.source@example.test',
    '+380992222222',
    'en',
    'Source note',
    array['source']
  );
end;
$$;

reset role;
insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency, payment_status
) values (
  '96000000-0000-4000-8000-000000000003',
  '92000000-0000-4000-8000-000000000001',
  'BK-CRM-MERGE',
  (select id from public.clients where email='merge.source@example.test'),
  '93000000-0000-4000-8000-000000000001',
  'completed',
  'admin',
  now() - interval '5 hours',
  now() - interval '4 hours',
  'UTC',
  'en',
  1,
  8000,
  0,
  8000,
  'EUR',
  'not_required'
);

select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.merge_admin_clients(
    (select id from public.clients where email='merge.target@example.test'),
    (select id from public.clients where email='merge.source@example.test')
  ),
  (select id from public.clients where email='merge.target@example.test'),
  'owner can merge a duplicate client into the selected target'
);

select is((select count(*) from public.clients where email='merge.source@example.test'), 0::bigint, 'merge removes source client record');

select is((select client_id from public.bookings where id='96000000-0000-4000-8000-000000000003'), (select id from public.clients where email='merge.target@example.test'), 'merge moves source bookings to target');

select is((select tags from public.clients where email='merge.target@example.test'), array['source','target']::text[], 'merge combines normalized tags');

select ok((select notes like '%Target note%' and notes like '%Source note%' from public.clients where email='merge.target@example.test'), 'merge preserves notes from both records');

select ok(exists(select 1 from public.client_events event join public.clients client on client.id=event.client_id where client.email='merge.target@example.test' and event.event_type='merged'), 'merge writes client activity');

select is((select count(*) from public.get_admin_client_bookings((select id from public.clients where email='merge.target@example.test')) where reference='BK-CRM-MERGE'), 1::bigint, 'merged booking appears in target history');

select throws_ok($sql$
  select public.merge_admin_clients(
    (select id from public.clients where email='merge.target@example.test'),
    '95000000-0000-4000-8000-000000000001'
  )
$sql$, '42501', 'client_merge_cross_business', 'clients from different workspaces cannot be merged');

select throws_ok($sql$
  select public.merge_admin_clients(
    '95000000-0000-4000-8000-000000000002',
    '95000000-0000-4000-8000-000000000003'
  )
$sql$, '55000', 'client_merge_auth_conflict', 'clients linked to different login accounts cannot merge automatically');

reset role;
select is(public.resolve_booking_client('92000000-0000-4000-8000-000000000001','Anna Again','ANNA.UPDATED@EXAMPLE.TEST',null,'ru'), (select id from public.clients where email='anna.updated@example.test'), 'booking client resolution reuses normalized email');

select is(public.resolve_booking_client('92000000-0000-4000-8000-000000000001','Phone Person',null,'+380 (50) 555-66-77','en'), (select id from public.clients where name='Phone Person'), 'booking client resolution reuses matching name and normalized phone');

select is(public.normalize_client_phone('+38 (067) 111-22-33'), '380671112233', 'phone normalizer keeps digits only');

select is(public.normalize_client_tags(array[' VIP ', 'vip', 'Rental']), array['rental','vip']::text[], 'tag normalizer trims, lowercases and deduplicates');

select is(public.set_admin_client_archived((select id from public.clients where name='Family Member'), true), true, 'family member may be archived');

select is((select count(*) from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', false) where name='Family Member'), 0::bigint, 'CRM summary can exclude archived clients');

select is((select count(*) from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true) where name='Family Member'), 1::bigint, 'CRM summary can include archived clients');

select ok((select booking_count from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true) where email='anna.updated@example.test') >= 1, 'CRM summary counts canonical bookings');

select ok((select booked_value_minor from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true) where email='anna.updated@example.test') >= 8000, 'CRM summary calculates booked value');

select ok((select count(*) from public.get_admin_client_events((select id from public.clients where email='anna.updated@example.test'))) >= 4, 'owner can read client activity history');


reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select throws_ok(
  $sql$ select * from public.get_admin_clients_crm('92000000-0000-4000-8000-000000000001', true) $sql$,
  '42501',
  null,
  'anonymous visitor cannot execute CRM summary'
);

select throws_ok(
  $sql$ select * from public.get_admin_client_bookings('95000000-0000-4000-8000-000000000001'::uuid) $sql$,
  '42501',
  null,
  'anonymous visitor cannot execute client history'
);


reset role;
select * from finish();
rollback;
