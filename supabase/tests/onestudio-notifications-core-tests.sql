begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(80);

select has_table('public', 'business_notification_settings', 'notification settings table exists');
select has_table('public', 'notification_templates', 'notification templates table exists');
select has_table('public', 'notification_jobs', 'notification queue table exists');
select has_table('public', 'notification_attempts', 'notification attempt history exists');
select has_column('public', 'notification_jobs', 'idempotency_key', 'queue has idempotency key');
select has_column('public', 'notification_jobs', 'scheduled_for', 'queue has scheduled delivery time');
select has_column('public', 'notification_jobs', 'payload', 'queue preserves render payload');
select has_column('public', 'notification_jobs', 'provider_message_id', 'queue stores provider message id');
select has_column('public', 'notification_attempts', 'attempt_number', 'attempt history is numbered');
select has_function('public', 'get_admin_notification_jobs', array['uuid','text'], 'admin queue RPC exists');
select has_function('public', 'get_admin_notification_templates', array['uuid'], 'template listing RPC exists');
select has_function('public', 'upsert_admin_notification_template', array['uuid','text','text','text','text','boolean'], 'template upsert RPC exists');
select has_function('public', 'update_admin_notification_settings', array['uuid','text','text','boolean','integer','integer'], 'settings RPC exists');
select has_function('public', 'schedule_booking_reminders', array['uuid','timestamp with time zone'], 'reminder scheduling RPC exists');
select has_function('public', 'retry_admin_notification', array['uuid'], 'admin retry RPC exists');
select has_function('public', 'cancel_admin_notification', array['uuid'], 'admin cancel RPC exists');
select has_function('public', 'claim_notification_jobs', array['text','integer'], 'provider claim seam exists');
select has_function('public', 'mark_notification_sent', array['uuid','text'], 'provider sent seam exists');
select has_function('public', 'mark_notification_failed', array['uuid','text','timestamp with time zone'], 'provider failure seam exists');
select ok(has_function_privilege('authenticated', 'public.get_admin_notification_jobs(uuid,text)', 'EXECUTE'), 'authenticated members may read queue through RPC');
select ok(not has_function_privilege('anon', 'public.get_admin_notification_jobs(uuid,text)', 'EXECUTE'), 'anonymous visitors cannot read queue');
select ok(has_function_privilege('service_role', 'public.claim_notification_jobs(text,integer)', 'EXECUTE'), 'service role may claim due jobs');
select ok(not has_function_privilege('authenticated', 'public.claim_notification_jobs(text,integer)', 'EXECUTE'), 'authenticated users cannot impersonate provider');
select ok(not has_table_privilege('anon', 'public.notification_jobs', 'SELECT'), 'anonymous visitors cannot read notification jobs');
select ok(has_table_privilege('authenticated', 'public.notification_jobs', 'SELECT'), 'authenticated members may read jobs through RLS');
select ok(not has_table_privilege('authenticated', 'public.notification_jobs', 'INSERT'), 'authenticated users cannot bypass notification RPCs');
select ok(not has_table_privilege('authenticated', 'public.notification_attempts', 'UPDATE'), 'authenticated users cannot rewrite attempts');
select ok(obj_description('public.notification_jobs'::regclass, 'pg_class') is not null, 'notification queue is documented');
select ok(obj_description('public.claim_notification_jobs(text,integer)'::regprocedure, 'pg_proc') is not null, 'provider seam is documented');
select is(public.render_notification_text('Hello {{client_name}}', '{"client_name":"Ada"}'::jsonb), 'Hello Ada', 'template renderer replaces payload variables');

insert into auth.users (id, email) values
  ('b1000000-0000-4000-8000-000000000001', 'notifications.owner@example.test'),
  ('b1000000-0000-4000-8000-000000000002', 'notifications.staff@example.test'),
  ('b1000000-0000-4000-8000-000000000003', 'notifications.viewer@example.test'),
  ('b1000000-0000-4000-8000-000000000004', 'notifications.outsider@example.test');

insert into public.profiles (id, name, email, role) values
  ('b1000000-0000-4000-8000-000000000001', 'Notifications Owner', 'notifications.owner@example.test', 'client'),
  ('b1000000-0000-4000-8000-000000000002', 'Notifications Staff', 'notifications.staff@example.test', 'client'),
  ('b1000000-0000-4000-8000-000000000003', 'Notifications Viewer', 'notifications.viewer@example.test', 'client'),
  ('b1000000-0000-4000-8000-000000000004', 'Notifications Outsider', 'notifications.outsider@example.test', 'client')
on conflict (id) do update set name=excluded.name, email=excluded.email, role=excluded.role;

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency, status) values
  ('b2000000-0000-4000-8000-000000000001', 'notifications-alpha', 'Notifications Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('b2000000-0000-4000-8000-000000000002', 'notifications-beta', 'Notifications Beta', 'UTC', 'en', 'USD', 'active');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'owner', true),
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'staff', true),
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'viewer', true);

insert into public.clients (id, business_id, name, email, locale) values
  ('b3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'English Client', 'english.client@example.test', 'en'),
  ('b3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'Русский Клиент', 'russian.client@example.test', 'ru'),
  ('b3000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000001', 'No Email Client', null, 'en'),
  ('b3000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000002', 'Other Client', 'other.notification@example.test', 'en');

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes, capacity, is_public, is_active
) values
  ('b4000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'message-service', 'appointment', 'Message Service', 'fixed', 10000, 'EUR', 60, 60, 30, 2, true, true),
  ('b4000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'other-service', 'appointment', 'Other Service', 'fixed', 9000, 'USD', 60, 60, 30, 2, true, true);

select is((select enabled from public.business_modules where business_id='b2000000-0000-4000-8000-000000000001' and module_key='notifications'), true, 'new workspaces enable notifications');
select is((select version from public.business_modules where business_id='b2000000-0000-4000-8000-000000000001' and module_key='notifications'), '1.0.0', 'new workspaces record Notifications Core version');
select is((select (config->>'provider_neutral_queue')::boolean from public.business_modules where business_id='b2000000-0000-4000-8000-000000000001' and module_key='notifications'), true, 'notifications config enables provider-neutral queue');
select is((select count(*) from public.notification_templates where business_id='b2000000-0000-4000-8000-000000000001'), 12::bigint, 'new workspace receives English and Russian templates');
select is((select reminder_minutes from public.business_notification_settings where business_id='b2000000-0000-4000-8000-000000000001'), 1440, 'new workspace receives one-day reminder default');
select is((select max_attempts from public.business_notification_settings where business_id='b2000000-0000-4000-8000-000000000001'), 3, 'new workspace receives three delivery attempts');

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, subtotal_minor, discount_minor, total_minor, currency
) values
  ('b5000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'BK-NOTIFY-EN', 'b3000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'confirmed', 'admin', now()+interval '3 days', now()+interval '3 days 1 hour', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'BK-NOTIFY-RU', 'b3000000-0000-4000-8000-000000000002', 'b4000000-0000-4000-8000-000000000001', 'pending', 'public', now()+interval '4 days', now()+interval '4 days 1 hour', 'UTC', 'ru', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000001', 'BK-NOTIFY-NOEMAIL', 'b3000000-0000-4000-8000-000000000003', 'b4000000-0000-4000-8000-000000000001', 'confirmed', 'admin', now()+interval '5 days', now()+interval '5 days 1 hour', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000002', 'BK-NOTIFY-OTHER', 'b3000000-0000-4000-8000-000000000004', 'b4000000-0000-4000-8000-000000000002', 'confirmed', 'admin', now()+interval '3 days', now()+interval '3 days 1 hour', 'UTC', 'en', 9000, 0, 9000, 'USD');

select is((select count(*) from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001'), 2::bigint, 'confirmed booking creates confirmation and reminder jobs');
select is((select count(*) from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000002'), 2::bigint, 'pending booking creates pending and reminder jobs');
select is((select count(*) from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000003'), 0::bigint, 'client without email does not create unusable jobs');
select is((select locale from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000002' and event_type='booking_pending'), 'ru', 'booking locale selects Russian template');
select matches((select subject from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000002' and event_type='booking_pending'), '^Бронирование', 'Russian subject is rendered');
select matches((select body from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 'English Client', 'rendered body includes canonical client name');
select matches((select body from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 'BK-NOTIFY-EN', 'rendered body includes booking reference');
select is((select status from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_reminder'), 'scheduled', 'future reminder is scheduled');
select is((select count(*) from public.notification_jobs where business_id='b2000000-0000-4000-8000-000000000001' and idempotency_key like 'booking:b5000000-0000-4000-8000-000000000001:reminder:%'), 1::bigint, 'reminder is idempotent');

select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.get_admin_notification_jobs('b2000000-0000-4000-8000-000000000001', null)), 4::bigint, 'owner reads own workspace queue');
select is((select count(*) from public.get_admin_notification_jobs('b2000000-0000-4000-8000-000000000001', null) where booking_reference='BK-NOTIFY-OTHER'), 0::bigint, 'queue RPC excludes other tenants');
select is((select count(*) from public.get_admin_notification_templates('b2000000-0000-4000-8000-000000000001')), 12::bigint, 'owner reads workspace templates');
select lives_ok($sql$
  select public.update_admin_notification_settings(
    'b2000000-0000-4000-8000-000000000001',
    'Alpha Studio',
    'reply@example.test',
    true,
    120,
    4
  )
$sql$, 'owner updates notification settings');
select is((select reminder_minutes from public.business_notification_settings where business_id='b2000000-0000-4000-8000-000000000001'), 120, 'settings RPC stores reminder lead time');
select is((select max_attempts from public.business_notification_settings where business_id='b2000000-0000-4000-8000-000000000001'), 4, 'settings RPC stores retry limit');
select lives_ok($sql$
  select public.upsert_admin_notification_template(
    'b2000000-0000-4000-8000-000000000001',
    'booking_confirmed',
    'pl',
    'Potwierdzenie {{booking_reference}}',
    'Dzień dobry {{client_name}}',
    true
  )
$sql$, 'owner adds a Polish workspace template');
select is((select count(*) from public.notification_templates where business_id='b2000000-0000-4000-8000-000000000001' and locale='pl'), 1::bigint, 'new locale template is stored once');
select throws_ok($sql$
  select public.upsert_admin_notification_template(
    'b2000000-0000-4000-8000-000000000001',
    'unknown',
    'en',
    'Bad',
    'Bad',
    true
  )
$sql$, '22023', 'invalid_notification_event_type', 'unknown notification event is rejected');
select cmp_ok(public.schedule_booking_reminders('b2000000-0000-4000-8000-000000000001', now()+interval '30 days'), '>=', 2, 'reminder scheduler sees upcoming bookings');
select is((select count(*) from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_reminder' and status <> 'cancelled'), 1::bigint, 'reminder scheduler leaves one active reminder after lead-time change');

reset role;
update public.bookings set status='cancelled' where id='b5000000-0000-4000-8000-000000000002';
select is((select count(*) from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000002' and event_type='booking_cancelled'), 1::bigint, 'cancellation creates one cancellation job');
select is((select count(*) from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000002' and event_type='booking_reminder' and status <> 'cancelled'), 0::bigint, 'cancellation cancels every pending reminder');

insert into public.payment_transactions (
  id, business_id, booking_id, client_id, kind, amount_minor, currency,
  provider, method, provider_reference, idempotency_key, note
) values (
  'b6000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'b5000000-0000-4000-8000-000000000001',
  'b3000000-0000-4000-8000-000000000001',
  'payment', 2500, 'EUR', 'manual', 'cash', 'NOTIFY-PAY-1', 'notify-payment-0001', 'Deposit'
);
select is((select count(*) from public.notification_jobs where payment_transaction_id='b6000000-0000-4000-8000-000000000001'), 1::bigint, 'payment ledger entry creates one notification job');
select is((select event_type from public.notification_jobs where payment_transaction_id='b6000000-0000-4000-8000-000000000001'), 'payment_received', 'payment job has correct event');
select matches((select body from public.notification_jobs where payment_transaction_id='b6000000-0000-4000-8000-000000000001'), '25.00 EUR', 'payment message renders transaction amount');

select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select cmp_ok((select count(*) from public.get_admin_notification_jobs('b2000000-0000-4000-8000-000000000001', null)), '>=', 1::bigint, 'viewer may read notification queue');
select throws_ok($sql$
  select public.update_admin_notification_settings(
    'b2000000-0000-4000-8000-000000000001',
    'Blocked',
    null,
    true,
    60,
    3
  )
$sql$, '42501', 'notification_operation_forbidden', 'viewer cannot change settings');
select throws_ok($sql$
  select public.cancel_admin_notification(
    (select id from public.notification_jobs where business_id='b2000000-0000-4000-8000-000000000001' and status='scheduled' limit 1)
  )
$sql$, '42501', 'notification_operation_forbidden', 'viewer cannot cancel queue jobs');

reset role;
select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok($sql$
  select * from public.get_admin_notification_jobs('b2000000-0000-4000-8000-000000000001', null)
$sql$, '42501', 'notification_read_forbidden', 'outsider cannot read workspace queue');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok($sql$
  select * from public.get_admin_notification_templates('b2000000-0000-4000-8000-000000000001')
$sql$, '42501', null, 'anonymous visitor cannot execute template listing');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

update public.notification_jobs
set scheduled_for=now()+interval '1 day', status='scheduled'
where status in ('pending', 'scheduled');

update public.notification_jobs
set scheduled_for=now()-interval '1 minute', status='pending'
where id=(
  select id from public.notification_jobs
  where booking_id='b5000000-0000-4000-8000-000000000001'
    and event_type='booking_confirmed'
  limit 1
);

select is((select count(*) from public.claim_notification_jobs('resend', 10)), 1::bigint, 'provider claims one due pending job');
select is((select status from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 'processing', 'claim moves job to processing');
select is((select attempt_count from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 1, 'claim increments attempt count');
select is((select count(*) from public.notification_attempts where job_id=(select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed')), 1::bigint, 'claim opens append-only attempt');
select lives_ok($sql$
  select public.mark_notification_failed(
    (select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'),
    'temporary provider error',
    now()+interval '5 minutes'
  )
$sql$, 'provider may record retryable failure');
select is((select status from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 'scheduled', 'retryable failure returns job to schedule');
select is((select status from public.notification_attempts where job_id=(select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed') and attempt_number=1), 'failed', 'failed attempt is finalized');
select throws_ok($sql$
  delete from public.notification_attempts
  where job_id=(select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed')
$sql$, '55000', 'notification_attempt_immutable', 'delivery attempts cannot be deleted');

update public.notification_jobs
set scheduled_for=now()-interval '1 minute', status='pending'
where booking_id='b5000000-0000-4000-8000-000000000001'
  and event_type='booking_confirmed';

select is((select count(*) from public.claim_notification_jobs('resend', 1)), 1::bigint, 'provider claims retried job');
select lives_ok($sql$
  select public.mark_notification_sent(
    (select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'),
    'email-provider-message-1'
  )
$sql$, 'provider marks processing job sent');
select is((select status from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 'sent', 'sent job receives final status');
select is((select provider_message_id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'), 'email-provider-message-1', 'sent job stores provider message id');
select is((select count(*) from public.notification_attempts where job_id=(select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed')), 2::bigint, 'retry appends a second attempt');
select throws_ok($sql$
  select public.mark_notification_sent(
    (select id from public.notification_jobs where booking_id='b5000000-0000-4000-8000-000000000001' and event_type='booking_confirmed'),
    'duplicate'
  )
$sql$, '55000', 'notification_job_not_processing', 'sent job cannot be finalized twice');

reset role;
select * from finish();
rollback;
