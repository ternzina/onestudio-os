\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

select has_function(
  'public',
  'get_public_service_availability_calendar',
  array['text','text','date','date','integer','integer'],
  'public booking calendar availability RPC exists'
);

select ok(
  has_function_privilege(
    'anon',
    'public.get_public_service_availability_calendar(text,text,date,date,integer,integer)',
    'EXECUTE'
  ),
  'anonymous visitors may load privacy-safe calendar availability'
);

select ok(
  not has_table_privilege('anon', 'public.bookings', 'SELECT'),
  'calendar availability does not expose booking rows'
);

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  '8a000000-0000-4000-8000-000000000001',
  'calendar-availability-test',
  'Calendar Availability Test',
  'UTC',
  'en',
  'EUR',
  'active'
);

insert into public.clients (
  id, business_id, name, email, locale
) values (
  '8a000000-0000-4000-8000-000000000002',
  '8a000000-0000-4000-8000-000000000001',
  'Calendar Client',
  'calendar-client@example.test',
  'en'
);

insert into public.services (
  id, business_id, slug, kind, title, description,
  pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  buffer_before_minutes, buffer_after_minutes, capacity,
  requires_confirmation, is_public, is_active, sort_order
) values (
  '8a000000-0000-4000-8000-000000000003',
  '8a000000-0000-4000-8000-000000000001',
  'calendar-service',
  'appointment',
  'Calendar service',
  '',
  'fixed',
  5000,
  'EUR',
  60,
  60,
  30,
  0,
  0,
  1,
  false,
  true,
  true,
  1
);

insert into public.resources (
  id, business_id, slug, kind, name, capacity, timezone,
  is_bookable, is_public, is_active
) values (
  '8a000000-0000-4000-8000-000000000004',
  '8a000000-0000-4000-8000-000000000001',
  'calendar-room',
  'space',
  'Calendar room',
  1,
  'UTC',
  true,
  true,
  true
);

insert into public.service_resources (
  business_id, service_id, resource_id, allocation_mode
) values (
  '8a000000-0000-4000-8000-000000000001',
  '8a000000-0000-4000-8000-000000000003',
  '8a000000-0000-4000-8000-000000000004',
  'required'
);

update public.business_availability_settings
set minimum_notice_minutes = 0,
    booking_horizon_days = 90,
    slot_interval_minutes = 30
where business_id = '8a000000-0000-4000-8000-000000000001';

insert into public.availability_rules (
  business_id, resource_id, day_of_week, start_time, end_time
) values (
  '8a000000-0000-4000-8000-000000000001',
  '8a000000-0000-4000-8000-000000000004',
  extract(dow from current_date + 1)::smallint,
  '09:00',
  '12:00'
);

select is(
  (
    select availability_status
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 1,
      current_date + 2,
      60,
      1
    )
    where calendar_date = current_date + 1
  ),
  'available',
  'an open day without bookings is available'
);

select ok(
  (
    select available_slot_count > 0
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 1,
      current_date + 1,
      60,
      1
    )
  ),
  'available day reports free slot count'
);

select is(
  (
    select availability_status
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 2,
      current_date + 2,
      60,
      1
    )
  ),
  'closed',
  'a day without working hours is closed'
);

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency, payment_status
) values (
  '8a000000-0000-4000-8000-000000000010',
  '8a000000-0000-4000-8000-000000000001',
  'CAL-PARTIAL-1',
  '8a000000-0000-4000-8000-000000000002',
  '8a000000-0000-4000-8000-000000000003',
  'confirmed',
  'admin',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  ((current_date + 1 + time '10:00') at time zone 'UTC'),
  'UTC',
  'en',
  1,
  5000,
  0,
  5000,
  'EUR',
  'paid'
);

insert into public.booking_allocations (
  business_id, booking_id, resource_id, status, starts_at, ends_at, quantity
) values (
  '8a000000-0000-4000-8000-000000000001',
  '8a000000-0000-4000-8000-000000000010',
  '8a000000-0000-4000-8000-000000000004',
  'confirmed',
  ((current_date + 1 + time '09:00') at time zone 'UTC'),
  ((current_date + 1 + time '10:00') at time zone 'UTC'),
  1
);

select is(
  (
    select availability_status
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 1,
      current_date + 1,
      60,
      1
    )
  ),
  'partial',
  'a day with a booking and remaining slots is partially occupied'
);

select ok(
  (
    select has_bookings
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 1,
      current_date + 1,
      60,
      1
    )
  ),
  'calendar reports only the aggregate presence of bookings'
);

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency, payment_status
) values
  (
    '8a000000-0000-4000-8000-000000000011',
    '8a000000-0000-4000-8000-000000000001',
    'CAL-FULL-2',
    '8a000000-0000-4000-8000-000000000002',
    '8a000000-0000-4000-8000-000000000003',
    'confirmed',
    'admin',
    ((current_date + 1 + time '10:00') at time zone 'UTC'),
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    'UTC',
    'en',
    1,
    5000,
    0,
    5000,
    'EUR',
    'paid'
  ),
  (
    '8a000000-0000-4000-8000-000000000012',
    '8a000000-0000-4000-8000-000000000001',
    'CAL-FULL-3',
    '8a000000-0000-4000-8000-000000000002',
    '8a000000-0000-4000-8000-000000000003',
    'confirmed',
    'admin',
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    ((current_date + 1 + time '12:00') at time zone 'UTC'),
    'UTC',
    'en',
    1,
    5000,
    0,
    5000,
    'EUR',
    'paid'
  );

insert into public.booking_allocations (
  business_id, booking_id, resource_id, status, starts_at, ends_at, quantity
) values
  (
    '8a000000-0000-4000-8000-000000000001',
    '8a000000-0000-4000-8000-000000000011',
    '8a000000-0000-4000-8000-000000000004',
    'confirmed',
    ((current_date + 1 + time '10:00') at time zone 'UTC'),
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    1
  ),
  (
    '8a000000-0000-4000-8000-000000000001',
    '8a000000-0000-4000-8000-000000000012',
    '8a000000-0000-4000-8000-000000000004',
    'confirmed',
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    ((current_date + 1 + time '12:00') at time zone 'UTC'),
    1
  );

select is(
  (
    select availability_status
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 1,
      current_date + 1,
      60,
      1
    )
  ),
  'full',
  'a fully occupied working day is marked full'
);

select is(
  (
    select available_slot_count
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date + 1,
      current_date + 1,
      60,
      1
    )
  ),
  0::bigint,
  'a fully occupied day has no available slots'
);

select is_empty(
  $sql$
    select *
    from public.get_public_service_availability_calendar(
      'missing-calendar-business',
      'calendar-service',
      current_date,
      current_date + 1,
      60,
      1
    )
  $sql$,
  'unknown public workspace returns no calendar data'
);

select is_empty(
  $sql$
    select *
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'missing-service',
      current_date,
      current_date + 1,
      60,
      1
    )
  $sql$,
  'unknown public service returns no calendar data'
);

select is_empty(
  $sql$
    select *
    from public.get_public_service_availability_calendar(
      'calendar-availability-test',
      'calendar-service',
      current_date,
      current_date + 63,
      60,
      1
    )
  $sql$,
  'oversized public calendar ranges are rejected safely'
);

select is(
  (
    select config->>'public_booking_calendar_availability'
    from public.business_modules
    where business_id = '8a000000-0000-4000-8000-000000000001'
      and module_key = 'scheduling'
  ),
  'true',
  'scheduling module advertises storefront calendar availability'
);

select * from finish();
rollback;
