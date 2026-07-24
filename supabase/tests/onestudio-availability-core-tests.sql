\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(69);

select has_table('public', 'business_availability_settings', 'workspace availability settings table exists');
select has_column('public', 'business_availability_settings', 'minimum_notice_minutes', 'minimum booking notice is configurable');
select has_column('public', 'business_availability_settings', 'booking_horizon_days', 'booking horizon is configurable');
select has_column('public', 'business_availability_settings', 'slot_interval_minutes', 'slot cadence is configurable');
select has_function('public', 'replace_resource_weekly_availability', array['uuid', 'jsonb'], 'weekly schedule replacement RPC exists');
select has_function('public', 'create_resource_availability_exception', array['uuid', 'text', 'date', 'time without time zone', 'time without time zone', 'text'], 'local-time exception RPC exists');
select has_function('public', 'resource_is_available', array['uuid', 'timestamp with time zone', 'timestamp with time zone', 'uuid'], 'resource availability predicate exists');
select has_function('public', 'service_slot_is_available', array['uuid', 'uuid', 'timestamp with time zone', 'integer', 'integer', 'uuid'], 'service slot predicate exists');
select has_function('public', 'get_service_available_slots', array['uuid', 'uuid', 'date', 'integer', 'integer'], 'public slot query exists');
select has_trigger('public', 'businesses', 'seed_business_availability_settings_after_insert', 'new workspaces receive availability settings');
select has_trigger('public', 'business_availability_settings', 'set_business_availability_settings_updated_at', 'availability settings timestamps stay current');
select ok((select relrowsecurity from pg_class where oid = 'public.business_availability_settings'::regclass), 'RLS is enabled on availability settings');
select ok(not has_table_privilege('anon', 'public.business_availability_settings', 'SELECT'), 'anonymous visitors cannot inspect workspace availability settings');
select ok(not has_table_privilege('anon', 'public.availability_rules', 'SELECT'), 'anonymous visitors cannot inspect raw weekly rules');
select ok(not has_table_privilege('anon', 'public.availability_exceptions', 'SELECT'), 'anonymous visitors cannot inspect raw exceptions');
select ok(has_function_privilege('anon', 'public.get_service_available_slots(uuid,uuid,date,integer,integer)', 'EXECUTE'), 'anonymous visitors may request calculated public slots');
select ok(not has_function_privilege('anon', 'public.resource_is_available(uuid,timestamp with time zone,timestamp with time zone,uuid)', 'EXECUTE'), 'anonymous visitors cannot call internal resource predicates');
select ok(has_function_privilege('authenticated', 'public.replace_resource_weekly_availability(uuid,jsonb)', 'EXECUTE'), 'authenticated managers may call guarded weekly replacement');

insert into auth.users (id, email) values
  ('51000000-0000-4000-8000-000000000001', 'availability.manager@example.test'),
  ('51000000-0000-4000-8000-000000000002', 'availability.staff@example.test'),
  ('51000000-0000-4000-8000-000000000003', 'availability.viewer@example.test'),
  ('51000000-0000-4000-8000-000000000004', 'availability.outsider@example.test');

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency) values
  ('52000000-0000-4000-8000-000000000001', 'availability-alpha', 'Availability Alpha', 'UTC', 'en', 'EUR'),
  ('52000000-0000-4000-8000-000000000002', 'availability-beta', 'Availability Beta', 'UTC', 'en', 'EUR');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('52000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', 'manager', true),
  ('52000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000002', 'staff', true),
  ('52000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000003', 'viewer', true);

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  buffer_before_minutes, buffer_after_minutes, capacity, is_public, is_active
) values
  ('53000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001', 'main-service', 'appointment', 'Main service', 'fixed', 5000, 'EUR', 60, 120, 30, 0, 0, 4, true, true),
  ('53000000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000001', 'private-service', 'appointment', 'Private service', 'fixed', 5000, 'EUR', 60, 60, 30, 0, 0, 1, false, true),
  ('53000000-0000-4000-8000-000000000003', '52000000-0000-4000-8000-000000000001', 'no-resource-service', 'appointment', 'No resource service', 'fixed', 5000, 'EUR', 60, 60, 30, 0, 0, 1, true, true),
  ('53000000-0000-4000-8000-000000000004', '52000000-0000-4000-8000-000000000001', 'buffered-service', 'appointment', 'Buffered service', 'fixed', 5000, 'EUR', 60, 60, 30, 15, 15, 1, true, true);

insert into public.resources (
  id, business_id, slug, kind, name, capacity, timezone, is_bookable, is_public, is_active
) values
  ('54000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001', 'main-room', 'space', 'Main room', 10, 'UTC', true, true, true),
  ('54000000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000002', 'beta-room', 'space', 'Beta room', 10, 'UTC', true, true, true);

insert into public.service_resources (business_id, service_id, resource_id, allocation_mode) values
  ('52000000-0000-4000-8000-000000000001', '53000000-0000-4000-8000-000000000001', '54000000-0000-4000-8000-000000000001', 'required'),
  ('52000000-0000-4000-8000-000000000001', '53000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000001', 'required'),
  ('52000000-0000-4000-8000-000000000001', '53000000-0000-4000-8000-000000000004', '54000000-0000-4000-8000-000000000001', 'required');

update public.business_availability_settings
set minimum_notice_minutes = 0,
    booking_horizon_days = 30,
    slot_interval_minutes = 30
where business_id = '52000000-0000-4000-8000-000000000001';

insert into public.availability_rules (
  business_id, resource_id, day_of_week, start_time, end_time
) values (
  '52000000-0000-4000-8000-000000000001',
  '54000000-0000-4000-8000-000000000001',
  extract(dow from current_date + 1)::smallint,
  '09:00',
  '12:00'
);

select is(
  (select minimum_notice_minutes from public.business_availability_settings where business_id = '52000000-0000-4000-8000-000000000001'),
  0,
  'new workspaces receive an editable settings row'
);
select is(
  (select enabled from public.business_modules where business_id = '52000000-0000-4000-8000-000000000001' and module_key = 'scheduling'),
  true,
  'new workspaces receive the enabled scheduling module'
);
select is(
  (select version from public.business_modules where business_id = '52000000-0000-4000-8000-000000000001' and module_key = 'scheduling'),
  '1.3.0',
  'scheduling module records the booking-calendar version'
);

select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.business_availability_settings where business_id = '52000000-0000-4000-8000-000000000001'), 1::bigint, 'manager can read workspace availability settings');
select lives_ok($sql$
  update public.business_availability_settings
  set minimum_notice_minutes = 60, booking_horizon_days = 45, slot_interval_minutes = 15
  where business_id = '52000000-0000-4000-8000-000000000001'
$sql$, 'manager can update workspace availability settings');
select throws_ok($sql$
  update public.business_availability_settings
  set booking_horizon_days = 0
  where business_id = '52000000-0000-4000-8000-000000000001'
$sql$, '23514', null, 'booking horizon rejects zero days');
select throws_ok($sql$
  update public.business_availability_settings
  set slot_interval_minutes = 1
  where business_id = '52000000-0000-4000-8000-000000000001'
$sql$, '23514', null, 'slot cadence rejects unsupported one-minute intervals');
select is(
  public.replace_resource_weekly_availability(
    '54000000-0000-4000-8000-000000000001',
    jsonb_build_array(
      jsonb_build_object('day_of_week', extract(dow from current_date + 1)::integer, 'start_time', '09:00', 'end_time', '12:00'),
      jsonb_build_object('day_of_week', extract(dow from current_date + 1)::integer, 'start_time', '13:00', 'end_time', '14:00')
    )
  ),
  2,
  'manager can atomically replace weekly hours including a break'
);
select is((select count(*) from public.availability_rules where resource_id = '54000000-0000-4000-8000-000000000001'), 2::bigint, 'weekly replacement stores the requested intervals');
select throws_ok($sql$
  select public.replace_resource_weekly_availability(
    '54000000-0000-4000-8000-000000000001',
    jsonb_build_array(
      jsonb_build_object('day_of_week', 1, 'start_time', '09:00', 'end_time', '12:00'),
      jsonb_build_object('day_of_week', 1, 'start_time', '11:00', 'end_time', '13:00')
    )
  )
$sql$, '22023', 'availability_rules_overlap', 'weekly replacement rejects overlapping intervals');
select throws_ok($sql$
  select public.replace_resource_weekly_availability(
    '54000000-0000-4000-8000-000000000001',
    jsonb_build_array(jsonb_build_object('day_of_week', 1, 'start_time', '18:00', 'end_time', '09:00'))
  )
$sql$, '22023', 'invalid_availability_rule', 'weekly replacement rejects reversed hours');
select throws_ok($sql$
  select public.replace_resource_weekly_availability(
    '54000000-0000-4000-8000-000000000002', '[]'::jsonb
  )
$sql$, '42501', 'availability_configuration_forbidden', 'manager cannot edit another workspace resource');
select lives_ok($sql$
  select public.create_resource_availability_exception(
    '54000000-0000-4000-8000-000000000001', 'blocked', current_date + 1, '10:00', '11:00', 'Private event'
  )
$sql$, 'manager can create a blocked date exception in local time');
select lives_ok($sql$
  select public.create_resource_availability_exception(
    '54000000-0000-4000-8000-000000000001', 'available', current_date + 1, '14:00', '15:00', 'Extra hour'
  )
$sql$, 'manager can add availability outside weekly hours');
select throws_ok($sql$
  select public.create_resource_availability_exception(
    '54000000-0000-4000-8000-000000000001', 'holiday', current_date + 1, '10:00', '11:00', ''
  )
$sql$, '22023', 'invalid_availability_exception_kind', 'exception kinds remain constrained');
select throws_ok($sql$
  select public.create_resource_availability_exception(
    '54000000-0000-4000-8000-000000000001', 'blocked', current_date + 1, '11:00', '10:00', ''
  )
$sql$, '22023', 'invalid_availability_exception_window', 'exception windows must move forward');
select is((select count(*) from public.availability_exceptions where resource_id = '54000000-0000-4000-8000-000000000001'), 2::bigint, 'resource exceptions are stored');

-- Restore the preview cadence after validating manager updates.
update public.business_availability_settings
set minimum_notice_minutes = 0, booking_horizon_days = 30, slot_interval_minutes = 30
where business_id = '52000000-0000-4000-8000-000000000001';

select is(
  (select count(*) from public.get_service_available_slots(
    '52000000-0000-4000-8000-000000000001',
    '53000000-0000-4000-8000-000000000001',
    current_date + 1,
    60,
    1
  )),
  4::bigint,
  'manager preview combines weekly windows, a blocked hour and an extra available hour'
);
select ok(public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  60,
  1,
  null
), 'a weekly slot before the blocked exception remains available');
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '10:00') at time zone 'UTC'),
  60,
  1,
  null
), 'a slot overlapping a blocked exception is unavailable');
select ok(public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '14:00') at time zone 'UTC'),
  60,
  1,
  null
), 'an available exception opens a slot outside weekly hours');
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000003',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  60,
  1,
  null
), 'a service without required resources has no available slots');
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  45,
  1,
  null
), 'service duration below the configured minimum is rejected');
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  75,
  1,
  null
), 'service duration must follow the configured step');
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  60,
  5,
  null
), 'party size cannot exceed service capacity');
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000004',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  60,
  1,
  null
), 'service buffers must fit inside resource availability');

reset role;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.business_availability_settings where business_id = '52000000-0000-4000-8000-000000000001'), 1::bigint, 'staff can read availability settings');
select is((select count(*) from public.availability_rules where business_id = '52000000-0000-4000-8000-000000000001'), 2::bigint, 'staff can read weekly rules');
select is((select count(*) from public.availability_exceptions where business_id = '52000000-0000-4000-8000-000000000001'), 2::bigint, 'staff can read date exceptions');
select lives_ok($sql$
  update public.business_availability_settings
  set booking_horizon_days = 60
  where business_id = '52000000-0000-4000-8000-000000000001'
$sql$, 'staff update is safely filtered by RLS');
select throws_ok($sql$
  select public.replace_resource_weekly_availability('54000000-0000-4000-8000-000000000001', '[]'::jsonb)
$sql$, '42501', 'availability_configuration_forbidden', 'staff cannot replace weekly hours');
select throws_ok($sql$
  select public.create_resource_availability_exception(
    '54000000-0000-4000-8000-000000000001', 'blocked', current_date + 2, '09:00', '10:00', ''
  )
$sql$, '42501', 'availability_configuration_forbidden', 'staff cannot create exceptions');

reset role;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.business_availability_settings where business_id = '52000000-0000-4000-8000-000000000001'), 1::bigint, 'viewer can read availability settings');
select lives_ok($sql$
  delete from public.availability_exceptions where business_id = '52000000-0000-4000-8000-000000000001'
$sql$, 'viewer delete is safely filtered by RLS');

reset role;
select is((select booking_horizon_days from public.business_availability_settings where business_id = '52000000-0000-4000-8000-000000000001'), 30, 'staff could not change the booking horizon');
select is((select count(*) from public.availability_exceptions where business_id = '52000000-0000-4000-8000-000000000001'), 2::bigint, 'viewer could not remove date exceptions');
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok($sql$
  select * from public.business_availability_settings
$sql$, '42501', null, 'anonymous visitors cannot select availability settings');
select throws_ok($sql$
  select * from public.availability_rules
$sql$, '42501', null, 'anonymous visitors cannot select raw weekly rules');
select is(
  (select count(*) from public.get_service_available_slots(
    '52000000-0000-4000-8000-000000000001',
    '53000000-0000-4000-8000-000000000001',
    current_date + 1,
    60,
    1
  )),
  4::bigint,
  'anonymous visitors receive only calculated slots for a public service'
);
select is(
  (select count(*) from public.get_service_available_slots(
    '52000000-0000-4000-8000-000000000001',
    '53000000-0000-4000-8000-000000000002',
    current_date + 1,
    60,
    1
  )),
  0::bigint,
  'anonymous visitors cannot preview a private service'
);
select is(
  (select count(*) from public.get_service_available_slots(
    '52000000-0000-4000-8000-000000000001',
    '53000000-0000-4000-8000-000000000001',
    current_date + 31,
    60,
    1
  )),
  0::bigint,
  'public slot queries respect the booking horizon'
);

reset role;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.business_availability_settings where business_id = '52000000-0000-4000-8000-000000000001'), 0::bigint, 'authenticated outsiders cannot inspect workspace availability settings');
select throws_ok($sql$
  select public.replace_resource_weekly_availability('54000000-0000-4000-8000-000000000001', '[]'::jsonb)
$sql$, '42501', 'availability_configuration_forbidden', 'outsiders cannot replace weekly hours');

reset role;
insert into public.clients (
  id, business_id, name, email
) values (
  '55000000-0000-4000-8000-000000000001',
  '52000000-0000-4000-8000-000000000001',
  'Availability client',
  'availability.client@example.test'
);
insert into public.bookings (
  id, business_id, client_id, service_id, status, source, starts_at, ends_at,
  timezone, locale, subtotal_minor, discount_minor, total_minor, currency
) values (
  '56000000-0000-4000-8000-000000000001',
  '52000000-0000-4000-8000-000000000001',
  '55000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  'confirmed',
  'admin',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  ((current_date + 1 + time '10:00') at time zone 'UTC'),
  'UTC',
  'en',
  5000,
  0,
  5000,
  'EUR'
);
insert into public.booking_allocations (
  business_id, booking_id, resource_id, status, starts_at, ends_at
) values (
  '52000000-0000-4000-8000-000000000001',
  '56000000-0000-4000-8000-000000000001',
  '54000000-0000-4000-8000-000000000001',
  'confirmed',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  ((current_date + 1 + time '10:00') at time zone 'UTC')
);

select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select ok(not public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  60,
  1,
  null
), 'confirmed booking allocations block a resource slot');
select ok(public.service_slot_is_available(
  '52000000-0000-4000-8000-000000000001',
  '53000000-0000-4000-8000-000000000001',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  60,
  1,
  '56000000-0000-4000-8000-000000000001'
), 'booking edits may ignore their own allocation');
select is(
  (select count(*) from public.get_service_available_slots(
    '52000000-0000-4000-8000-000000000001',
    '53000000-0000-4000-8000-000000000001',
    current_date + 1,
    60,
    1
  )),
  3::bigint,
  'slot preview removes allocation conflicts'
);
select lives_ok($sql$
  delete from public.availability_exceptions
  where business_id = '52000000-0000-4000-8000-000000000001'
$sql$, 'manager can clear date exceptions');
select is((select count(*) from public.availability_exceptions where business_id = '52000000-0000-4000-8000-000000000001'), 0::bigint, 'cleared exceptions are removed');
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'availability_rules_business_resource_day_idx'
  ),
  'weekly availability lookup index exists'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'availability_exceptions_business_resource_window_idx'
  ),
  'date exception lookup index exists'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'booking_allocations_resource_window_idx'
  ),
  'allocation conflict lookup index exists'
);

select * from finish();
rollback;
