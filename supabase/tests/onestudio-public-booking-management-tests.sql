\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(31);

select has_table(
  'public',
  'booking_management_links',
  'booking management links table exists'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.booking_management_links'::regclass),
  'booking management links enforce RLS'
);

select ok(
  not has_table_privilege('anon', 'public.booking_management_links', 'SELECT'),
  'anonymous visitors cannot read management tokens'
);

select ok(
  not has_table_privilege('authenticated', 'public.booking_management_links', 'SELECT'),
  'authenticated users cannot read management tokens directly'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.ensure_public_booking_management_link(uuid,uuid,text)',
    'EXECUTE'
  ),
  'service gateway may issue a management link'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.ensure_public_booking_management_link(uuid,uuid,text)',
    'EXECUTE'
  ),
  'anonymous visitors cannot issue management links'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.get_public_booking_management_context(uuid)',
    'EXECUTE'
  ),
  'service gateway may read the protected management context'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.get_public_booking_management_context(uuid)',
    'EXECUTE'
  ),
  'anonymous visitors cannot call management context directly'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.get_public_booking_management_slots(uuid,date)',
    'EXECUTE'
  ),
  'service gateway may calculate replacement slots'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.reschedule_public_booking(uuid,timestamp with time zone)',
    'EXECUTE'
  ),
  'service gateway may reschedule a token-authorized booking'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.cancel_public_booking(uuid,text)',
    'EXECUTE'
  ),
  'service gateway may cancel a token-authorized booking'
);

select ok(
  not exists (
    select 1
    from public.business_modules module
    where module.module_key = 'scheduling'
      and coalesce((module.config->>'public_booking_management')::boolean, false) = false
  ),
  'all scheduling modules advertise public booking management'
);

select ok(
  not exists (
    select 1
    from public.business_modules module
    where module.module_key = 'scheduling'
      and coalesce((module.config->>'public_booking_calendar_export')::boolean, false) = false
  ),
  'all scheduling modules advertise calendar export'
);

select ok(
  not exists (
    select 1
    from public.business_modules module
    where module.module_key = 'scheduling'
      and coalesce((module.config->>'public_booking_reschedule')::boolean, false) = false
  ),
  'all scheduling modules advertise public rescheduling'
);

select ok(
  not exists (
    select 1
    from public.business_modules module
    where module.module_key = 'scheduling'
      and coalesce((module.config->>'public_booking_cancel')::boolean, false) = false
  ),
  'all scheduling modules advertise public cancellation'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.notification_jobs'::regclass
      and tgname = 'notification_jobs_append_booking_management_link'
      and not tgisinternal
  ),
  'new booking emails receive management links'
);

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  '8a000000-0000-4000-8000-000000000001',
  'management-test',
  'Management Test',
  'UTC',
  'en',
  'EUR',
  'active'
);

insert into public.services (
  id,
  business_id,
  slug,
  kind,
  title,
  description,
  pricing_model,
  price_minor,
  currency,
  duration_min_minutes,
  duration_max_minutes,
  duration_step_minutes,
  capacity,
  requires_confirmation,
  is_public,
  is_active
) values (
  '8a000000-0000-4000-8000-000000000002',
  '8a000000-0000-4000-8000-000000000001',
  'managed-session',
  'appointment',
  'Managed session',
  '',
  'fixed',
  5000,
  'EUR',
  60,
  60,
  30,
  2,
  false,
  true,
  true
);

insert into public.resources (
  id,
  business_id,
  slug,
  kind,
  name,
  capacity,
  timezone,
  is_bookable,
  is_public,
  is_active
) values (
  '8a000000-0000-4000-8000-000000000003',
  '8a000000-0000-4000-8000-000000000001',
  'managed-room',
  'space',
  'Managed room',
  4,
  'UTC',
  true,
  true,
  true
);

insert into public.service_resources (
  business_id,
  service_id,
  resource_id,
  allocation_mode
) values (
  '8a000000-0000-4000-8000-000000000001',
  '8a000000-0000-4000-8000-000000000002',
  '8a000000-0000-4000-8000-000000000003',
  'required'
);

update public.business_availability_settings
set minimum_notice_minutes = 0,
    booking_horizon_days = 30,
    slot_interval_minutes = 30
where business_id = '8a000000-0000-4000-8000-000000000001';

insert into public.availability_rules (
  business_id,
  resource_id,
  day_of_week,
  start_time,
  end_time
) values (
  '8a000000-0000-4000-8000-000000000001',
  '8a000000-0000-4000-8000-000000000003',
  extract(dow from current_date + 1)::smallint,
  '09:00',
  '17:00'
);

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

select lives_ok($sql$
  select * from public.create_public_booking(
    'management-test',
    '8a000000-0000-4000-8000-000000000002',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    60,
    1,
    'Managed Client',
    'managed@example.test',
    null,
    'en',
    '',
    '8a000000-0000-4000-8000-000000000004'
  )
$sql$, 'a public booking can be created before its management link is issued');

select lives_ok($sql$
  select public.ensure_public_booking_management_link(
    (
      select id
      from public.bookings
      where public_request_key = '8a000000-0000-4000-8000-000000000004'
    ),
    '8a000000-0000-4000-8000-000000000004',
    'https://onestudioos.com'
  )
$sql$, 'the server attaches an idempotent management link');

reset role;

select is(
  (
    select count(*)
    from public.booking_management_links link
    join public.bookings booking on booking.id = link.booking_id
    where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  1::bigint,
  'one token is stored for the public booking'
);

select ok(
  exists (
    select 1
    from public.notification_jobs job
    join public.bookings booking on booking.id = job.booking_id
    where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
      and job.body like '%/book/manage/%'
  ),
  'the queued confirmation email contains the management URL'
);

select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

select is(
  public.get_public_booking_management_context(
    (
      select link.token
      from public.booking_management_links link
      join public.bookings booking on booking.id = link.booking_id
      where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
    )
  )->'booking'->>'reference',
  (
    select reference
    from public.bookings
    where public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  'the management context returns the correct booking'
);

select is(
  public.get_public_booking_management_context(
    (
      select link.token
      from public.booking_management_links link
      join public.bookings booking on booking.id = link.booking_id
      where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
    )
  )->'actions'->>'can_reschedule',
  'true',
  'a future unpaid booking may be rescheduled'
);

select ok(
  exists (
    select 1
    from public.get_public_booking_management_slots(
      (
      select link.token
      from public.booking_management_links link
      join public.bookings booking on booking.id = link.booking_id
      where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
    ),
      current_date + 1
    ) slot
    where slot.local_start_time = time '10:00'
  ),
  'replacement slots are calculated without exposing the schedule'
);

select lives_ok($sql$
  select public.reschedule_public_booking(
    (
      select link.token
      from public.booking_management_links link
      join public.bookings booking on booking.id = link.booking_id
      where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
    ),
    ((current_date + 1 + time '10:00') at time zone 'UTC')
  )
$sql$, 'the client can move a token-authorized future booking');

reset role;

select is(
  (
    select (starts_at at time zone 'UTC')::time
    from public.bookings
    where public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  time '10:00',
  'rescheduling updates the booking start'
);

select is(
  (
    select reschedule_count
    from public.booking_management_links link
    join public.bookings booking on booking.id = link.booking_id
    where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  1,
  'rescheduling increments the protected counter'
);

select is(
  (
    select (allocation.starts_at at time zone 'UTC')::time
    from public.booking_allocations allocation
    join public.bookings booking on booking.id = allocation.booking_id
    where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  time '10:00',
  'resource allocation moves with the booking'
);

select ok(
  exists (
    select 1
    from public.notification_jobs job
    join public.bookings booking on booking.id = job.booking_id
    where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
      and job.idempotency_key like '%:public-rescheduled:1'
  ),
  'rescheduling queues an updated client confirmation'
);

select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

select lives_ok($sql$
  select public.cancel_public_booking(
    (
      select link.token
      from public.booking_management_links link
      join public.bookings booking on booking.id = link.booking_id
      where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
    ),
    'Plans changed'
  )
$sql$, 'the client can cancel a token-authorized unpaid future booking');

reset role;

select is(
  (
    select status
    from public.bookings
    where public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  'cancelled',
  'public cancellation updates the booking status'
);

select is(
  (
    select allocation.status
    from public.booking_allocations allocation
    join public.bookings booking on booking.id = allocation.booking_id
    where booking.public_request_key = '8a000000-0000-4000-8000-000000000004'
  ),
  'released',
  'public cancellation releases the occupied resource'
);

select * from finish();
rollback;
