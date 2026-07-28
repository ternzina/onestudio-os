\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(26);

select has_function(
  'public',
  'get_admin_analytics',
  array['uuid', 'date', 'date'],
  'analytics summary RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.get_admin_analytics(uuid,date,date)',
    'EXECUTE'
  ),
  'authenticated members may request workspace analytics'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.get_admin_analytics(uuid,date,date)',
    'EXECUTE'
  ),
  'anonymous visitors cannot request workspace analytics'
);
select is(
  (select enabled from public.business_modules
   where business_id = '00000000-0000-4000-8000-000000000001'
     and module_key = 'analytics'),
  true,
  'analytics is enabled for existing workspaces'
);
select is(
  (select version from public.business_modules
   where business_id = '00000000-0000-4000-8000-000000000001'
     and module_key = 'analytics'),
  '1.0.0',
  'existing workspaces record Analytics Core version'
);

insert into auth.users (id, email) values
  ('b1000000-0000-4000-8000-000000000001', 'analytics.owner@example.test'),
  ('b1000000-0000-4000-8000-000000000002', 'analytics.viewer@example.test'),
  ('b1000000-0000-4000-8000-000000000003', 'analytics.outsider@example.test');

insert into public.profiles (id, name, email, role) values
  ('b1000000-0000-4000-8000-000000000001', 'Analytics Owner', 'analytics.owner@example.test', 'client'),
  ('b1000000-0000-4000-8000-000000000002', 'Analytics Viewer', 'analytics.viewer@example.test', 'client'),
  ('b1000000-0000-4000-8000-000000000003', 'Analytics Outsider', 'analytics.outsider@example.test', 'client')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values
  ('b2000000-0000-4000-8000-000000000001', 'analytics-alpha', 'Analytics Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('b2000000-0000-4000-8000-000000000002', 'analytics-beta', 'Analytics Beta', 'UTC', 'en', 'USD', 'active');

insert into public.business_members (
  business_id, user_id, role, is_default
) values
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'owner', true),
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'viewer', true);

insert into public.clients (
  id, business_id, name, email, locale, created_at
) values
  ('b3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'New Client', 'analytics.new@example.test', 'en', '2026-07-02 10:00:00+00'),
  ('b3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'Existing Client', 'analytics.existing@example.test', 'en', '2026-06-01 10:00:00+00'),
  ('b3000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000002', 'Other Tenant', 'analytics.other@example.test', 'en', '2026-07-02 10:00:00+00');

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes, capacity
) values
  ('b4000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'photo-session', 'appointment', 'Photo session', 'fixed', 10000, 'EUR', 60, 60, 30, 1),
  ('b4000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'studio-rental', 'rental', 'Studio rental', 'fixed', 20000, 'EUR', 120, 120, 30, 1),
  ('b4000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000002', 'other-service', 'appointment', 'Other service', 'fixed', 5000, 'USD', 60, 60, 30, 1);

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, subtotal_minor, discount_minor,
  total_minor, currency
) values
  ('b5000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'BK-AN-001', 'b3000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'confirmed', 'public', '2026-07-02 10:00:00+00', '2026-07-02 11:00:00+00', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'BK-AN-002', 'b3000000-0000-4000-8000-000000000002', 'b4000000-0000-4000-8000-000000000002', 'completed', 'admin', '2026-07-03 10:00:00+00', '2026-07-03 12:00:00+00', 'UTC', 'en', 20000, 0, 20000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000001', 'BK-AN-CANCEL', 'b3000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'cancelled', 'public', '2026-07-04 10:00:00+00', '2026-07-04 11:00:00+00', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000001', 'BK-AN-DRAFT', 'b3000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'draft', 'admin', '2026-07-05 10:00:00+00', '2026-07-05 11:00:00+00', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000005', 'b2000000-0000-4000-8000-000000000001', 'BK-AN-USD', 'b3000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'confirmed', 'api', '2026-07-06 10:00:00+00', '2026-07-06 11:00:00+00', 'UTC', 'en', 5000, 0, 5000, 'USD'),
  ('b5000000-0000-4000-8000-000000000006', 'b2000000-0000-4000-8000-000000000001', 'BK-AN-OUTSIDE', 'b3000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'confirmed', 'public', '2026-08-01 10:00:00+00', '2026-08-01 11:00:00+00', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('b5000000-0000-4000-8000-000000000007', 'b2000000-0000-4000-8000-000000000002', 'BK-AN-OTHER', 'b3000000-0000-4000-8000-000000000003', 'b4000000-0000-4000-8000-000000000003', 'confirmed', 'public', '2026-07-02 10:00:00+00', '2026-07-02 11:00:00+00', 'UTC', 'en', 5000, 0, 5000, 'USD');

insert into public.payment_transactions (
  id, business_id, booking_id, client_id, kind, amount_minor, currency,
  provider, method, provider_reference, occurred_at
) values
  ('b6000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'payment', 10000, 'EUR', 'manual', 'cash', 'AN-PAY-001', '2026-07-02 12:00:00+00'),
  ('b6000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'refund', 2000, 'EUR', 'manual', 'cash', 'AN-REF-001', '2026-07-03 12:00:00+00'),
  ('b6000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000002', 'b3000000-0000-4000-8000-000000000002', 'payment', 10000, 'EUR', 'manual', 'card', 'AN-PAY-OLD', '2026-06-30 12:00:00+00');

select is(
  (select enabled from public.business_modules
   where business_id = 'b2000000-0000-4000-8000-000000000001'
     and module_key = 'analytics'),
  true,
  'new workspaces enable analytics'
);
select is(
  (select version from public.business_modules
   where business_id = 'b2000000-0000-4000-8000-000000000001'
     and module_key = 'analytics'),
  '1.0.0',
  'new workspaces record Analytics Core version'
);

select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'bookings_count')::integer,
  3,
  'active booking count excludes drafts and cancellations'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'cancelled_count')::integer,
  1,
  'cancelled bookings are reported separately'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'completed_count')::integer,
  1,
  'completed bookings are counted'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'unique_clients')::integer,
  2,
  'unique clients are derived from active bookings'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'new_clients')::integer,
  1,
  'new client count uses the workspace-local period'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'booked_hours')::numeric,
  4.0::numeric,
  'booked hours use non-cancelled booking duration'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'booked_value_minor')::bigint,
  30000::bigint,
  'booked value uses the workspace default currency'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'collected_minor')::bigint,
  8000::bigint,
  'net collected money follows payment occurrence dates'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'outstanding_minor')::bigint,
  12000::bigint,
  'outstanding amount uses period bookings and cached ledger balances'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'foreign_currency_booking_count')::integer,
  1,
  'foreign-currency bookings are disclosed instead of mixed into money totals'
);
select is(
  jsonb_array_length(public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'daily'),
  10,
  'daily series contains every day in the requested period'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'services'->0->>'title'),
  'Photo session',
  'top services are ordered by booking count and value'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'period'->>'currency'),
  'EUR',
  'analytics declares the currency used for money totals'
);
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'bookings_count')::integer,
  3,
  'owner can read own workspace analytics'
);

reset role;
select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10')->'summary'->>'bookings_count')::integer,
  3,
  'viewer may read workspace analytics'
);

reset role;
select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $sql$ select public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10') $sql$,
  '42501',
  'analytics_read_forbidden',
  'outsider cannot read workspace analytics'
);

reset role;
select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $sql$ select public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-10', '2026-07-01') $sql$,
  '22023',
  'invalid_analytics_period',
  'reversed analytics period is rejected'
);
select throws_ok(
  $sql$ select public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2025-01-01', '2026-07-10') $sql$,
  '22023',
  'invalid_analytics_period',
  'analytics period cannot exceed 366 days'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok(
  $sql$ select public.get_admin_analytics('b2000000-0000-4000-8000-000000000001', '2026-07-01', '2026-07-10') $sql$,
  '42501',
  null,
  'anonymous visitor cannot execute analytics'
);

reset role;
select * from finish();
rollback;
