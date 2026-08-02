\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

select has_function(
  'public',
  'ensure_admin_booking_management_link',
  array['uuid','text'],
  'admin booking management-link RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.ensure_admin_booking_management_link(uuid,text)', 'EXECUTE'),
  'authenticated operators may issue a client management link'
);
select ok(
  not has_function_privilege('anon', 'public.ensure_admin_booking_management_link(uuid,text)', 'EXECUTE'),
  'anonymous visitors cannot issue admin booking links'
);
select has_function(
  'public',
  'delete_admin_booking',
  array['uuid'],
  'guarded booking deletion RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.delete_admin_booking(uuid)', 'EXECUTE'),
  'authenticated operators may call guarded deletion'
);
select ok(
  not has_function_privilege('anon', 'public.delete_admin_booking(uuid)', 'EXECUTE'),
  'anonymous visitors cannot delete bookings'
);

insert into auth.users (id, email) values
  ('8b100000-0000-4000-8000-000000000001', 'booking-link-manager@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  '8b200000-0000-4000-8000-000000000001',
  'booking-link-delete-test',
  'Booking Link Delete Test',
  'UTC',
  'ru',
  'EUR',
  'active'
);

insert into public.business_members (business_id, user_id, role, is_default) values (
  '8b200000-0000-4000-8000-000000000001',
  '8b100000-0000-4000-8000-000000000001',
  'manager',
  true
);

insert into public.clients (
  id, business_id, name, email, phone, locale
) values (
  '8b300000-0000-4000-8000-000000000001',
  '8b200000-0000-4000-8000-000000000001',
  'Manual Client',
  'manual-client@example.test',
  null,
  'ru'
);

insert into public.services (
  id, business_id, slug, kind, title, description, pricing_model,
  price_minor, currency, duration_min_minutes, duration_max_minutes,
  duration_step_minutes, capacity, is_public, is_active
) values (
  '8b400000-0000-4000-8000-000000000001',
  '8b200000-0000-4000-8000-000000000001',
  'manual-service',
  'appointment',
  'Manual service',
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
  '8b500000-0000-4000-8000-000000000001',
  '8b200000-0000-4000-8000-000000000001',
  '8b300000-0000-4000-8000-000000000001',
  '8b400000-0000-4000-8000-000000000001',
  'confirmed',
  'admin',
  now() + interval '3 days',
  now() + interval '3 days 1 hour',
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

select set_config('request.jwt.claim.sub', '8b100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($sql$
  select public.ensure_admin_booking_management_link(
    '8b500000-0000-4000-8000-000000000001',
    'https://onestudioos.com/'
  )
$sql$, 'manager can issue a client link for an admin-created booking');

reset role;

select is(
  (select count(*) from public.booking_management_links
    where booking_id = '8b500000-0000-4000-8000-000000000001'),
  1::bigint,
  'one management link is stored'
);
select matches(
  (select manage_url from public.booking_management_links
    where booking_id = '8b500000-0000-4000-8000-000000000001'),
  '^https://onestudioos\.com/book/manage/[0-9a-f-]+$',
  'management URL uses the public customer route'
);
set local role authenticated;

select lives_ok($sql$
  select public.ensure_admin_booking_management_link(
    '8b500000-0000-4000-8000-000000000001',
    'https://onestudioos.com'
  )
$sql$, 'management-link creation is idempotent');
reset role;

select is(
  (select count(*) from public.booking_management_links
    where booking_id = '8b500000-0000-4000-8000-000000000001'),
  1::bigint,
  'reissuing the link does not duplicate it'
);

set local role authenticated;

select lives_ok($sql$
  select public.delete_admin_booking('8b500000-0000-4000-8000-000000000001')
$sql$, 'manager can permanently delete an unprotected test booking');
reset role;

select is(
  (select count(*) from public.bookings
    where id = '8b500000-0000-4000-8000-000000000001'),
  0::bigint,
  'booking row is deleted'
);
select is(
  (select count(*) from public.booking_management_links
    where booking_id = '8b500000-0000-4000-8000-000000000001'),
  0::bigint,
  'management link cascades with booking deletion'
);

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', '', true);

select * from finish();
rollback;
