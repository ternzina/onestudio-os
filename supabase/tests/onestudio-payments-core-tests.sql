\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(100);

select has_column('public', 'bookings', 'payment_required', 'bookings declare whether payment is required');
select has_column('public', 'bookings', 'paid_minor', 'bookings cache gross received money');
select has_column('public', 'bookings', 'refunded_minor', 'bookings cache refunded money');
select has_table('public', 'payment_transactions', 'provider-neutral payment ledger exists');
select has_column('public', 'payment_transactions', 'booking_id', 'payment ledger links to a booking');
select has_column('public', 'payment_transactions', 'client_id', 'payment ledger links to the canonical client');
select has_column('public', 'payment_transactions', 'kind', 'payment ledger distinguishes payments and refunds');
select has_column('public', 'payment_transactions', 'amount_minor', 'payment money uses minor units');
select has_column('public', 'payment_transactions', 'currency', 'payment ledger stores currency');
select has_column('public', 'payment_transactions', 'provider', 'provider adapter identity is preserved');
select has_column('public', 'payment_transactions', 'method', 'payment method is preserved');
select has_column('public', 'payment_transactions', 'provider_reference', 'provider reference is preserved');
select has_column('public', 'payment_transactions', 'idempotency_key', 'idempotency key prevents duplicate money');
select has_column('public', 'payment_transactions', 'occurred_at', 'financial occurrence time is preserved');
select ok((select relrowsecurity from pg_class where oid = 'public.payment_transactions'::regclass), 'RLS is enabled on payment transactions');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='payment_transactions_booking_occurred_idx'), 'booking payment history index exists');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='payment_transactions_idempotency_unique'), 'payment idempotency index exists');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='payment_transactions_provider_reference_unique'), 'provider reference uniqueness index exists');
select has_function('public', 'derive_booking_payment_status', array['boolean','integer','integer','integer'], 'payment status derivation exists');
select has_function('public', 'append_payment_transaction', array['uuid','text','integer','text','text','text','text','timestamp with time zone','text','jsonb'], 'provider adapter ledger seam exists');
select has_function('public', 'record_admin_payment', array['uuid','integer','text','text','text','text','timestamp with time zone','text'], 'manual payment RPC exists');
select has_function('public', 'record_admin_refund', array['uuid','integer','text','text','text','text','timestamp with time zone','text'], 'manual refund RPC exists');
select has_function('public', 'set_admin_booking_payment_required', array['uuid','boolean'], 'payment requirement RPC exists');
select has_function('public', 'get_admin_payments', array['uuid','boolean'], 'payment summary RPC exists');
select has_function('public', 'get_admin_payment_transactions', array['uuid'], 'payment history RPC exists');
select has_trigger('public', 'bookings', 'bookings_prepare_payment_state_insert', 'new bookings receive a payment state');
select has_trigger('public', 'bookings', 'bookings_prepare_payment_state_update', 'booking totals preserve payment invariants');
select has_trigger('public', 'payment_transactions', 'payment_transactions_refresh_booking', 'ledger entries refresh booking totals');
select has_trigger('public', 'payment_transactions', 'payment_transactions_immutable', 'posted ledger entries are immutable');
select ok(has_function_privilege('authenticated', 'public.record_admin_payment(uuid,integer,text,text,text,text,timestamp with time zone,text)', 'EXECUTE'), 'authenticated operators may record payments through the RPC');
select ok(not has_function_privilege('anon', 'public.record_admin_payment(uuid,integer,text,text,text,text,timestamp with time zone,text)', 'EXECUTE'), 'anonymous visitors cannot record payments');
select ok(has_function_privilege('service_role', 'public.append_payment_transaction(uuid,text,integer,text,text,text,text,timestamp with time zone,text,jsonb)', 'EXECUTE'), 'service role may use the provider adapter seam');
select ok(not has_function_privilege('authenticated', 'public.append_payment_transaction(uuid,text,integer,text,text,text,text,timestamp with time zone,text,jsonb)', 'EXECUTE'), 'authenticated users cannot spoof provider ledger entries');
select ok(not has_table_privilege('anon', 'public.payment_transactions', 'SELECT'), 'anonymous visitors cannot read payment history');
select ok(has_table_privilege('authenticated', 'public.payment_transactions', 'SELECT'), 'authenticated members may read payment history through RLS');
select ok(not has_table_privilege('authenticated', 'public.payment_transactions', 'INSERT'), 'authenticated users cannot bypass payment RPCs');
select ok(not has_table_privilege('authenticated', 'public.payment_transactions', 'UPDATE'), 'authenticated users cannot rewrite payment entries');
select ok(not has_table_privilege('authenticated', 'public.payment_transactions', 'DELETE'), 'authenticated users cannot delete payment entries');
select ok(obj_description('public.payment_transactions'::regclass, 'pg_class') is not null, 'payment ledger is documented');
select ok(obj_description('public.record_admin_payment(uuid,integer,text,text,text,text,timestamp with time zone,text)'::regprocedure, 'pg_proc') is not null, 'payment recording RPC is documented');

insert into auth.users (id, email) values
  ('a1000000-0000-4000-8000-000000000001', 'payments.owner@example.test'),
  ('a1000000-0000-4000-8000-000000000002', 'payments.staff@example.test'),
  ('a1000000-0000-4000-8000-000000000003', 'payments.viewer@example.test'),
  ('a1000000-0000-4000-8000-000000000004', 'payments.outsider@example.test');

insert into public.profiles (id, name, email, role) values
  ('a1000000-0000-4000-8000-000000000001', 'Payments Owner', 'payments.owner@example.test', 'client'),
  ('a1000000-0000-4000-8000-000000000002', 'Payments Staff', 'payments.staff@example.test', 'client'),
  ('a1000000-0000-4000-8000-000000000003', 'Payments Viewer', 'payments.viewer@example.test', 'client'),
  ('a1000000-0000-4000-8000-000000000004', 'Payments Outsider', 'payments.outsider@example.test', 'client')
on conflict (id) do update set name=excluded.name, email=excluded.email, role=excluded.role;

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency, status) values
  ('a2000000-0000-4000-8000-000000000001', 'payments-alpha', 'Payments Alpha', 'UTC', 'en', 'EUR', 'active'),
  ('a2000000-0000-4000-8000-000000000002', 'payments-beta', 'Payments Beta', 'UTC', 'en', 'USD', 'active');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'owner', true),
  ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'staff', true),
  ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 'viewer', true);

insert into public.clients (id, business_id, name, email, locale) values
  ('a3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Paying Client', 'payer@example.test', 'en'),
  ('a3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'Second Client', 'second.payer@example.test', 'en'),
  ('a3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000002', 'Other Client', 'other.payer@example.test', 'en');

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes, capacity, is_public, is_active
) values
  ('a4000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'paid-service', 'appointment', 'Paid Service', 'fixed', 10000, 'EUR', 60, 60, 30, 2, true, true),
  ('a4000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'free-service', 'appointment', 'Free Service', 'free', null, 'EUR', 60, 60, 30, 2, true, true),
  ('a4000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000002', 'other-service', 'appointment', 'Other Service', 'fixed', 9000, 'USD', 60, 60, 30, 2, true, true);

insert into public.bookings (
  id, business_id, reference, client_id, service_id, status, source,
  starts_at, ends_at, timezone, locale, subtotal_minor, discount_minor, total_minor, currency
) values
  ('a5000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'BK-PAY-001', 'a3000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000001', 'confirmed', 'admin', now()+interval '1 day', now()+interval '1 day 1 hour', 'UTC', 'en', 10000, 0, 10000, 'EUR'),
  ('a5000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'BK-PAY-002', 'a3000000-0000-4000-8000-000000000002', 'a4000000-0000-4000-8000-000000000001', 'pending', 'public', now()+interval '2 days', now()+interval '2 days 1 hour', 'UTC', 'en', 5000, 0, 5000, 'EUR'),
  ('a5000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000001', 'BK-PAY-FREE', 'a3000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000002', 'confirmed', 'admin', now()+interval '3 days', now()+interval '3 days 1 hour', 'UTC', 'en', 0, 0, 0, 'EUR'),
  ('a5000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000001', 'BK-PAY-CANCELLED', 'a3000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000001', 'cancelled', 'admin', now()-interval '2 days', now()-interval '2 days'+interval '1 hour', 'UTC', 'en', 5000, 0, 5000, 'EUR'),
  ('a5000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000002', 'BK-PAY-OTHER', 'a3000000-0000-4000-8000-000000000003', 'a4000000-0000-4000-8000-000000000003', 'confirmed', 'admin', now()+interval '1 day', now()+interval '1 day 1 hour', 'UTC', 'en', 9000, 0, 9000, 'USD');

select is((select enabled from public.business_modules where business_id='a2000000-0000-4000-8000-000000000001' and module_key='payments'), true, 'new workspaces enable payments');
select is((select version from public.business_modules where business_id='a2000000-0000-4000-8000-000000000001' and module_key='payments'), '1.0.0', 'new workspaces record Payments Core version');
select is((select (config->>'provider_neutral_ledger')::boolean from public.business_modules where business_id='a2000000-0000-4000-8000-000000000001' and module_key='payments'), true, 'payments config enables provider-neutral ledger');
select is((select (config->>'immutable_transactions')::boolean from public.business_modules where business_id='a2000000-0000-4000-8000-000000000001' and module_key='payments'), true, 'payments config enables immutable entries');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 'pending', 'priced booking starts unpaid');
select is((select payment_required from public.bookings where id='a5000000-0000-4000-8000-000000000003'), false, 'zero-price booking does not require payment');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000003'), 'not_required', 'zero-price booking keeps not-required status');
select is(public.derive_booking_payment_status(true, 10000, 3000, 0), 'partially_paid', 'status derivation recognizes partial payment');
select is(public.derive_booking_payment_status(true, 10000, 10000, 0), 'paid', 'status derivation recognizes full payment');
select is(public.derive_booking_payment_status(true, 10000, 10000, 10000), 'refunded', 'status derivation recognizes full refund');

select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true)), 4::bigint, 'owner reads all own-workspace booking payment summaries');
select is((select count(*) from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', false)), 3::bigint, 'payment summary can exclude cancelled bookings');
select is((select count(*) from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) where reference='BK-PAY-OTHER'), 0::bigint, 'payment summary excludes other tenants');
select is((select due_minor from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) where reference='BK-PAY-001'), 10000, 'unpaid summary exposes full balance due');
select is(public.set_admin_booking_payment_required('a5000000-0000-4000-8000-000000000002', false), true, 'operator can mark an unpaid booking as payment not required');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000002'), 'not_required', 'disabled payment requirement updates status');
select is(public.set_admin_booking_payment_required('a5000000-0000-4000-8000-000000000002', true), true, 'operator can restore payment requirement');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000002'), 'pending', 'restored payment requirement returns unpaid status');
select throws_ok($sql$ select public.set_admin_booking_payment_required('a5000000-0000-4000-8000-000000000003', true) $sql$, '22023', 'payment_required_for_zero_total', 'free booking cannot require payment');

select lives_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000001', 3000, 'cash', 'manual', 'CASH-001', 'Deposit', now(), 'pay-idem-0001')
$sql$, 'owner records a manual deposit');
select is((select paid_minor from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 3000, 'deposit refreshes gross paid amount');
select is((select refunded_minor from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 0, 'deposit does not invent refunds');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 'partially_paid', 'deposit marks booking partially paid');
select is((select due_minor from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) where reference='BK-PAY-001'), 7000, 'summary subtracts deposit from balance due');
select is((select method from public.payment_transactions where provider_reference='CASH-001'), 'cash', 'ledger preserves manual payment method');
select is((select client_id from public.payment_transactions where provider_reference='CASH-001'), 'a3000000-0000-4000-8000-000000000001'::uuid, 'ledger links payment to canonical client');
select is(
  public.record_admin_payment('a5000000-0000-4000-8000-000000000001', 3000, 'cash', 'manual', 'CASH-001', 'Deposit', now(), 'pay-idem-0001'),
  (select id from public.payment_transactions where idempotency_key='pay-idem-0001'),
  'repeated idempotency key returns the original transaction'
);
select is((select count(*) from public.payment_transactions where idempotency_key='pay-idem-0001'), 1::bigint, 'idempotent retry does not duplicate money');
select throws_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000001', 2000, 'cash', 'manual', null, '', now(), 'pay-idem-0001')
$sql$, '23505', 'payment_idempotency_conflict', 'same idempotency key cannot describe different money');
select throws_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000001', 7001, 'card', 'manual', null, '', now(), 'pay-idem-overpay')
$sql$, '22023', 'payment_exceeds_balance_due', 'payment cannot exceed remaining balance');
select lives_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000001', 7000, 'card', 'manual', 'CARD-001', 'Balance', now(), 'pay-idem-0002')
$sql$, 'owner records the remaining balance');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 'paid', 'full balance marks booking paid');
select is((select due_minor from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) where reference='BK-PAY-001'), 0, 'paid booking has no balance due');
select throws_ok($sql$
  select public.set_admin_booking_payment_required('a5000000-0000-4000-8000-000000000001', false)
$sql$, '55000', 'payment_requirement_has_transactions', 'booking with ledger history cannot become payment-not-required');
select throws_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000004', 1000, 'cash', 'manual', null, '', now(), 'pay-cancelled')
$sql$, '55000', 'booking_cannot_accept_payment', 'cancelled booking cannot accept new money');
select lives_ok($sql$
  select public.record_admin_refund('a5000000-0000-4000-8000-000000000001', 2500, 'card', 'manual', 'REFUND-001', 'Partial refund', now(), 'refund-idem-0001')
$sql$, 'owner records a partial refund');
select is((select refunded_minor from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 2500, 'partial refund refreshes refunded amount');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 'partially_paid', 'partial refund reopens a balance');
select throws_ok($sql$
  select public.record_admin_refund('a5000000-0000-4000-8000-000000000001', 7501, 'card', 'manual', null, '', now(), 'refund-too-large')
$sql$, '22023', 'refund_exceeds_available_balance', 'refund cannot exceed net received money');
select lives_ok($sql$
  select public.record_admin_refund('a5000000-0000-4000-8000-000000000001', 7500, 'card', 'manual', 'REFUND-002', 'Full refund', now(), 'refund-idem-0002')
$sql$, 'owner completes a full refund');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000001'), 'refunded', 'full refund marks booking refunded');
select is((select transaction_count from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) where reference='BK-PAY-001'), 4::bigint, 'summary counts every immutable ledger entry');
select is((select count(*) from public.get_admin_payment_transactions('a5000000-0000-4000-8000-000000000001')), 4::bigint, 'payment history returns every booking transaction');
select is((select kind from public.get_admin_payment_transactions('a5000000-0000-4000-8000-000000000001') limit 1), 'refund', 'payment history is newest first');
select throws_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000005', 1000, 'cash', 'manual', null, '', now(), 'cross-tenant-payment')
$sql$, '42501', 'payment_operation_forbidden', 'operator cannot record another tenant payment');

reset role;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true)), 4::bigint, 'viewer may read payment summaries');
select is((select count(*) from public.get_admin_payment_transactions('a5000000-0000-4000-8000-000000000001')), 4::bigint, 'viewer may read payment history');
select throws_ok($sql$
  select public.record_admin_payment('a5000000-0000-4000-8000-000000000002', 1000, 'cash', 'manual', null, '', now(), 'viewer-payment')
$sql$, '42501', 'payment_operation_forbidden', 'viewer cannot record payment');
select throws_ok($sql$
  select public.set_admin_booking_payment_required('a5000000-0000-4000-8000-000000000002', false)
$sql$, '42501', 'payment_operation_forbidden', 'viewer cannot change payment requirement');

reset role;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok($sql$ select * from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) $sql$, '42501', 'payment_read_forbidden', 'outsider cannot read workspace payments');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok($sql$ select * from public.get_admin_payments('a2000000-0000-4000-8000-000000000001', true) $sql$, '42501', null, 'anonymous visitor cannot execute payment summary');
select throws_ok($sql$ select * from public.get_admin_payment_transactions('a5000000-0000-4000-8000-000000000001') $sql$, '42501', null, 'anonymous visitor cannot execute payment history');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

select lives_ok($sql$
  select public.append_payment_transaction(
    'a5000000-0000-4000-8000-000000000002', 'payment', 2000, 'online', 'stripe',
    'pi_provider_001', 'Provider payment', now(), 'provider-idem-0001', '{"event":"checkout.completed"}'::jsonb
  )
$sql$, 'service role provider adapter appends final payment');
select is((select provider from public.payment_transactions where provider_reference='pi_provider_001'), 'stripe', 'provider ledger entry preserves adapter name');
select is((select payment_status from public.bookings where id='a5000000-0000-4000-8000-000000000002'), 'partially_paid', 'provider payment refreshes booking status');
select throws_ok($sql$
  update public.payment_transactions set amount_minor=1 where provider_reference='pi_provider_001'
$sql$, '55000', 'payment_transaction_immutable', 'posted provider transaction cannot be rewritten');
select throws_ok($sql$
  delete from public.payment_transactions where provider_reference='pi_provider_001'
$sql$, '55000', 'payment_transaction_immutable', 'posted provider transaction cannot be deleted');
select throws_ok($sql$
  update public.bookings set currency='USD' where id='a5000000-0000-4000-8000-000000000002'
$sql$, '55000', 'booking_currency_locked_after_payment', 'booking currency is locked after receiving money');
select throws_ok($sql$
  update public.bookings set total_minor=1000, subtotal_minor=1000 where id='a5000000-0000-4000-8000-000000000002'
$sql$, '22023', 'booking_total_below_paid_balance', 'booking total cannot fall below net received money');
select throws_ok($sql$
  select public.append_payment_transaction(
    'a5000000-0000-4000-8000-000000000002', 'payment', 1000, 'online', 'stripe',
    'pi_provider_001', 'Duplicate provider reference', now(), 'provider-idem-0002', '{}'::jsonb
  )
$sql$, '23505', null, 'provider reference cannot be recorded twice');

reset role;
select * from finish();
rollback;
