\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(18);

select has_function(
  'public',
  'get_admin_core_suite_overview',
  array['uuid'],
  'Core Suite overview RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.get_admin_core_suite_overview(uuid)',
    'EXECUTE'
  ),
  'authenticated members may request the command center overview'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.get_admin_core_suite_overview(uuid)',
    'EXECUTE'
  ),
  'anonymous visitors cannot request the command center overview'
);
select is(
  (
    select count(*)
    from public.business_modules
    where business_id = '00000000-0000-4000-8000-000000000001'
      and enabled
  ),
  10::bigint,
  'existing workspaces expose core plus all nine enabled modules'
);
select is(
  (
    select count(*)
    from public.business_modules
    where business_id = '00000000-0000-4000-8000-000000000001'
      and module_key = 'documents'
  ),
  1::bigint,
  'existing legal module records are aligned to documents'
);
select is(
  (
    select count(*)
    from public.business_modules
    where module_key = 'legal'
  ),
  0::bigint,
  'legacy legal module keys are removed'
);

insert into auth.users (id, email) values
  ('c1000000-0000-4000-8000-000000000001', 'suite.owner@example.test'),
  ('c1000000-0000-4000-8000-000000000002', 'suite.viewer@example.test'),
  ('c1000000-0000-4000-8000-000000000003', 'suite.outsider@example.test');

insert into public.profiles (id, name, email, role) values
  ('c1000000-0000-4000-8000-000000000001', 'Suite Owner', 'suite.owner@example.test', 'client'),
  ('c1000000-0000-4000-8000-000000000002', 'Suite Viewer', 'suite.viewer@example.test', 'client'),
  ('c1000000-0000-4000-8000-000000000003', 'Suite Outsider', 'suite.outsider@example.test', 'client')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values
  ('c2000000-0000-4000-8000-000000000001', 'suite-alpha', 'Suite Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('c2000000-0000-4000-8000-000000000002', 'suite-beta', 'Suite Beta', 'UTC', 'en', 'USD', 'active');

insert into public.business_members (
  business_id, user_id, role, is_default
) values
  ('c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'owner', true),
  ('c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'viewer', true);

select is(
  (
    select count(*)
    from public.business_modules
    where business_id = 'c2000000-0000-4000-8000-000000000001'
      and enabled
  ),
  10::bigint,
  'new workspaces receive core plus all nine modules'
);
select is(
  (
    select version
    from public.business_modules
    where business_id = 'c2000000-0000-4000-8000-000000000001'
      and module_key = 'documents'
  ),
  '1.0.0',
  'new workspaces record the documents module version'
);
select is(
  (
    select config ->> 'core_suite'
    from public.business_modules
    where business_id = 'c2000000-0000-4000-8000-000000000001'
      and module_key = 'core'
  ),
  '1.0.0',
  'new workspaces record the Core Suite release'
);

insert into public.clients (
  id, business_id, name, email, locale
) values
  ('c3000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'Suite Client', 'suite.client@example.test', 'en'),
  ('c3000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'Other Client', 'suite.other@example.test', 'en');

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes, capacity
) values
  ('c4000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'suite-service', 'appointment', 'Suite service', 'fixed', 10000, 'EUR', 60, 60, 30, 1),
  ('c4000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'other-service', 'appointment', 'Other service', 'fixed', 5000, 'USD', 60, 60, 30, 1);

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, subtotal_minor, discount_minor,
  total_minor, currency
) values
  (
    'c5000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'BK-SUITE-TODAY',
    'c3000000-0000-4000-8000-000000000001',
    'c4000000-0000-4000-8000-000000000001',
    'confirmed',
    'public',
    ((now() at time zone 'UTC')::date + time '10:00') at time zone 'UTC',
    ((now() at time zone 'UTC')::date + time '11:00') at time zone 'UTC',
    'UTC',
    'en',
    10000,
    0,
    10000,
    'EUR'
  ),
  (
    'c5000000-0000-4000-8000-000000000002',
    'c2000000-0000-4000-8000-000000000001',
    'BK-SUITE-PAID',
    'c3000000-0000-4000-8000-000000000001',
    'c4000000-0000-4000-8000-000000000001',
    'completed',
    'admin',
    (((now() at time zone 'UTC')::date - 1) + time '10:00') at time zone 'UTC',
    (((now() at time zone 'UTC')::date - 1) + time '11:00') at time zone 'UTC',
    'UTC',
    'en',
    10000,
    0,
    10000,
    'EUR'
  ),
  (
    'c5000000-0000-4000-8000-000000000003',
    'c2000000-0000-4000-8000-000000000002',
    'BK-SUITE-OTHER',
    'c3000000-0000-4000-8000-000000000002',
    'c4000000-0000-4000-8000-000000000002',
    'confirmed',
    'public',
    ((now() at time zone 'UTC')::date + time '10:00') at time zone 'UTC',
    ((now() at time zone 'UTC')::date + time '11:00') at time zone 'UTC',
    'UTC',
    'en',
    5000,
    0,
    5000,
    'USD'
  );

insert into public.payment_transactions (
  id, business_id, booking_id, client_id, kind, amount_minor, currency,
  provider, method, provider_reference
) values (
  'c6000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001',
  'c5000000-0000-4000-8000-000000000002',
  'c3000000-0000-4000-8000-000000000001',
  'payment',
  10000,
  'EUR',
  'manual',
  'card',
  'SUITE-PAY-001'
);

insert into public.document_templates (
  id, business_id, template_key, document_type, locale,
  title_template, body_template, version, status
) values
  ('c7000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'suite_contract', 'contract', 'en', 'Contract', 'Contract body', 1, 'active'),
  ('c7000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'other_contract', 'contract', 'en', 'Other contract', 'Other body', 1, 'active');

insert into public.generated_documents (
  id, business_id, template_id, client_id, booking_id, document_type, locale,
  document_number, title_snapshot, content_snapshot, status
) values
  ('c8000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'c7000000-0000-4000-8000-000000000001', 'c3000000-0000-4000-8000-000000000001', 'c5000000-0000-4000-8000-000000000001', 'contract', 'en', 'DOC-SUITE-001', 'Contract', 'Contract body', 'final'),
  ('c8000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'c7000000-0000-4000-8000-000000000002', 'c3000000-0000-4000-8000-000000000002', 'c5000000-0000-4000-8000-000000000003', 'contract', 'en', 'DOC-OTHER-001', 'Other contract', 'Other body', 'final');

insert into public.notification_jobs (
  id, business_id, event_type, locale, recipient_email, subject, body,
  status, idempotency_key, last_error
) values
  ('c9000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'booking_confirmed', 'en', 'suite.client@example.test', 'Failed message', 'Failed body', 'failed', 'suite-failed-message-001', 'provider error'),
  ('c9000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'booking_confirmed', 'en', 'suite.other@example.test', 'Other failed', 'Other body', 'failed', 'other-failed-message-001', 'provider error');

select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->>'today_bookings')::integer,
  1,
  'overview counts active bookings scheduled today'
);
select is(
  (public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->>'unpaid_bookings')::integer,
  1,
  'overview counts unpaid non-cancelled bookings'
);
select is(
  (public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->>'unsent_documents')::integer,
  1,
  'overview counts unsent document snapshots'
);
select is(
  (public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->>'needs_review')::integer,
  1,
  'overview counts failed notification jobs'
);
select is(
  (public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->>'enabled_modules')::integer,
  10,
  'overview reports every enabled Core Suite module'
);
select is(
  public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->'workspace'->>'name',
  'Suite Alpha',
  'overview declares the selected workspace'
);

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001')->>'today_bookings')::integer,
  1,
  'workspace viewers may read the overview'
);

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $sql$ select public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001') $sql$,
  '42501',
  'core_suite_overview_forbidden',
  'outsiders cannot read another workspace overview'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok(
  $sql$ select public.get_admin_core_suite_overview('c2000000-0000-4000-8000-000000000001') $sql$,
  '42501',
  null,
  'anonymous visitors cannot execute the overview RPC'
);

reset role;
select * from finish();
rollback;
