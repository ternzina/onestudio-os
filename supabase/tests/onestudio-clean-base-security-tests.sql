\set ON_ERROR_STOP on

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(74);

-- Fixed identities and fixtures. Everything is rolled back at the end.
-- Profiles reference auth.users, so create real local auth identities first.
-- This makes profile UPDATE tests exercise grants/RLS instead of failing early
-- on the profiles_id_fkey constraint.
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'client1@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'client2@example.test'),
  ('10000000-0000-0000-0000-000000000099', 'admin@example.test');

insert into public.profiles (id, name, email, role) values
  ('10000000-0000-0000-0000-000000000001', 'Test Client One', 'client1@example.test', 'client'),
  ('10000000-0000-0000-0000-000000000002', 'Test Client Two', 'client2@example.test', 'client'),
  ('10000000-0000-0000-0000-000000000099', 'Test Admin', 'admin@example.test', 'admin');

insert into public.booking_page_settings (
  id, resource_booking_enabled
) values ('main', true)
on conflict (id) do update set
  resource_booking_enabled = excluded.resource_booking_enabled;

insert into public.bookable_resources (slug, title, price_per_hour, currency, open_hour, close_hour, duration_options, is_active, sort_order)
values
  ('main-resource', 'Main resource', 200, 'EUR', 9, 22, array[1,2,3,4,5], true, 10),
  ('secondary-resource', 'Secondary resource', 50, 'EUR', 9, 22, array[1,2,3,4,5], true, 20)
on conflict (slug) do update set price_per_hour = excluded.price_per_hour, open_hour = excluded.open_hour,
  close_hour = excluded.close_hour, duration_options = excluded.duration_options, is_active = true;

insert into public.packages (id, title, price, duration_minutes, is_active)
values ('20000000-0000-0000-0000-000000000001', 'Security test offer', 1000, 120, true);
insert into public.service_options (id, name, is_active)
values ('30000000-0000-0000-0000-000000000001', 'Security test option', true);
insert into public.team (id, name, position, is_active)
values ('40000000-0000-0000-0000-000000000001', 'Security test specialist', 'Specialist', true);

insert into public.promo_codes (
  id, code, description, discount_type, discount_value, minimum_hours, is_active
) values (
  '50000000-0000-0000-0000-000000000001', 'TEST10', 'Ten percent test', 'percent', 10, 2, true
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.service_bookings'::regclass),
  'RLS is enabled on service bookings'
);
select has_table('public', 'service_bookings',
  'canonical service booking table exists');
select has_table(
  'public',
  'bookings',
  'core bookings table exists'
);
select has_column('public', 'service_bookings', 'specialist_id',
  'service bookings reference an optional specialist');
select has_column('public', 'service_bookings', 'service_option_id',
  'service bookings reference an optional service option');
select hasnt_column('public', 'service_bookings', 'photographer_id',
  'service bookings have no photographer-specific field');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.resource_bookings'::regclass),
  'RLS is enabled on resource bookings'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS is enabled on profiles'
);
select has_column('public', 'site_home_content', 'title',
  'home content uses a locale-neutral title');
select hasnt_column('public', 'site_home_content', 'hero_eyebrow_uk',
  'home content has no legacy locale column');
select has_column('public', 'packages', 'duration_label',
  'booking offers expose a locale-neutral duration label');
select has_column('public', 'packages', 'button_label',
  'booking offers expose a locale-neutral button label');
select has_column('public', 'package_addons', 'title',
  'booking add-ons expose a locale-neutral title');
select has_column('public', 'package_addons', 'description',
  'booking add-ons expose a locale-neutral description');
select has_column('public', 'learning_programs', 'title',
  'programs expose a locale-neutral title');
select hasnt_column('public', 'learning_programs', 'title_uk',
  'programs have no legacy locale title');
select has_column('public', 'site_learning_content', 'title',
  'program page exposes a locale-neutral title');
select hasnt_column('public', 'site_learning_content', 'hero_title_top_pl',
  'program page has no paired locale title');
select has_column('public', 'portfolio_categories', 'name',
  'portfolio categories expose one canonical name');
select hasnt_column('public', 'portfolio_categories', 'name_uk',
  'portfolio categories have no legacy locale name');
select has_column('public', 'media_library', 'alt_text',
  'media library exposes one canonical alt text');
select hasnt_column('public', 'media_library', 'alt_pl',
  'media library has no paired locale alt text');
select has_column('public', 'team', 'bio',
  'team members expose one canonical biography');
select hasnt_column('public', 'team', 'bio_uk',
  'team members have no legacy locale biography');
select has_column('public', 'legal_pages', 'title',
  'legal pages expose one canonical title');
select has_column('public', 'legal_pages', 'content',
  'legal pages expose one canonical body');
select hasnt_column('public', 'legal_pages', 'title_pl',
  'legal pages have no paired locale title');
select has_column('public', 'testimonials', 'role',
  'testimonials expose one canonical customer role');
select has_column('public', 'testimonials', 'text',
  'testimonials expose one canonical text');
select hasnt_column('public', 'testimonials', 'role_uk',
  'testimonials have no legacy locale role');
select hasnt_table('public', 'site_photoshoots_content',
  'legacy photoshoot content table is absent');
select lives_ok($sql$
  insert into public.client_galleries (
    booking_kind, booking_reference, client_name, language, pixover_url
  ) values (
    'resource', 'locale-de-test', 'Locale Test', 'de', 'https://example.test/gallery-de'
  )
$sql$, 'client galleries accept a configured language code');
select lives_ok($sql$
  insert into public.client_galleries (
    booking_kind, booking_reference, client_name, language, pixover_url
  ) values (
    'resource', 'locale-pt-br-test', 'Regional Locale Test', 'pt-br', 'https://example.test/gallery-pt-br'
  )
$sql$, 'client galleries accept a lowercase regional language code');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.service_catalog_items'::regclass),
  'RLS is enabled on universal service catalog'
);
select ok(
  not has_table_privilege('anon', 'public.service_catalog_items', 'INSERT'),
  'anonymous role cannot insert catalog items directly'
);
select ok(
  not has_table_privilege('anon', 'public.resource_bookings', 'INSERT'),
  'anonymous role has no direct resource INSERT privilege'
);
select ok(
  not has_table_privilege('anon', 'public.service_bookings', 'INSERT'),
  'anonymous role has no direct service INSERT privilege'
);
select has_table('public', 'bookable_resources',
  'universal bookable resource catalog exists');
select has_table('public', 'resource_page_content',
  'resource storefront content is separate from resource prices');
select has_column('public', 'bookable_resources', 'duration_options',
  'each resource owns its allowed durations');
select ok(
  not has_table_privilege('anon', 'public.bookable_resources', 'INSERT'),
  'anonymous role cannot create bookable resources'
);
select ok(
  public.claim_booking_email_dispatch('service', 'service-test-reference'),
  'neutral service booking kind is accepted for email dispatch'
);
select isnt(
  public.claim_booking_email_dispatch('photoshoot', 'legacy-test-reference'),
  true,
  'legacy photoshoot booking kind is rejected for email dispatch'
);

-- Anonymous visitor: RPC works, PII remains hidden, browser price is ignored.
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select is((select count(*) from public.resource_bookings), 0::bigint,
  'anonymous visitor cannot read resource PII rows');
select is((public.preview_resource_promo(jsonb_build_object(
  'promo_code', 'test10', 'booking_date', current_date + 30,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'duration_hours', 2, 'price_per_hour', 1
  ))
))->>'subtotal')::integer, 400,
  'promo preview calculates subtotal from database prices');
select is((public.preview_resource_promo(jsonb_build_object(
  'promo_code', 'test10', 'booking_date', current_date + 30,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'duration_hours', 2
  ))
))->>'discount')::integer, 40,
  '10 percent promo is calculated correctly');

select lives_ok(format($sql$
  select public.create_public_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'order_id', 'test_public_main',
  'client_name', 'Public Test Client', 'client_phone', '+380000000001',
  'client_email', 'public@example.test', 'language', 'en',
  'booking_date', current_date + 30, 'currency', 'EUR', 'promo_code', 'TEST10',
  'price_per_hour', 1,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '10:00',
    'duration_hours', 2, 'price_per_hour', 1
  ))
)), 'public resource booking can be created only through validated RPC');

reset role;
select is((select sum(total_price) from public.resource_bookings where resource_order_id = 'test_public_main'), 360::bigint,
  'database price and promo determine final resource total');
select is((select sum(discount_amount) from public.resource_bookings where resource_order_id = 'test_public_main'), 40::bigint,
  'discount is stored correctly');
select is((select uses_count from public.promo_codes where code = 'TEST10'), 1,
  'successful public booking increments promo use once');

set local role anon;
select throws_ok(format($sql$
  select public.create_public_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'order_id', 'test_overlap',
  'client_name', 'Overlap Test', 'client_phone', '+380000000002',
  'client_email', 'overlap@example.test', 'booking_date', current_date + 30,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '11:00', 'duration_hours', 1
  ))
)), '23P01', 'booking_conflict',
  'overlapping resource interval is rejected');
select lives_ok(format($sql$
  select public.create_public_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'order_id', 'test_adjacent',
  'client_name', 'Adjacent Test', 'client_phone', '+380000000003',
  'client_email', 'adjacent@example.test', 'booking_date', current_date + 30,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '12:00', 'duration_hours', 1
  ))
)), 'adjacent non-overlapping resource is accepted');
select lives_ok(format($sql$
  select public.create_public_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'order_id', 'test_other_resource',
  'client_name', 'Makeup Test', 'client_phone', '+380000000004',
  'client_email', 'makeup@example.test', 'booking_date', current_date + 30,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'secondary-resource', 'booking_time', '10:00', 'duration_hours', 1
  ))
)), 'different bookable resource may use the same time');
select is((select count(*) from public.resource_bookings), 0::bigint,
  'anonymous visitor still cannot read PII after bookings exist');

-- Client One: profile role is protected; own service booking is visible only to owner.
reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', 'permission denied for table profiles',
  'client cannot promote own profile to admin'
);
select lives_ok(
  $$update public.profiles set name = 'Updated Client One' where id = '10000000-0000-0000-0000-000000000001'$$,
  'client can update an allowed profile field'
);
select throws_ok(format($sql$
  select public.admin_create_manual_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'client_name', 'Forbidden Manual', 'client_phone', '+380000000005',
  'booking_date', current_date + 31,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '10:00', 'duration_hours', 1
  ))
)), '42501', 'admin_required',
  'ordinary authenticated client cannot create manual booking');

select lives_ok(format($sql$
  select public.create_public_service_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'id', '60000000-0000-0000-0000-000000000001',
  'client_name', 'Service Client One', 'client_phone', '+380000000006',
  'client_email', 'service1@example.test', 'language', 'en',
  'package_id', '20000000-0000-0000-0000-000000000001',
  'service_option_id', '30000000-0000-0000-0000-000000000001',
  'specialist_id', '40000000-0000-0000-0000-000000000001',
  'booking_date', current_date + 35, 'booking_time', '10:00',
  'duration_hours', 2, 'total_price', 1, 'selected_addons', jsonb_build_array()
)), 'client can create a validated service booking');
select is((select total_price from public.service_bookings where id = '60000000-0000-0000-0000-000000000001'), 1000,
  'service price is taken from active offer, not browser payload');
select throws_ok(format($sql$
  select public.create_public_service_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'client_name', 'Service Overlap', 'client_phone', '+380000000007',
  'client_email', 'service-overlap@example.test', 'language', 'en',
  'package_id', '20000000-0000-0000-0000-000000000001',
  'service_option_id', '30000000-0000-0000-0000-000000000001',
  'specialist_id', '40000000-0000-0000-0000-000000000001',
  'booking_date', current_date + 35, 'booking_time', '11:00',
  'duration_hours', 1, 'selected_addons', jsonb_build_array()
)), '23P01', 'booking_conflict',
  'overlapping service interval is rejected');
select is((select count(*) from public.service_bookings), 1::bigint,
  'client sees own service booking');

select lives_ok(format($sql$
  select public.create_public_service_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'client_name', 'Service Without Optional Selection', 'client_phone', '+380000000017',
  'client_email', 'service-optional@example.test', 'language', 'en',
  'package_id', '20000000-0000-0000-0000-000000000001',
  'booking_date', current_date + 36, 'booking_time', '10:00',
  'selected_addons', jsonb_build_array()
)), 'service booking works without a service option or specialist');

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select is((select count(*) from public.service_bookings), 0::bigint,
  'second client cannot read first client service booking or contacts');
select is((select count(*) from public.profiles), 1::bigint,
  'second client cannot read other profiles');

-- Admin: manual resource booking, protected PII access and atomic replacement.
reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000099', true);
set local role authenticated;

select lives_ok(format($sql$
  select public.admin_create_manual_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'client_name', 'Manual Resource', 'client_phone', '+380000000008',
  'client_email', 'manual-multi@example.test', 'client_instagram', '@manual_test',
  'booking_date', current_date + 31, 'payment_status', 'paid',
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '10:00', 'duration_hours', 2
  ))
)), 'admin can create a manual resource booking');
select is((select count(*) from public.resource_bookings where client_email = 'manual-multi@example.test'), 1::bigint,
  'manual resource booking creates one protected row');
select is((select sum(total_price) from public.resource_bookings where client_email = 'manual-multi@example.test'), 400::bigint,
  'manual booking total uses the resource database price');
select is((select count(*) from public.resource_bookings), 4::bigint,
  'admin can read all resource booking PII rows');

select lives_ok(format($sql$
  select public.admin_create_manual_resource_booking(%L::jsonb)
$sql$, jsonb_build_object(
  'client_name', 'Manual Replace Test', 'client_phone', '+380000000009',
  'client_email', 'manual-replace@example.test', 'booking_date', current_date + 32,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '10:00', 'duration_hours', 1
  ))
)), 'admin creates booking that will be edited');

select throws_ok(format($sql$
  select public.admin_replace_manual_resource_booking(
    (select resource_order_id from public.resource_bookings where client_email = 'manual-replace@example.test' limit 1),
    %L::jsonb
  )
$sql$, jsonb_build_object(
  'client_name', 'Manual Replace Test', 'client_phone', '+380000000009',
  'client_email', 'manual-replace@example.test', 'booking_date', current_date + 30,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '11:00', 'duration_hours', 1
  ))
)), '23P01', 'booking_conflict',
  'conflicting manual edit is rejected');
select is((select count(*) from public.resource_bookings where client_email = 'manual-replace@example.test'
  and booking_date = current_date + 32 and booking_time = time '10:00'), 1::bigint,
  'failed manual edit preserves original booking atomically');

select lives_ok(format($sql$
  select public.admin_replace_manual_resource_booking(
    (select resource_order_id from public.resource_bookings where client_email = 'manual-replace@example.test' limit 1),
    %L::jsonb
  )
$sql$, jsonb_build_object(
  'client_name', 'Manual Replace Test', 'client_phone', '+380000000009',
  'client_email', 'manual-replace@example.test', 'booking_date', current_date + 32,
  'items', jsonb_build_array(jsonb_build_object(
    'resource_slug', 'main-resource', 'booking_time', '13:00', 'duration_hours', 2
  ))
)), 'non-conflicting manual edit succeeds');
select is((select count(*) from public.resource_bookings where client_email = 'manual-replace@example.test'
  and booking_date = current_date + 32 and booking_time = time '10:00'), 0::bigint,
  'successful manual edit removes old interval');
select is((select count(*) from public.resource_bookings where client_email = 'manual-replace@example.test'
  and booking_date = current_date + 32 and booking_time = time '13:00'
  and duration_hours = 2), 1::bigint,
  'successful manual edit creates the new interval');

select * from finish();
rollback;
