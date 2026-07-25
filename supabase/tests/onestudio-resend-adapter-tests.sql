begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(37);

-- Keep provider claiming deterministic on a local database that may already
-- contain real pending notification jobs. This change is inside the test
-- transaction and is rolled back at the end, so the live queue is preserved.
update public.notification_jobs
set scheduled_for = now() + interval '100 years',
    updated_at = now()
where status in ('scheduled', 'pending');

select has_function('public', 'claim_notification_jobs', array['text','integer'], 'Resend adapter claim function exists');
select has_function('public', 'recover_stale_notification_jobs', array['text','timestamp with time zone'], 'stale processing recovery function exists');
select ok(has_function_privilege('service_role', 'public.claim_notification_jobs(text,integer)', 'EXECUTE'), 'service role may claim notification jobs');
select ok(has_function_privilege('service_role', 'public.recover_stale_notification_jobs(text,timestamp with time zone)', 'EXECUTE'), 'service role may recover stale notification jobs');
select ok(not has_function_privilege('authenticated', 'public.claim_notification_jobs(text,integer)', 'EXECUTE'), 'authenticated users cannot claim notification jobs');
select ok(not has_function_privilege('authenticated', 'public.recover_stale_notification_jobs(text,timestamp with time zone)', 'EXECUTE'), 'authenticated users cannot recover provider jobs');
select ok(obj_description('public.claim_notification_jobs(text,integer)'::regprocedure, 'pg_proc') is not null, 'Resend claim seam is documented');
select ok(obj_description('public.recover_stale_notification_jobs(text,timestamp with time zone)'::regprocedure, 'pg_proc') is not null, 'stale processing recovery is documented');

insert into auth.users (id, email) values
  ('c1000000-0000-4000-8000-000000000001', 'resend.owner@example.test');

insert into public.profiles (id, name, email, role) values
  ('c1000000-0000-4000-8000-000000000001', 'Resend Owner', 'resend.owner@example.test', 'client')
on conflict (id) do update set name=excluded.name, email=excluded.email, role=excluded.role;

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  'c2000000-0000-4000-8000-000000000001',
  'resend-alpha',
  'Resend Alpha',
  'UTC',
  'en',
  'EUR',
  'active'
);

insert into public.business_members (business_id, user_id, role, is_default) values (
  'c2000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  'owner',
  true
);

insert into public.clients (id, business_id, name, email, locale) values (
  'c3000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001',
  'Resend Client',
  'resend.client@example.test',
  'en'
);

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  capacity, is_public, is_active
) values (
  'c4000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001',
  'resend-service',
  'appointment',
  'Resend Service',
  'fixed',
  12000,
  'EUR',
  60,
  60,
  30,
  1,
  true,
  true
);

update public.business_notification_settings
set from_name='Resend Alpha Mail',
    reply_to_email='reply@example.test'
where business_id='c2000000-0000-4000-8000-000000000001';

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale,
  subtotal_minor, discount_minor, total_minor, currency
) values (
  'c5000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001',
  'BK-RESEND-1',
  'c3000000-0000-4000-8000-000000000001',
  'c4000000-0000-4000-8000-000000000001',
  'confirmed',
  'admin',
  now()+interval '3 days',
  now()+interval '3 days 1 hour',
  'UTC',
  'en',
  12000,
  0,
  12000,
  'EUR'
);

select is((select version from public.business_modules where business_id='c2000000-0000-4000-8000-000000000001' and module_key='notifications'), '1.1.0', 'new workspaces receive Notifications 1.1.0');
select is((select (config->>'resend_adapter')::boolean from public.business_modules where business_id='c2000000-0000-4000-8000-000000000001' and module_key='notifications'), true, 'new workspace enables Resend adapter capability');
select is((select (config->>'processing_recovery')::boolean from public.business_modules where business_id='c2000000-0000-4000-8000-000000000001' and module_key='notifications'), true, 'new workspace enables stale processing recovery');
select is((select count(*) from public.notification_jobs where booking_id='c5000000-0000-4000-8000-000000000001'), 2::bigint, 'confirmed booking still creates confirmation and reminder jobs');

update public.notification_jobs
set scheduled_for=now()+interval '1 day',
    status='scheduled'
where booking_id='c5000000-0000-4000-8000-000000000001';

update public.notification_jobs
set scheduled_for=now()-interval '1 minute',
    status='pending'
where booking_id='c5000000-0000-4000-8000-000000000001'
  and event_type='booking_confirmed';

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

create temporary table claimed_resend_job on commit drop as
select *
from public.claim_notification_jobs('resend', 10);

select is((select count(*) from claimed_resend_job), 1::bigint, 'Resend claims one due job');
select is((select from_name from claimed_resend_job), 'Resend Alpha Mail', 'claim returns workspace sender name');
select is((select reply_to_email from claimed_resend_job), 'reply@example.test', 'claim returns workspace reply-to email');
select is((select idempotency_key from claimed_resend_job), (select idempotency_key from public.notification_jobs where id=(select id from claimed_resend_job)), 'claim returns stable queue idempotency key');
select is((select status from public.notification_jobs where id=(select id from claimed_resend_job)), 'processing', 'claim moves the job to processing');
select is((select status from public.notification_attempts where job_id=(select id from claimed_resend_job) and attempt_number=1), 'processing', 'claim opens a processing attempt');
select is(public.recover_stale_notification_jobs('resend', now()-interval '15 minutes'), 0, 'fresh processing job is not recovered');

update public.notification_jobs
set updated_at=now()-interval '30 minutes'
where id=(select id from claimed_resend_job);

select is(public.recover_stale_notification_jobs('resend', now()-interval '15 minutes'), 1, 'stale processing job is recovered');
select is((select status from public.notification_jobs where id=(select id from claimed_resend_job)), 'pending', 'recoverable stale job returns to pending');
select is((select status from public.notification_attempts where job_id=(select id from claimed_resend_job) and attempt_number=1), 'failed', 'abandoned provider attempt is finalized as failed');
select is((select last_error from public.notification_jobs where id=(select id from claimed_resend_job)), 'notification_processing_timeout', 'recovered job records timeout reason');

truncate table claimed_resend_job;
insert into claimed_resend_job
select * from public.claim_notification_jobs('resend', 1);

select is((select count(*) from claimed_resend_job), 1::bigint, 'recovered job can be claimed again');
select is((select attempt_number from claimed_resend_job), 2, 'retry claim increments attempt number');
select lives_ok(
  format(
    'select public.mark_notification_sent(%L::uuid, %L)',
    (select id from claimed_resend_job),
    'resend-message-1'
  ),
  'Resend may finalize a claimed job as sent'
);
select is((select status from public.notification_jobs where id=(select id from claimed_resend_job)), 'sent', 'sent job receives final sent status');
select is((select provider_message_id from public.notification_jobs where id=(select id from claimed_resend_job)), 'resend-message-1', 'sent job stores Resend message id');

update public.notification_jobs
set scheduled_for=now()-interval '1 minute',
    status='pending',
    max_attempts=1,
    attempt_count=0
where booking_id='c5000000-0000-4000-8000-000000000001'
  and event_type='booking_reminder';

truncate table claimed_resend_job;
insert into claimed_resend_job
select * from public.claim_notification_jobs('resend', 1);

select is((select count(*) from claimed_resend_job), 1::bigint, 'Resend claims a one-attempt reminder');
update public.notification_jobs set updated_at=now()-interval '30 minutes' where id=(select id from claimed_resend_job);
select is(public.recover_stale_notification_jobs('resend', now()-interval '15 minutes'), 1, 'stale final attempt is recovered');
select is((select status from public.notification_jobs where id=(select id from claimed_resend_job)), 'failed', 'stale job at maximum attempts becomes failed');
select is((select status from public.notification_attempts where job_id=(select id from claimed_resend_job) and attempt_number=1), 'failed', 'final stale attempt is finalized');

select throws_ok(
  $$select * from public.claim_notification_jobs('', 1)$$,
  '22023',
  'invalid_notification_provider',
  'blank provider is rejected'
);
select throws_ok(
  $$select * from public.claim_notification_jobs('resend', 0)$$,
  '22023',
  'invalid_notification_claim_limit',
  'invalid claim limit is rejected'
);
select throws_ok(
  $$select public.recover_stale_notification_jobs('', now())$$,
  '22023',
  'invalid_notification_provider',
  'recovery rejects blank provider'
);
select throws_ok(
  $$select public.recover_stale_notification_jobs('resend', now()+interval '1 minute')$$,
  '22023',
  'invalid_notification_stale_before',
  'recovery rejects a future cutoff'
);
select is((select count(*) from public.claim_notification_jobs('resend', 10)), 0::bigint, 'sent and exhausted jobs are not reclaimed');

reset role;
select * from finish();
rollback;
