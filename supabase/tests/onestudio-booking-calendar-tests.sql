\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(50);

select has_function(
  'public',
  'get_admin_booking_calendar',
  array['date','integer','uuid'],
  'booking calendar RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.get_admin_booking_calendar(date,integer,uuid)', 'EXECUTE'),
  'authenticated members may execute the calendar projection'
);
select ok(
  has_function_privilege('service_role', 'public.get_admin_booking_calendar(date,integer,uuid)', 'EXECUTE'),
  'service role may execute the calendar projection'
);
select ok(
  not has_function_privilege('anon', 'public.get_admin_booking_calendar(date,integer,uuid)', 'EXECUTE'),
  'anonymous visitors cannot execute the admin calendar'
);
select is(
  (select prosecdef from pg_proc where oid = 'public.get_admin_booking_calendar(date,integer,uuid)'::regprocedure),
  true,
  'calendar projection is security definer'
);
select is(
  (select provolatile::text from pg_proc where oid = 'public.get_admin_booking_calendar(date,integer,uuid)'::regprocedure),
  's',
  'calendar projection is stable'
);
select ok(
  obj_description('public.get_admin_booking_calendar(date,integer,uuid)'::regprocedure, 'pg_proc') is not null,
  'calendar projection is documented'
);
select ok(
  not has_table_privilege('anon', 'public.bookings', 'SELECT'),
  'calendar does not grant anonymous booking reads'
);

insert into auth.users (id, email) values
  ('81000000-0000-4000-8000-000000000001', 'calendar.owner@example.test'),
  ('81000000-0000-4000-8000-000000000002', 'calendar.viewer@example.test'),
  ('81000000-0000-4000-8000-000000000003', 'calendar.outsider@example.test');

insert into public.profiles (id, name, email, role) values
  ('81000000-0000-4000-8000-000000000001', 'Calendar Owner', 'calendar.owner@example.test', 'client'),
  ('81000000-0000-4000-8000-000000000002', 'Calendar Viewer', 'calendar.viewer@example.test', 'client'),
  ('81000000-0000-4000-8000-000000000003', 'Calendar Outsider', 'calendar.outsider@example.test', 'client')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values
  ('82000000-0000-4000-8000-000000000001', 'calendar-alpha', 'Calendar Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('82000000-0000-4000-8000-000000000002', 'calendar-beta', 'Calendar Beta', 'UTC', 'en', 'EUR', 'active');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('82000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', 'owner', true),
  ('82000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000002', 'viewer', true);

insert into public.clients (id, business_id, name, email, phone, locale) values
  ('83000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001', 'Anna Calendar', 'anna.calendar@example.test', '+380000000101', 'en'),
  ('83000000-0000-4000-8000-000000000002', '82000000-0000-4000-8000-000000000001', 'Ben Calendar', 'ben.calendar@example.test', '+380000000102', 'en'),
  ('83000000-0000-4000-8000-000000000003', '82000000-0000-4000-8000-000000000002', 'Other Tenant', 'other.calendar@example.test', '+380000000103', 'en');

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  capacity, is_public, is_active, sort_order
) values
  ('84000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001', 'calendar-session', 'appointment', 'Calendar Session', 'fixed', 5000, 'EUR', 60, 60, 30, 5, true, true, 1),
  ('84000000-0000-4000-8000-000000000003', '82000000-0000-4000-8000-000000000001', 'calendar-session-b', 'appointment', 'Calendar Session B', 'fixed', 5500, 'EUR', 60, 60, 30, 5, true, true, 2),
  ('84000000-0000-4000-8000-000000000002', '82000000-0000-4000-8000-000000000002', 'other-session', 'appointment', 'Other Session', 'fixed', 6000, 'EUR', 60, 60, 30, 5, true, true, 1);

insert into public.resources (
  id, business_id, slug, kind, name, capacity, timezone,
  is_bookable, is_public, is_active, sort_order
) values
  ('85000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001', 'calendar-room-a', 'space', 'Room A', 10, 'UTC', true, true, true, 1),
  ('85000000-0000-4000-8000-000000000002', '82000000-0000-4000-8000-000000000001', 'calendar-room-b', 'space', 'Room B', 10, 'Etc/GMT-2', true, true, true, 2),
  ('85000000-0000-4000-8000-000000000003', '82000000-0000-4000-8000-000000000002', 'other-room', 'space', 'Other Room', 10, 'UTC', true, true, true, 1);

insert into public.service_resources (business_id, service_id, resource_id, allocation_mode) values
  ('82000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '85000000-0000-4000-8000-000000000001', 'required'),
  ('82000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000003', '85000000-0000-4000-8000-000000000002', 'required'),
  ('82000000-0000-4000-8000-000000000002', '84000000-0000-4000-8000-000000000002', '85000000-0000-4000-8000-000000000003', 'required');

insert into public.availability_rules (
  business_id, resource_id, day_of_week, start_time, end_time
) values
  ('82000000-0000-4000-8000-000000000001', '85000000-0000-4000-8000-000000000001', extract(dow from current_date + 1)::smallint, '08:00', '18:00'),
  ('82000000-0000-4000-8000-000000000001', '85000000-0000-4000-8000-000000000002', extract(dow from current_date + 1)::smallint, '09:00', '17:00');

insert into public.availability_exceptions (
  business_id, resource_id, kind, starts_at, ends_at, reason
) values
  (
    '82000000-0000-4000-8000-000000000001',
    '85000000-0000-4000-8000-000000000001',
    'available',
    ((current_date + 1 + time '18:00') at time zone 'UTC'),
    ((current_date + 1 + time '19:00') at time zone 'UTC'),
    'Evening opening'
  ),
  (
    '82000000-0000-4000-8000-000000000001',
    '85000000-0000-4000-8000-000000000001',
    'blocked',
    ((current_date + 1 + time '12:00') at time zone 'UTC'),
    ((current_date + 1 + time '13:00') at time zone 'UTC'),
    'Maintenance'
  );

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency, payment_status
) values
  (
    '86000000-0000-4000-8000-000000000001',
    '82000000-0000-4000-8000-000000000001',
    'BK-CALENDAR-001',
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000001',
    'confirmed', 'admin',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    ((current_date + 1 + time '10:00') at time zone 'UTC'),
    'UTC', 'en', 1, 5000, 0, 5000, 'EUR', 'not_required'
  ),
  (
    '86000000-0000-4000-8000-000000000002',
    '82000000-0000-4000-8000-000000000001',
    'BK-CALENDAR-002',
    '83000000-0000-4000-8000-000000000002',
    '84000000-0000-4000-8000-000000000003',
    'pending', 'public',
    ((current_date + 1 + time '10:00') at time zone 'UTC'),
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    'UTC', 'en', 2, 5000, 0, 5000, 'EUR', 'pending'
  ),
  (
    '86000000-0000-4000-8000-000000000003',
    '82000000-0000-4000-8000-000000000001',
    'BK-CALENDAR-003',
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000001',
    'cancelled', 'admin',
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    ((current_date + 1 + time '12:00') at time zone 'UTC'),
    'UTC', 'en', 1, 5000, 0, 5000, 'EUR', 'not_required'
  ),
  (
    '86000000-0000-4000-8000-000000000004',
    '82000000-0000-4000-8000-000000000001',
    'BK-CALENDAR-004',
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000001',
    'confirmed', 'admin',
    ((current_date + 2 + time '09:00') at time zone 'UTC'),
    ((current_date + 2 + time '10:00') at time zone 'UTC'),
    'UTC', 'en', 1, 5000, 0, 5000, 'EUR', 'not_required'
  ),
  (
    '86000000-0000-4000-8000-000000000005',
    '82000000-0000-4000-8000-000000000002',
    'BK-OTHER-TENANT',
    '83000000-0000-4000-8000-000000000003',
    '84000000-0000-4000-8000-000000000002',
    'confirmed', 'admin',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    ((current_date + 1 + time '10:00') at time zone 'UTC'),
    'UTC', 'en', 1, 6000, 0, 6000, 'EUR', 'not_required'
  ),
  (
    '86000000-0000-4000-8000-000000000006',
    '82000000-0000-4000-8000-000000000001',
    'BK-OUTSIDE-RANGE',
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000001',
    'confirmed', 'admin',
    ((current_date + 8 + time '09:00') at time zone 'UTC'),
    ((current_date + 8 + time '10:00') at time zone 'UTC'),
    'UTC', 'en', 1, 5000, 0, 5000, 'EUR', 'not_required'
  );

insert into public.booking_allocations (
  business_id, booking_id, resource_id, status, starts_at, ends_at
) values
  ('82000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '85000000-0000-4000-8000-000000000001', 'confirmed', ((current_date + 1 + time '09:00') at time zone 'UTC'), ((current_date + 1 + time '10:00') at time zone 'UTC')),
  ('82000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000002', '85000000-0000-4000-8000-000000000002', 'held', ((current_date + 1 + time '10:00') at time zone 'UTC'), ((current_date + 1 + time '11:00') at time zone 'UTC')),
  ('82000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000003', '85000000-0000-4000-8000-000000000001', 'released', ((current_date + 1 + time '11:00') at time zone 'UTC'), ((current_date + 1 + time '12:00') at time zone 'UTC')),
  ('82000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000004', '85000000-0000-4000-8000-000000000001', 'confirmed', ((current_date + 2 + time '09:00') at time zone 'UTC'), ((current_date + 2 + time '10:00') at time zone 'UTC')),
  ('82000000-0000-4000-8000-000000000002', '86000000-0000-4000-8000-000000000005', '85000000-0000-4000-8000-000000000003', 'confirmed', ((current_date + 1 + time '09:00') at time zone 'UTC'), ((current_date + 1 + time '10:00') at time zone 'UTC')),
  ('82000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000006', '85000000-0000-4000-8000-000000000001', 'confirmed', ((current_date + 8 + time '09:00') at time zone 'UTC'), ((current_date + 8 + time '10:00') at time zone 'UTC'));

select is(
  (select version from public.business_modules where business_id = '82000000-0000-4000-8000-000000000001' and module_key = 'scheduling'),
  '1.3.0',
  'scheduling records the booking calendar version'
);
select is(
  (select config->>'booking_calendar' from public.business_modules where business_id = '82000000-0000-4000-8000-000000000001' and module_key = 'scheduling'),
  'true',
  'scheduling advertises the booking calendar capability'
);

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.get_admin_booking_calendar(current_date + 1, 7, null)->'business'->>'id',
  '82000000-0000-4000-8000-000000000001',
  'calendar resolves the preferred workspace'
);
select is(
  public.get_admin_booking_calendar(current_date + 1, 7, null)->'business'->>'timezone',
  'UTC',
  'calendar returns the workspace timezone'
);
select is(
  public.get_admin_booking_calendar(current_date + 1, 7, null)->'range'->>'start_date',
  (current_date + 1)::text,
  'calendar returns the requested first day'
);
select is(
  public.get_admin_booking_calendar(current_date + 1, 7, null)->'range'->>'end_date',
  (current_date + 7)::text,
  'calendar returns the inclusive last day'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 7, null)->'range'->>'days')::integer,
  7,
  'calendar returns the requested day count'
);
select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 7, null)->'resources'),
  2,
  'calendar returns active bookable workspace resources'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'resources') resource
    where resource->>'name' = 'Room A'
  ),
  'calendar resource projection includes presentation names'
);
select is(
  (
    select count(*)
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'working_windows') calendar_window
    where calendar_window->>'source' = 'weekly'
  ),
  2::bigint,
  'calendar expands weekly rules into dated windows'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'working_windows') calendar_window
    where calendar_window->>'source' = 'available'
      and (calendar_window->>'start_minute')::integer = 1080
  ),
  'calendar includes available exceptions'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'working_windows') calendar_window
    where calendar_window->>'resource_id' = '85000000-0000-4000-8000-000000000002'
      and calendar_window->>'source' = 'weekly'
      and (calendar_window->>'start_minute')::integer = 420
  ),
  'calendar projects resource-local weekly hours into the business timezone'
);
select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 7, null)->'blocked_windows'),
  1,
  'calendar includes blocked exceptions'
);
select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings'),
  4,
  'calendar includes only workspace bookings inside the range'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 7, null)->'summary'->>'total')::integer,
  4,
  'calendar summary counts all visible bookings'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 7, null)->'summary'->>'occupying')::integer,
  3,
  'calendar summary counts resource-occupying bookings'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 7, null)->'summary'->>'pending')::integer,
  1,
  'calendar summary counts pending bookings'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 7, null)->'summary'->>'confirmed')::integer,
  2,
  'calendar summary counts confirmed bookings'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 7, null)->'summary'->>'cancelled')::integer,
  1,
  'calendar summary counts cancelled bookings'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings') booking
    where booking->>'reference' = 'BK-CALENDAR-001'
      and booking->>'client_name' = 'Anna Calendar'
      and booking->>'service_title' = 'Calendar Session'
  ),
  'calendar joins safe client and service presentation data'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings') booking
    where booking->>'reference' = 'BK-CALENDAR-001'
      and jsonb_array_length(booking->'resources') = 1
      and booking->'resources'->0->>'name' = 'Room A'
  ),
  'calendar includes booking resource names'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings') booking
    where booking->>'reference' = 'BK-CALENDAR-001'
      and (booking->>'occupies_resource')::boolean = true
  ),
  'confirmed booking is marked as occupying'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings') booking
    where booking->>'reference' = 'BK-CALENDAR-003'
      and (booking->>'occupies_resource')::boolean = false
  ),
  'cancelled booking is not marked as occupying'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings') booking
    where booking->>'reference' = 'BK-OTHER-TENANT'
  ),
  'calendar never leaks another workspace booking'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings') booking
    where booking->>'reference' = 'BK-OUTSIDE-RANGE'
  ),
  'calendar excludes bookings outside the requested range'
);
select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 7, '85000000-0000-4000-8000-000000000001')->'resources'),
  1,
  'resource filter narrows the resource list'
);
select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 7, '85000000-0000-4000-8000-000000000001')->'bookings'),
  3,
  'resource filter returns bookings allocated to that resource'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, '85000000-0000-4000-8000-000000000001')->'bookings') booking,
         jsonb_array_elements(booking->'resources') resource
    where resource->>'id' <> '85000000-0000-4000-8000-000000000001'
  ),
  'resource-filtered booking payload contains only matching single-resource allocations in this fixture'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, '85000000-0000-4000-8000-000000000001')->'working_windows') calendar_window
    where calendar_window->>'resource_id' <> '85000000-0000-4000-8000-000000000001'
  ),
  'resource filter narrows working windows'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 7, '85000000-0000-4000-8000-000000000001')->'blocked_windows') calendar_window
    where calendar_window->>'resource_id' <> '85000000-0000-4000-8000-000000000001'
  ),
  'resource filter narrows blocked windows'
);
select is(
  (public.get_admin_booking_calendar(current_date + 1, 1, null)->'range'->>'days')::integer,
  1,
  'day view returns one day'
);
select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 1, null)->'bookings'),
  3,
  'day view excludes the next-day booking'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 1, null)->'bookings') booking
    where booking->>'reference' = 'BK-CALENDAR-004'
  ),
  'day boundary is exclusive at the next midnight'
);
select is(
  (
    select booking->>'start_minute'
    from jsonb_array_elements(public.get_admin_booking_calendar(current_date + 1, 1, null)->'bookings') booking
    where booking->>'reference' = 'BK-CALENDAR-001'
  ),
  '540',
  'calendar exposes workspace-local minute positions'
);

reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  jsonb_array_length(public.get_admin_booking_calendar(current_date + 1, 7, null)->'bookings'),
  4,
  'viewer receives read-only calendar data'
);

reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $sql$ select public.get_admin_booking_calendar(current_date + 1, 7, null) $sql$,
  '42501',
  'booking_calendar_workspace_forbidden',
  'authenticated outsider without a workspace is rejected'
);

reset role;

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select throws_ok(
  $sql$ select public.get_admin_booking_calendar(current_date + 1, 7, null) $sql$,
  '42501',
  null,
  'anonymous caller cannot execute the admin calendar'
);

reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $sql$ select public.get_admin_booking_calendar(current_date + 1, 0, null) $sql$,
  '22023',
  'booking_calendar_days_out_of_range',
  'calendar rejects zero days'
);
select throws_ok(
  $sql$ select public.get_admin_booking_calendar(current_date + 1, 15, null) $sql$,
  '22023',
  'booking_calendar_days_out_of_range',
  'calendar rejects ranges longer than fourteen days'
);
select throws_ok(
  $sql$ select public.get_admin_booking_calendar(current_date + 1, 7, '85000000-0000-4000-8000-000000000003') $sql$,
  '42501',
  'booking_calendar_resource_forbidden',
  'calendar rejects another workspace resource filter'
);
select throws_ok(
  $sql$ select public.get_admin_booking_calendar(null, 7, null) $sql$,
  '22023',
  'booking_calendar_start_date_required',
  'calendar requires a start date'
);
select is(
  (select count(*) from public.bookings where business_id = '82000000-0000-4000-8000-000000000001'),
  5::bigint,
  'calendar reads do not mutate booking rows'
);

reset role;

select * from finish();
rollback;
