\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

select has_function(
  'public',
  'claim_notification_job',
  array['uuid','text'],
  'exact notification claim RPC exists'
);
select ok(
  has_function_privilege('service_role', 'public.claim_notification_job(uuid,text)', 'EXECUTE'),
  'service role may claim one exact notification'
);
select ok(
  not has_function_privilege('authenticated', 'public.claim_notification_job(uuid,text)', 'EXECUTE'),
  'authenticated clients cannot claim provider jobs directly'
);
select has_function(
  'public',
  'delete_admin_booking',
  array['uuid'],
  'guarded booking deletion RPC remains available'
);
select is(
  (
    select count(*)
    from public.businesses business
    left join public.business_availability_settings settings
      on settings.business_id = business.id
    where settings.business_id is null
  ),
  0::bigint,
  'all businesses have availability settings for management links'
);

insert into auth.users (id, email) values
  ('8c100000-0000-4000-8000-000000000001', 'booking-delivery-manager@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  '8c200000-0000-4000-8000-000000000001',
  'booking-admin-delivery-test',
  'Booking Admin Delivery Test',
  'UTC',
  'ru',
  'EUR',
  'active'
);

insert into public.business_members (business_id, user_id, role, is_default) values (
  '8c200000-0000-4000-8000-000000000001',
  '8c100000-0000-4000-8000-000000000001',
  'manager',
  true
);

insert into public.clients (
  id, business_id, name, email, phone, locale
) values (
  '8c300000-0000-4000-8000-000000000001',
  '8c200000-0000-4000-8000-000000000001',
  'Delivery Client',
  'delivery-client@example.test',
  null,
  'ru'
);

insert into public.services (
  id, business_id, slug, kind, title, description, pricing_model,
  price_minor, currency, duration_min_minutes, duration_max_minutes,
  duration_step_minutes, capacity, is_public, is_active
) values (
  '8c400000-0000-4000-8000-000000000001',
  '8c200000-0000-4000-8000-000000000001',
  'delivery-service',
  'appointment',
  'Delivery service',
  '',
  'fixed',
  4500,
  'EUR',
  60,
  60,
  30,
  1,
  true,
  true
);

insert into public.bookings (
  id, business_id, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, party_size,
  subtotal_minor, discount_minor, total_minor, currency,
  payment_status, customer_notes, internal_notes, metadata
) values (
  '8c500000-0000-4000-8000-000000000001',
  '8c200000-0000-4000-8000-000000000001',
  '8c300000-0000-4000-8000-000000000001',
  '8c400000-0000-4000-8000-000000000001',
  'confirmed',
  'admin',
  now() + interval '4 days',
  now() + interval '4 days 1 hour',
  'UTC',
  'ru',
  1,
  4500,
  0,
  4500,
  'EUR',
  'not_required',
  '',
  '',
  '{}'::jsonb
);

insert into public.notification_jobs (
  id, business_id, booking_id, client_id, event_type, channel, locale,
  recipient_email, subject, body, status, scheduled_for, attempt_count,
  max_attempts, provider, provider_message_id, idempotency_key, payload, sent_at
) values
(
  '8c600000-0000-4000-8000-000000000001',
  '8c200000-0000-4000-8000-000000000001',
  '8c500000-0000-4000-8000-000000000001',
  '8c300000-0000-4000-8000-000000000001',
  'booking_confirmed',
  'email',
  'ru',
  'delivery-client@example.test',
  'Sent booking confirmation',
  'Sent body',
  'sent',
  now() - interval '1 hour',
  1,
  3,
  'resend',
  'provider-test-1',
  'booking-admin-delivery-sent',
  '{}'::jsonb,
  now() - interval '30 minutes'
),
(
  '8c600000-0000-4000-8000-000000000002',
  '8c200000-0000-4000-8000-000000000001',
  null,
  '8c300000-0000-4000-8000-000000000001',
  'booking_reminder',
  'email',
  'ru',
  'selected@example.test',
  'Selected future email',
  'Selected body',
  'scheduled',
  now() + interval '2 days',
  0,
  3,
  null,
  null,
  'booking-admin-delivery-selected',
  '{}'::jsonb,
  null
),
(
  '8c600000-0000-4000-8000-000000000003',
  '8c200000-0000-4000-8000-000000000001',
  null,
  '8c300000-0000-4000-8000-000000000001',
  'booking_reminder',
  'email',
  'ru',
  'other@example.test',
  'Other future email',
  'Other body',
  'scheduled',
  now() + interval '2 days',
  0,
  3,
  null,
  null,
  'booking-admin-delivery-other',
  '{}'::jsonb,
  null
);

insert into public.notification_attempts (
  id, business_id, job_id, attempt_number, provider, status,
  provider_message_id, started_at, finished_at
) values (
  '8c700000-0000-4000-8000-000000000001',
  '8c200000-0000-4000-8000-000000000001',
  '8c600000-0000-4000-8000-000000000001',
  1,
  'resend',
  'sent',
  'provider-test-1',
  now() - interval '40 minutes',
  now() - interval '30 minutes'
);

select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

select lives_ok($sql$
  select *
  from public.claim_notification_job(
    '8c600000-0000-4000-8000-000000000002',
    'resend'
  )
$sql$, 'one explicitly selected future notification can be claimed now');

reset role;

select is(
  (select status from public.notification_jobs where id = '8c600000-0000-4000-8000-000000000002'),
  'processing',
  'selected notification is processing'
);
select is(
  (select count(*) from public.notification_attempts where job_id = '8c600000-0000-4000-8000-000000000002'),
  1::bigint,
  'selected notification gets one append-only delivery attempt'
);
select is(
  (select status from public.notification_jobs where id = '8c600000-0000-4000-8000-000000000003'),
  'scheduled',
  'another queued notification is not claimed'
);

select set_config('request.jwt.claim.sub', '8c100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($sql$
  select public.delete_admin_booking('8c500000-0000-4000-8000-000000000001')
$sql$, 'booking with immutable sent notification history can be deleted safely');

reset role;

select is(
  (select count(*) from public.bookings where id = '8c500000-0000-4000-8000-000000000001'),
  0::bigint,
  'booking row is deleted'
);
select is(
  (select booking_id from public.notification_jobs where id = '8c600000-0000-4000-8000-000000000001'),
  null::uuid,
  'sent notification job remains as detached audit history'
);
select is(
  (select count(*) from public.notification_attempts where id = '8c700000-0000-4000-8000-000000000001'),
  1::bigint,
  'immutable notification attempt is preserved'
);

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', '', true);

select * from finish();
rollback;
