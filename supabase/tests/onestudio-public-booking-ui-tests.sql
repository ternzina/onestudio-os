\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(63);

select has_column('public', 'bookings', 'public_request_key', 'bookings store a public idempotency key');
select ok(exists(
  select 1 from pg_indexes
  where schemaname = 'public'
    and indexname = 'bookings_business_public_request_key_unique'
), 'public booking idempotency index exists');
select has_function('public', 'get_public_booking_context', array['text'], 'public booking context RPC exists');
select has_function(
  'public',
  'create_public_booking',
  array['text','uuid','timestamp with time zone','integer','integer','text','text','text','text','text','uuid'],
  'guarded public booking creation RPC exists'
);
select ok(has_function_privilege('anon', 'public.get_public_booking_context(text)', 'EXECUTE'), 'anonymous visitors may load public booking context');
select ok(has_function_privilege(
  'anon',
  'public.create_public_booking(text,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,uuid)',
  'EXECUTE'
), 'anonymous visitors may call guarded public booking creation');
select ok(has_function_privilege(
  'authenticated',
  'public.create_public_booking(text,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,uuid)',
  'EXECUTE'
), 'signed-in visitors may use the same public booking contract');
select ok(not has_table_privilege('anon', 'public.bookings', 'INSERT'), 'anonymous visitors cannot insert bookings directly');
select ok(not has_table_privilege('anon', 'public.clients', 'INSERT'), 'anonymous visitors cannot insert clients directly');
select ok(not has_table_privilege('anon', 'public.bookings', 'SELECT'), 'anonymous visitors cannot inspect booking rows');

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency, status) values
  ('71000000-0000-4000-8000-000000000001', 'public-alpha', 'Public Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('71000000-0000-4000-8000-000000000002', 'public-beta', 'Public Beta', 'UTC', 'en', 'EUR', 'active'),
  ('71000000-0000-4000-8000-000000000003', 'public-suspended', 'Public Suspended', 'UTC', 'en', 'EUR', 'suspended');

insert into public.catalog_categories (
  id, business_id, kind, slug, name, is_public, is_active, sort_order
) values (
  '72000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  'service', 'sessions', 'Sessions', true, true, 1
);

insert into public.services (
  id, business_id, category_id, slug, kind, title, description,
  pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  buffer_before_minutes, buffer_after_minutes, capacity,
  requires_confirmation, is_public, is_active, sort_order
) values
  ('73000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', 'public-session', 'appointment', 'Public session', 'Book online', 'fixed', 5000, 'EUR', 60, 120, 30, 0, 0, 2, false, true, true, 1),
  ('73000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-000000000001', null, 'confirmation-session', 'appointment', 'Confirmation session', '', 'fixed', 7000, 'EUR', 60, 60, 30, 0, 0, 4, true, true, true, 2),
  ('73000000-0000-4000-8000-000000000003', '71000000-0000-4000-8000-000000000001', null, 'private-session', 'appointment', 'Private session', '', 'fixed', 8000, 'EUR', 60, 60, 30, 0, 0, 2, false, false, true, 3),
  ('73000000-0000-4000-8000-000000000004', '71000000-0000-4000-8000-000000000001', null, 'resource-less', 'appointment', 'Resource-less', '', 'fixed', 3000, 'EUR', 60, 60, 30, 0, 0, 2, false, true, true, 4),
  ('73000000-0000-4000-8000-000000000005', '71000000-0000-4000-8000-000000000002', null, 'beta-session', 'appointment', 'Beta session', '', 'fixed', 4000, 'EUR', 60, 60, 30, 0, 0, 2, false, true, true, 1);

insert into public.resources (
  id, business_id, slug, kind, name, capacity, timezone,
  is_bookable, is_public, is_active
) values
  ('74000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001', 'alpha-room', 'space', 'Alpha room', 8, 'UTC', true, true, true),
  ('74000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-000000000002', 'beta-room', 'space', 'Beta room', 8, 'UTC', true, true, true);

insert into public.service_resources (business_id, service_id, resource_id, allocation_mode) values
  ('71000000-0000-4000-8000-000000000001', '73000000-0000-4000-8000-000000000001', '74000000-0000-4000-8000-000000000001', 'required'),
  ('71000000-0000-4000-8000-000000000001', '73000000-0000-4000-8000-000000000002', '74000000-0000-4000-8000-000000000001', 'required'),
  ('71000000-0000-4000-8000-000000000001', '73000000-0000-4000-8000-000000000003', '74000000-0000-4000-8000-000000000001', 'required'),
  ('71000000-0000-4000-8000-000000000002', '73000000-0000-4000-8000-000000000005', '74000000-0000-4000-8000-000000000002', 'required');

update public.business_availability_settings
set minimum_notice_minutes = 0,
    booking_horizon_days = 30,
    slot_interval_minutes = 30
where business_id in (
  '71000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000002'
);

insert into public.availability_rules (
  business_id, resource_id, day_of_week, start_time, end_time
) values
  ('71000000-0000-4000-8000-000000000001', '74000000-0000-4000-8000-000000000001', extract(dow from current_date + 1)::smallint, '09:00', '17:00'),
  ('71000000-0000-4000-8000-000000000002', '74000000-0000-4000-8000-000000000002', extract(dow from current_date + 1)::smallint, '09:00', '17:00');

select is(
  (select version from public.business_modules where business_id = '71000000-0000-4000-8000-000000000001' and module_key = 'scheduling'),
  '1.3.0',
  'scheduling records the booking calendar version'
);
select is(
  (select config->>'public_booking_ui' from public.business_modules where business_id = '71000000-0000-4000-8000-000000000001' and module_key = 'scheduling'),
  'true',
  'scheduling advertises the public booking UI capability'
);
select is(
  public.get_public_booking_context('public-alpha')->'business'->>'name',
  'Public Alpha',
  'public context returns business identity'
);
select is(
  public.get_public_booking_context(' PUBLIC-ALPHA ')->'business'->>'slug',
  'public-alpha',
  'public context normalizes the workspace slug'
);
select is(
  jsonb_array_length(public.get_public_booking_context('public-alpha')->'services'),
  2,
  'public context includes only public resource-backed services'
);
select ok(
  exists (
    select 1
    from jsonb_array_elements(public.get_public_booking_context('public-alpha')->'services') service
    where service->>'title' = 'Public session'
      and service->>'category_name' = 'Sessions'
  ),
  'public context includes safe category presentation data'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_public_booking_context('public-alpha')->'services') service
    where service->>'title' in ('Private session', 'Resource-less')
  ),
  'private and unallocatable services stay out of the storefront'
);
select is(
  public.get_public_booking_context('public-alpha')->'date_bounds'->>'minimum_date',
  current_date::text,
  'public context returns the workspace-local first date'
);
select is(
  public.get_public_booking_context('public-alpha')->'date_bounds'->>'maximum_date',
  (current_date + 30)::text,
  'public context returns the configured booking horizon'
);
select ok(public.get_public_booking_context('public-suspended') is null, 'suspended workspaces have no public booking context');
select ok(public.get_public_booking_context('missing-workspace') is null, 'unknown workspaces have no public booking context');

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select throws_ok(
  $sql$ select * from public.business_availability_settings $sql$,
  '42501', null,
  'anonymous visitors cannot inspect availability settings'
);
select ok(
  (select count(*) from public.get_service_available_slots(
    '71000000-0000-4000-8000-000000000001',
    '73000000-0000-4000-8000-000000000001',
    current_date + 1,
    60,
    1
  )) > 0,
  'anonymous visitors receive calculated slots'
);
select lives_ok($sql$
  select * from public.create_public_booking(
    'public-alpha',
    '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    60,
    1,
    'Public Client',
    'PUBLIC.CLIENT@EXAMPLE.TEST',
    '+380000000001',
    'en',
    'Window seat, please',
    '75000000-0000-4000-8000-000000000001'
  )
$sql$, 'anonymous visitor can create a guarded public booking');

reset role;

select is((select count(*) from public.bookings where business_id = '71000000-0000-4000-8000-000000000001'), 1::bigint, 'public booking is stored once');
select is((select source from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000001'), 'public', 'public booking source is preserved');
select is((select status from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000001'), 'confirmed', 'service without confirmation creates a confirmed booking');
select is((select payment_status from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000001'), 'not_required', 'public booking does not invent a payment state');
select is((select total_minor from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000001'), 5000, 'public booking stores calculated price');
select ok((select reference <> '' from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000001'), 'public booking receives a reference');
select is((select count(*) from public.clients where business_id = '71000000-0000-4000-8000-000000000001'), 1::bigint, 'public booking creates one client');
select is((select email from public.clients where business_id = '71000000-0000-4000-8000-000000000001'), 'public.client@example.test', 'public client email is normalized');
select is((select phone from public.clients where business_id = '71000000-0000-4000-8000-000000000001'), '+380000000001', 'public client phone is stored');
select is((select locale from public.clients where business_id = '71000000-0000-4000-8000-000000000001'), 'en', 'public client locale is stored');
select is((select count(*) from public.booking_allocations allocation join public.bookings booking on booking.id = allocation.booking_id where booking.public_request_key = '75000000-0000-4000-8000-000000000001'), 1::bigint, 'public booking reserves every required resource');
select is((select allocation.status from public.booking_allocations allocation join public.bookings booking on booking.id = allocation.booking_id where booking.public_request_key = '75000000-0000-4000-8000-000000000001'), 'confirmed', 'confirmed public booking confirms its resource allocation');
select is((select count(*) from public.booking_events event join public.bookings booking on booking.id = event.booking_id where booking.public_request_key = '75000000-0000-4000-8000-000000000001' and event.event_type = 'created'), 1::bigint, 'public booking creation is audited');
select is((select metadata->>'public_contact_name' from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000001'), 'Public Client', 'submitted public contact is preserved on the booking');

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select lives_ok($sql$
  select * from public.create_public_booking(
    'public-alpha',
    '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    60, 1, 'Public Client', 'public.client@example.test', '+380000000001', 'en', '',
    '75000000-0000-4000-8000-000000000001'
  )
$sql$, 'retrying the same public request key is idempotent');

reset role;
select is((select count(*) from public.bookings where business_id = '71000000-0000-4000-8000-000000000001'), 1::bigint, 'idempotent retry does not duplicate the booking');

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select lives_ok($sql$
  select * from public.create_public_booking(
    'public-alpha',
    '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '10:00') at time zone 'UTC'),
    60, 1, 'Changed Public Name', 'public.client@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000002'
  )
$sql$, 'same email may create another public booking');

reset role;
select is((select count(*) from public.clients where business_id = '71000000-0000-4000-8000-000000000001'), 1::bigint, 'same public email reuses the client');
select is((select name from public.clients where business_id = '71000000-0000-4000-8000-000000000001'), 'Public Client', 'anonymous reuse cannot overwrite the existing client identity');
select is((select count(*) from public.bookings where business_id = '71000000-0000-4000-8000-000000000001'), 2::bigint, 'second public booking is stored');

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '09:30') at time zone 'UTC'), 60, 1,
    'Conflict Client', 'conflict@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000003'
  )
$sql$, 'P0001', 'booking_slot_unavailable', 'public booking rejects an occupied resource window');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000003',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'Private Client', 'private@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000004'
  )
$sql$, '23503', 'public_booking_service_not_found', 'private services cannot be publicly booked');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000004',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'No Resource', 'resource@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000005'
  )
$sql$, '23503', 'public_booking_service_not_found', 'services without required resources cannot be publicly booked');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    '', 'blank@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000006'
  )
$sql$, '22023', 'invalid_public_booking_client_name', 'public booking requires a client name');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'Bad Email', 'not-an-email', null, 'en', '',
    '75000000-0000-4000-8000-000000000007'
  )
$sql$, '22023', 'invalid_public_booking_client_email', 'public booking validates email');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 45, 1,
    'Bad Duration', 'duration@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000008'
  )
$sql$, '22023', 'invalid_public_booking_duration', 'public booking enforces service duration rules');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 3,
    'Too Many', 'capacity@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000009'
  )
$sql$, '22023', 'invalid_public_booking_party_size', 'public booking enforces service capacity');
select throws_ok($sql$
  select * from public.create_public_booking(
    'missing-workspace', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'Missing', 'missing@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000010'
  )
$sql$, '23503', 'public_booking_business_not_found', 'unknown workspaces cannot receive bookings');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-suspended', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'Suspended', 'suspended@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000011'
  )
$sql$, '23503', 'public_booking_business_not_found', 'suspended workspaces cannot receive bookings');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date - 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'Past Client', 'past@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000012'
  )
$sql$, 'P0001', 'booking_slot_unavailable', 'past slots cannot be publicly booked');
select throws_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 1,
    'No Key', 'nokey@example.test', null, 'en', '', null
  )
$sql$, '22023', 'public_booking_request_key_required', 'public booking requires an idempotency key');

select lives_ok($sql$
  select * from public.create_public_booking(
    'public-alpha', '73000000-0000-4000-8000-000000000002',
    ((current_date + 1 + time '12:00') at time zone 'UTC'), 60, 2,
    'Pending Client', 'pending@example.test', null, 'ru', '',
    '75000000-0000-4000-8000-000000000013'
  )
$sql$, 'public service requiring confirmation creates a booking');

reset role;
select is((select status from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000013'), 'pending', 'confirmation service creates a pending booking');
select is((select locale from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000013'), 'ru', 'public booking preserves the selected language');
select is((select total_minor from public.bookings where public_request_key = '75000000-0000-4000-8000-000000000013'), 7000, 'pending public booking stores its price');

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select lives_ok($sql$
  select * from public.create_public_booking(
    'public-beta', '73000000-0000-4000-8000-000000000005',
    ((current_date + 1 + time '09:00') at time zone 'UTC'), 60, 1,
    'Beta Client', 'beta@example.test', null, 'en', '',
    '75000000-0000-4000-8000-000000000001'
  )
$sql$, 'the same request key is scoped independently per workspace');
select throws_ok($sql$ select * from public.bookings $sql$, '42501', null, 'anonymous visitors still cannot inspect created bookings');
select throws_ok($sql$ select * from public.booking_events $sql$, '42501', null, 'anonymous visitors cannot inspect public booking history');

reset role;
select is((select count(*) from public.bookings where business_id = '71000000-0000-4000-8000-000000000002'), 1::bigint, 'second workspace stores its own public booking');

select * from finish();
rollback;
