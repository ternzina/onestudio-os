begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(25);

update public.notification_jobs
set scheduled_for = now() + interval '100 years',
    updated_at = now()
where status in ('scheduled', 'pending');

select has_function(
  'public',
  'refresh_booking_reminder',
  array['uuid'],
  'booking reminder refresh function exists'
);
select has_function(
  'public',
  'schedule_all_booking_reminders',
  array['timestamp with time zone'],
  'service reminder preparation function exists'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.schedule_all_booking_reminders(timestamp with time zone)',
    'EXECUTE'
  ),
  'service role may prepare reminders across workspaces'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.schedule_all_booking_reminders(timestamp with time zone)',
    'EXECUTE'
  ),
  'authenticated users cannot run the global reminder scheduler'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.refresh_booking_reminder(uuid)',
    'EXECUTE'
  ),
  'anonymous visitors cannot refresh reminder jobs'
);

insert into auth.users (id, email)
values ('d1000000-0000-4000-8000-000000000001', 'reminder.owner@example.test');

insert into public.profiles (id, name, email, role)
values (
  'd1000000-0000-4000-8000-000000000001',
  'Reminder Owner',
  'reminder.owner@example.test',
  'client'
)
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    role = excluded.role;

insert into public.businesses (
  id,
  slug,
  name,
  timezone,
  default_locale,
  default_currency,
  status
) values (
  'd2000000-0000-4000-8000-000000000001',
  'reminder-lifecycle',
  'Reminder Lifecycle',
  'UTC',
  'en',
  'EUR',
  'active'
);

insert into public.business_members (
  business_id,
  user_id,
  role,
  is_default
) values (
  'd2000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000001',
  'owner',
  true
);

update public.business_notification_settings
set reminder_enabled = true,
    reminder_minutes = 60,
    max_attempts = 3
where business_id = 'd2000000-0000-4000-8000-000000000001';

insert into public.clients (
  id,
  business_id,
  name,
  email,
  locale
) values (
  'd3000000-0000-4000-8000-000000000001',
  'd2000000-0000-4000-8000-000000000001',
  'Reminder Client',
  'reminder.client@example.test',
  'en'
);

insert into public.services (
  id,
  business_id,
  slug,
  kind,
  title,
  pricing_model,
  price_minor,
  currency,
  duration_min_minutes,
  duration_max_minutes,
  duration_step_minutes,
  capacity,
  is_public,
  is_active
) values (
  'd4000000-0000-4000-8000-000000000001',
  'd2000000-0000-4000-8000-000000000001',
  'reminder-service',
  'appointment',
  'Reminder Service',
  'fixed',
  10000,
  'EUR',
  60,
  60,
  30,
  1,
  true,
  true
);

insert into public.bookings (
  id,
  business_id,
  reference,
  client_id,
  service_id,
  status,
  source,
  starts_at,
  ends_at,
  timezone,
  locale,
  subtotal_minor,
  discount_minor,
  total_minor,
  currency
) values (
  'd5000000-0000-4000-8000-000000000001',
  'd2000000-0000-4000-8000-000000000001',
  'BK-REMINDER-1',
  'd3000000-0000-4000-8000-000000000001',
  'd4000000-0000-4000-8000-000000000001',
  'confirmed',
  'public',
  now() + interval '2 days',
  now() + interval '2 days 1 hour',
  'UTC',
  'en',
  10000,
  0,
  10000,
  'EUR'
);

select is(
  (
    select count(*)
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  1::bigint,
  'a future booking receives exactly one active reminder'
);
select is(
  (
    select locale
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  'en',
  'reminder uses the booking locale'
);
select is(
  (
    select scheduled_for
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  (
    select starts_at - interval '60 minutes'
    from public.bookings
    where id = 'd5000000-0000-4000-8000-000000000001'
  ),
  'reminder is scheduled using the configured lead time'
);
select is(
  (
    select payload->>'booking_starts_at'
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  (
    select starts_at::text
    from public.bookings
    where id = 'd5000000-0000-4000-8000-000000000001'
  ),
  'reminder records the booking start snapshot'
);

create temporary table first_reminder on commit drop as
select id
from public.notification_jobs
where booking_id = 'd5000000-0000-4000-8000-000000000001'
  and event_type = 'booking_reminder'
  and status in ('scheduled', 'pending');

update public.bookings
set starts_at = starts_at + interval '1 day',
    ends_at = ends_at + interval '1 day',
    updated_at = now()
where id = 'd5000000-0000-4000-8000-000000000001';

select is(
  (
    select status
    from public.notification_jobs
    where id = (select id from first_reminder)
  ),
  'cancelled',
  'rescheduling cancels the old reminder generation'
);
select is(
  (
    select count(*)
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  1::bigint,
  'rescheduling creates one replacement reminder'
);
select is(
  (
    select payload->>'booking_starts_at'
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  (
    select starts_at::text
    from public.bookings
    where id = 'd5000000-0000-4000-8000-000000000001'
  ),
  'replacement reminder points to the new booking time'
);
select is(
  (
    select scheduled_for
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  (
    select starts_at - interval '60 minutes'
    from public.bookings
    where id = 'd5000000-0000-4000-8000-000000000001'
  ),
  'replacement reminder receives the new delivery time'
);

update public.bookings
set locale = 'ru',
    updated_at = now()
where id = 'd5000000-0000-4000-8000-000000000001';

select is(
  (
    select count(*)
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  1::bigint,
  'locale changes still leave one active reminder'
);
select is(
  (
    select locale
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  'ru',
  'locale changes rebuild the reminder in the new language'
);
select matches(
  (
    select subject
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  '^Напоминание',
  'Russian reminder template is rendered'
);

update public.bookings
set status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
where id = 'd5000000-0000-4000-8000-000000000001';

select is(
  (
    select count(*)
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000001'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending', 'failed')
  ),
  0::bigint,
  'cancelling a booking cancels every unsent reminder'
);

update public.business_notification_settings
set reminder_enabled = false
where business_id = 'd2000000-0000-4000-8000-000000000001';

insert into public.bookings (
  id,
  business_id,
  reference,
  client_id,
  service_id,
  status,
  source,
  starts_at,
  ends_at,
  timezone,
  locale,
  subtotal_minor,
  discount_minor,
  total_minor,
  currency
) values (
  'd5000000-0000-4000-8000-000000000002',
  'd2000000-0000-4000-8000-000000000001',
  'BK-REMINDER-2',
  'd3000000-0000-4000-8000-000000000001',
  'd4000000-0000-4000-8000-000000000001',
  'confirmed',
  'admin',
  now() + interval '3 days',
  now() + interval '3 days 1 hour',
  'UTC',
  'en',
  10000,
  0,
  10000,
  'EUR'
);

select is(
  (
    select count(*)
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000002'
      and event_type = 'booking_reminder'
  ),
  0::bigint,
  'disabled reminders are not prepared on booking creation'
);

update public.business_notification_settings
set reminder_enabled = true
where business_id = 'd2000000-0000-4000-8000-000000000001';

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

select cmp_ok(
  public.schedule_all_booking_reminders(now() + interval '30 days'),
  '>=',
  1,
  'protected scheduler prepares missing reminders across workspaces'
);

reset role;

select is(
  (
    select count(*)
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000002'
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending')
  ),
  1::bigint,
  'global preparation creates the missing reminder'
);

update public.bookings
set status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
where id = 'd5000000-0000-4000-8000-000000000002';

update public.notification_jobs
set status = 'pending',
    scheduled_for = now() - interval '1 minute',
    cancelled_at = null,
    updated_at = now()
where booking_id = 'd5000000-0000-4000-8000-000000000002'
  and event_type = 'booking_reminder';

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

create temporary table reminder_claims on commit drop as
select *
from public.claim_notification_jobs('resend', 100);

select is(
  (
    select count(*)
    from reminder_claims
    where booking_id = 'd5000000-0000-4000-8000-000000000002'
      and event_type = 'booking_reminder'
  ),
  0::bigint,
  'provider claim excludes a stale reminder for a cancelled booking'
);

reset role;

select is(
  (
    select status
    from public.notification_jobs
    where booking_id = 'd5000000-0000-4000-8000-000000000002'
      and event_type = 'booking_reminder'
    order by created_at desc
    limit 1
  ),
  'cancelled',
  'provider claim repairs a stale cancelled-booking reminder'
);

select is(
  (
    select (config->>'reschedule_safe_reminders')::boolean
    from public.business_modules
    where business_id = 'd2000000-0000-4000-8000-000000000001'
      and module_key = 'notifications'
  ),
  true,
  'workspace module records reschedule-safe reminder capability'
);
select is(
  (
    select (config->>'cron_reminder_preparation')::boolean
    from public.business_modules
    where business_id = 'd2000000-0000-4000-8000-000000000001'
      and module_key = 'notifications'
  ),
  true,
  'workspace module records cron reminder preparation capability'
);

select set_config('request.jwt.claim.sub', 'd1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$select public.schedule_all_booking_reminders(now() + interval '30 days')$$,
  '42501',
  'notification_provider_forbidden',
  'global reminder preparation rejects non-service callers'
);

select * from finish();
rollback;
