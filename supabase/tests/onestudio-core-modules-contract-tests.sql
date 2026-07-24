\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(40);

select has_table('public', 'businesses', 'business workspace table exists');
select has_table('public', 'business_members', 'business membership table exists');
select has_table('public', 'clients', 'canonical CRM clients table exists');
select has_table('public', 'services', 'canonical service catalog exists');
select has_table('public', 'resources', 'canonical resource catalog exists');
select has_table('public', 'service_resources', 'services can require resources');
select has_table('public', 'availability_rules', 'weekly availability rules exist');
select has_table('public', 'availability_exceptions', 'availability exceptions exist');
select has_table('public', 'bookings', 'one canonical booking table exists');
select has_table('public', 'booking_allocations', 'resource allocations exist');
select has_table('public', 'business_modules', 'per-business module registry exists');

select has_column('public', 'businesses', 'timezone', 'business owns a timezone');
select has_column('public', 'businesses', 'default_currency', 'business owns a default currency');
select has_column('public', 'clients', 'auth_user_id', 'guest clients may later link to auth');
select has_column('public', 'services', 'pricing_model', 'services support multiple pricing models');
select has_column('public', 'services', 'duration_step_minutes', 'variable duration has an explicit step');
select has_column('public', 'resources', 'kind', 'resources cover staff, space and equipment');
select has_column('public', 'bookings', 'starts_at', 'bookings use timezone-aware instants');
select has_column('public', 'bookings', 'total_minor', 'money is stored in minor units');
select has_column('public', 'booking_allocations', 'resource_id', 'allocations reserve a resource');

select ok((select relrowsecurity from pg_class where oid = 'public.clients'::regclass), 'RLS is enabled on clients');
select ok((select relrowsecurity from pg_class where oid = 'public.bookings'::regclass), 'RLS is enabled on bookings');
select ok((select relrowsecurity from pg_class where oid = 'public.booking_allocations'::regclass), 'RLS is enabled on allocations');
select ok((select relrowsecurity from pg_class where oid = 'public.business_members'::regclass), 'RLS is enabled on memberships');

select ok(has_table_privilege('anon', 'public.services', 'SELECT'), 'anonymous visitors may read public services');
select ok(has_table_privilege('anon', 'public.resources', 'SELECT'), 'anonymous visitors may read public resources');
select ok(not has_table_privilege('anon', 'public.clients', 'INSERT'), 'anonymous visitors cannot write CRM clients');
select ok(not has_table_privilege('anon', 'public.bookings', 'INSERT'), 'anonymous visitors cannot insert bookings directly');
select ok(not has_table_privilege('anon', 'public.booking_allocations', 'INSERT'), 'anonymous visitors cannot reserve resources directly');

select lives_ok($sql$
  insert into public.businesses (id, slug, name, timezone, default_locale, default_currency)
  values ('11000000-0000-4000-8000-000000000001', 'contract-test', 'Contract Test', 'Europe/Berlin', 'de', 'EUR')
$sql$, 'a locale-neutral business can be created');

select lives_ok($sql$
  insert into public.clients (id, business_id, name, email, locale)
  values ('12000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'Guest Client', 'guest@example.test', 'de')
$sql$, 'a guest CRM client can be created');

select lives_ok($sql$
  insert into public.services (id, business_id, slug, kind, title, pricing_model, price_minor, currency, duration_min_minutes, duration_max_minutes, duration_step_minutes)
  values ('13000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'room-rental', 'rental', 'Room rental', 'per_hour', 5000, 'EUR', 60, 300, 60)
$sql$, 'a rental is represented as a service');

select lives_ok($sql$
  insert into public.resources (id, business_id, slug, kind, name)
  values ('14000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'main-room', 'space', 'Main room')
$sql$, 'a room is represented as a resource');

select lives_ok($sql$
  insert into public.service_resources (business_id, service_id, resource_id, allocation_mode)
  values ('11000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', '14000000-0000-4000-8000-000000000001', 'required')
$sql$, 'a service can require a resource');

select lives_ok($sql$
  insert into public.bookings (id, business_id, reference, client_id, service_id, starts_at, ends_at, timezone, subtotal_minor, total_minor, currency)
  values ('15000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'BK-CONTRACT-1', '12000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', '2030-01-01 10:00+01', '2030-01-01 12:00+01', 'Europe/Berlin', 10000, 10000, 'EUR')
$sql$, 'a canonical booking can be created');

select lives_ok($sql$
  insert into public.booking_allocations (business_id, booking_id, resource_id, status, starts_at, ends_at)
  values ('11000000-0000-4000-8000-000000000001', '15000000-0000-4000-8000-000000000001', '14000000-0000-4000-8000-000000000001', 'confirmed', '2030-01-01 10:00+01', '2030-01-01 12:00+01')
$sql$, 'a resource allocation can be created');

select throws_ok($sql$
  insert into public.booking_allocations (business_id, booking_id, resource_id, status, starts_at, ends_at)
  values ('11000000-0000-4000-8000-000000000001', '15000000-0000-4000-8000-000000000001', '14000000-0000-4000-8000-000000000001', 'confirmed', '2030-01-01 11:00+01', '2030-01-01 13:00+01')
$sql$, '23P01', null, 'overlapping active allocation is rejected by the database');

update public.bookings set status = 'cancelled' where id = '15000000-0000-4000-8000-000000000001';
select is((select status from public.booking_allocations where booking_id = '15000000-0000-4000-8000-000000000001'), 'released', 'cancelled booking releases allocations');

select has_table('public', 'service_bookings', 'legacy service bookings remain for migration');
select has_table('public', 'resource_bookings', 'legacy resource bookings remain for migration');

select * from finish();
rollback;
