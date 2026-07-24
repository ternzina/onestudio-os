\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(84);

select has_table('public', 'booking_events', 'booking event history table exists');
select has_column('public', 'bookings', 'cancelled_at', 'bookings record cancellation time');
select has_column('public', 'bookings', 'cancelled_by', 'bookings record cancellation actor');
select has_column('public', 'bookings', 'cancellation_reason', 'bookings record cancellation reason');
select has_column('public', 'booking_events', 'changes', 'booking events keep structured changes');
select has_function('public', 'create_admin_booking', array['uuid','uuid','timestamp with time zone','integer','integer','text','text','text','text','text','text','text'], 'admin booking creation RPC exists');
select has_function('public', 'update_admin_booking', array['uuid','uuid','timestamp with time zone','integer','integer','text','text','text','text','text','text'], 'admin booking update RPC exists');
select has_function('public', 'set_admin_booking_status', array['uuid','text','text'], 'booking status transition RPC exists');
select has_function('public', 'cancel_admin_booking', array['uuid','text'], 'booking cancellation RPC exists');
select has_function('public', 'get_admin_service_available_slots', array['uuid','uuid','date','integer','integer','uuid'], 'admin slot query exists');
select has_function('public', 'lock_booking_resource_scope', array['uuid','uuid','uuid'], 'booking resource serialization helper exists');
select has_function('public', 'assert_active_booking_allocations', array[]::text[], 'active booking allocation invariant exists');
select has_trigger('public', 'bookings', 'bookings_active_allocations_guard', 'active bookings are guarded by a deferred allocation constraint');
select ok(exists(
  select 1
  from pg_constraint
  where conrelid = 'public.booking_allocations'::regclass
    and conname = 'booking_allocations_no_overlap'
    and contype = 'x'
), 'resource allocations retain their overlap exclusion constraint');
select ok(not has_function_privilege(
  'authenticated',
  'public.lock_booking_resource_scope(uuid,uuid,uuid)',
  'EXECUTE'
), 'operators cannot call the internal resource lock directly');
select has_trigger('public', 'bookings', 'bookings_audit_change', 'booking audit trigger exists');
select ok((select relrowsecurity from pg_class where oid = 'public.booking_events'::regclass), 'RLS is enabled on booking events');
select ok(not has_table_privilege('anon', 'public.booking_events', 'SELECT'), 'anonymous visitors cannot read booking history');
select ok(not has_table_privilege('authenticated', 'public.bookings', 'INSERT'), 'authenticated operators cannot bypass guarded booking creation');
select ok(not has_table_privilege('authenticated', 'public.bookings', 'UPDATE'), 'authenticated operators cannot bypass guarded booking updates');
select ok(not has_table_privilege('authenticated', 'public.bookings', 'DELETE'), 'authenticated operators cannot delete booking history');
select ok(not has_table_privilege('authenticated', 'public.booking_allocations', 'INSERT'), 'authenticated operators cannot reserve resources directly');
select ok(not has_table_privilege('authenticated', 'public.booking_allocations', 'UPDATE'), 'authenticated operators cannot alter allocations directly');
select ok(not has_table_privilege('authenticated', 'public.booking_allocations', 'DELETE'), 'authenticated operators cannot directly delete allocations');
select ok(has_function_privilege('authenticated', 'public.create_admin_booking(uuid,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,text,text)', 'EXECUTE'), 'authenticated operators may call guarded booking creation');
select ok(not has_function_privilege('anon', 'public.create_admin_booking(uuid,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,text,text)', 'EXECUTE'), 'anonymous visitors cannot create admin bookings');
select ok(has_function_privilege('authenticated', 'public.get_admin_service_available_slots(uuid,uuid,date,integer,integer,uuid)', 'EXECUTE'), 'authenticated operators may request edit-safe slots');
select ok(not has_function_privilege('anon', 'public.get_admin_service_available_slots(uuid,uuid,date,integer,integer,uuid)', 'EXECUTE'), 'anonymous visitors cannot request administrative slots');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='booking_events_booking_created_idx'), 'booking event history index exists');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='bookings_business_status_start_idx'), 'booking status calendar index exists');

insert into auth.users (id, email) values
  ('61000000-0000-4000-8000-000000000001', 'booking.manager@example.test'),
  ('61000000-0000-4000-8000-000000000002', 'booking.staff@example.test'),
  ('61000000-0000-4000-8000-000000000003', 'booking.viewer@example.test'),
  ('61000000-0000-4000-8000-000000000004', 'booking.outsider@example.test');

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency) values
  ('62000000-0000-4000-8000-000000000001', 'booking-alpha', 'Booking Alpha', 'UTC', 'en', 'EUR'),
  ('62000000-0000-4000-8000-000000000002', 'booking-beta', 'Booking Beta', 'UTC', 'en', 'EUR');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('62000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001', 'manager', true),
  ('62000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000002', 'staff', true),
  ('62000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000003', 'viewer', true);

insert into public.services (
  id, business_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes,
  buffer_before_minutes, buffer_after_minutes, capacity, is_public, is_active
) values
  ('63000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001', 'fixed-session', 'appointment', 'Fixed session', 'fixed', 5000, 'EUR', 60, 120, 30, 0, 0, 6, true, true),
  ('63000000-0000-4000-8000-000000000002', '62000000-0000-4000-8000-000000000001', 'hourly-session', 'rental', 'Hourly session', 'per_hour', 6000, 'EUR', 60, 180, 30, 0, 0, 6, true, true),
  ('63000000-0000-4000-8000-000000000003', '62000000-0000-4000-8000-000000000001', 'person-session', 'class', 'Person session', 'per_person', 2500, 'EUR', 60, 60, 30, 0, 0, 10, true, true),
  ('63000000-0000-4000-8000-000000000004', '62000000-0000-4000-8000-000000000001', 'free-session', 'appointment', 'Free session', 'free', null, 'EUR', 60, 60, 30, 0, 0, 2, true, true),
  ('63000000-0000-4000-8000-000000000005', '62000000-0000-4000-8000-000000000002', 'beta-session', 'appointment', 'Beta session', 'fixed', 5000, 'EUR', 60, 60, 30, 0, 0, 2, true, true);

insert into public.resources (
  id, business_id, slug, kind, name, capacity, timezone, is_bookable, is_public, is_active
) values
  ('64000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001', 'main-room', 'space', 'Main room', 10, 'UTC', true, true, true),
  ('64000000-0000-4000-8000-000000000002', '62000000-0000-4000-8000-000000000002', 'beta-room', 'space', 'Beta room', 10, 'UTC', true, true, true);

insert into public.service_resources (business_id, service_id, resource_id, allocation_mode) values
  ('62000000-0000-4000-8000-000000000001', '63000000-0000-4000-8000-000000000001', '64000000-0000-4000-8000-000000000001', 'required'),
  ('62000000-0000-4000-8000-000000000001', '63000000-0000-4000-8000-000000000002', '64000000-0000-4000-8000-000000000001', 'required'),
  ('62000000-0000-4000-8000-000000000001', '63000000-0000-4000-8000-000000000003', '64000000-0000-4000-8000-000000000001', 'required'),
  ('62000000-0000-4000-8000-000000000001', '63000000-0000-4000-8000-000000000004', '64000000-0000-4000-8000-000000000001', 'required'),
  ('62000000-0000-4000-8000-000000000002', '63000000-0000-4000-8000-000000000005', '64000000-0000-4000-8000-000000000002', 'required');

update public.business_availability_settings
set minimum_notice_minutes = 0, booking_horizon_days = 30, slot_interval_minutes = 30
where business_id in ('62000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000002');

insert into public.availability_rules (business_id, resource_id, day_of_week, start_time, end_time) values
  ('62000000-0000-4000-8000-000000000001', '64000000-0000-4000-8000-000000000001', extract(dow from current_date + 1)::smallint, '09:00', '17:00'),
  ('62000000-0000-4000-8000-000000000002', '64000000-0000-4000-8000-000000000002', extract(dow from current_date + 1)::smallint, '09:00', '17:00');

select is((select enabled from public.business_modules where business_id='62000000-0000-4000-8000-000000000001' and module_key='scheduling'), true, 'new workspaces enable scheduling with booking core');
select is((select version from public.business_modules where business_id='62000000-0000-4000-8000-000000000001' and module_key='scheduling'), '1.3.0', 'scheduling records booking calendar version');
select is((select enabled from public.business_modules where business_id='62000000-0000-4000-8000-000000000001' and module_key='crm'), true, 'new workspaces enable booking client records');
select is((select version from public.business_modules where business_id='62000000-0000-4000-8000-000000000001' and module_key='crm'), '1.1.0', 'CRM records Clients CRM version');
select is(public.calculate_booking_subtotal('63000000-0000-4000-8000-000000000001', 60, 1), 5000, 'fixed price is copied to the booking');
select is(public.calculate_booking_subtotal('63000000-0000-4000-8000-000000000002', 90, 1), 9000, 'hourly price follows booking duration');
select is(public.calculate_booking_subtotal('63000000-0000-4000-8000-000000000003', 60, 3), 7500, 'per-person price follows party size');
select is(public.calculate_booking_subtotal('63000000-0000-4000-8000-000000000004', 60, 1), 0, 'free services produce a zero subtotal');

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($sql$
  select public.create_admin_booking(
    '62000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    60, 2, 'Anna Client', 'ANNA@EXAMPLE.TEST', '+380000000001', 'en', 'confirmed', 'Window seat', 'First booking'
  )
$sql$, 'manager can create a conflict-safe booking');
select is((select count(*) from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 1::bigint, 'one canonical booking is stored');
select is((select count(*) from public.clients where business_id='62000000-0000-4000-8000-000000000001'), 1::bigint, 'booking creation creates a CRM client');
select is((select email from public.clients where business_id='62000000-0000-4000-8000-000000000001'), 'anna@example.test', 'client email is normalized');
select is((select total_minor from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 5000, 'booking stores a price snapshot');
select is((select source from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 'admin', 'manual bookings record their source');
select is((select count(*) from public.booking_allocations where business_id='62000000-0000-4000-8000-000000000001'), 1::bigint, 'required resource is allocated');
select is((select status from public.booking_allocations where business_id='62000000-0000-4000-8000-000000000001'), 'confirmed', 'confirmed booking creates confirmed allocation');
select is((select count(*) from public.booking_events where business_id='62000000-0000-4000-8000-000000000001' and event_type='created'), 1::bigint, 'booking creation is audited');
select is((select actor_user_id from public.booking_events where business_id='62000000-0000-4000-8000-000000000001' and event_type='created'), '61000000-0000-4000-8000-000000000001'::uuid, 'booking audit records the operator');
select ok(not public.service_slot_is_available('62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',((current_date + 1 + time '09:00') at time zone 'UTC'),60,1,null), 'created booking removes its slot from availability');
select throws_ok($sql$
  select public.create_admin_booking(
    '62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),60,1,'Conflict Client','conflict@example.test',null,'en','confirmed','',''
  )
$sql$, 'P0001', 'booking_slot_unavailable', 'booking creation rejects an occupied slot');
select lives_ok($sql$
  select public.create_admin_booking(
    '62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '10:00') at time zone 'UTC'),60,1,'Anna Updated','anna@example.test','+380000000002','en','pending','','Second booking'
  )
$sql$, 'same email may create another booking without duplicating the client');
select is((select count(*) from public.clients where business_id='62000000-0000-4000-8000-000000000001'), 1::bigint, 'same workspace email reuses the client');
select is((select name from public.clients where business_id='62000000-0000-4000-8000-000000000001'), 'Anna Updated', 'reused client details are refreshed');
select is((select count(*) from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 2::bigint, 'second booking is stored');

select lives_ok($sql$
  select public.update_admin_booking(
    (select id from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '10:00') at time zone 'UTC')),
    '63000000-0000-4000-8000-000000000002',
    ((current_date + 1 + time '11:00') at time zone 'UTC'),
    90,1,'Anna Updated','anna@example.test','+380000000002','en','','Moved to hourly service'
  )
$sql$, 'manager can reschedule and change an active booking');
select is((select total_minor from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')), 9000, 'booking update recalculates price');
select is((select ends_at from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')), ((current_date + 1 + time '12:30') at time zone 'UTC'), 'booking update stores the new duration');
select is((select allocation.starts_at from public.booking_allocations allocation join public.bookings booking on booking.id=allocation.booking_id where booking.starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')), ((current_date + 1 + time '11:00') at time zone 'UTC'), 'booking update replaces allocation window');
select ok((select count(*) from public.booking_events where business_id='62000000-0000-4000-8000-000000000001' and event_type='updated') >= 1, 'booking update is audited');
select throws_ok($sql$
  select public.update_admin_booking(
    (select id from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')),
    '63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '09:00') at time zone 'UTC'),
    60,1,'Anna Updated','anna@example.test',null,'en','',''
  )
$sql$, 'P0001', 'booking_slot_unavailable', 'booking update rejects another booking conflict');
select is((select count(*) from public.get_admin_service_available_slots('62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000002',current_date+1,90,1,(select id from public.bookings where starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')))), 12::bigint, 'edit-safe slot query ignores the current booking allocation');

select lives_ok($sql$
  select public.set_admin_booking_status(
    (select id from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')),
    'confirmed',''
  )
$sql$, 'pending booking can be confirmed');
select is((select status from public.bookings where starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')), 'confirmed', 'confirmed transition is stored');
select lives_ok($sql$
  select public.set_admin_booking_status(
    (select id from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')),
    'completed',''
  )
$sql$, 'confirmed booking can be completed');
select is((select allocation.status from public.booking_allocations allocation join public.bookings booking on booking.id=allocation.booking_id where booking.starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')), 'released', 'completed booking releases its resource');
select throws_ok($sql$
  select public.set_admin_booking_status(
    (select id from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '11:00') at time zone 'UTC')),
    'confirmed',''
  )
$sql$, '22023', 'invalid_booking_status_transition', 'final booking cannot be reopened');

select lives_ok($sql$
  select public.cancel_admin_booking(
    (select id from public.bookings where business_id='62000000-0000-4000-8000-000000000001' and starts_at=((current_date + 1 + time '09:00') at time zone 'UTC')),
    'Client asked to cancel'
  )
$sql$, 'confirmed booking can be cancelled');
select is((select status from public.bookings where starts_at=((current_date + 1 + time '09:00') at time zone 'UTC')), 'cancelled', 'cancelled status is stored');
select is((select cancellation_reason from public.bookings where starts_at=((current_date + 1 + time '09:00') at time zone 'UTC')), 'Client asked to cancel', 'cancellation reason is preserved');
select ok((select cancelled_at is not null from public.bookings where starts_at=((current_date + 1 + time '09:00') at time zone 'UTC')), 'cancellation time is preserved');
select is((select cancelled_by from public.bookings where starts_at=((current_date + 1 + time '09:00') at time zone 'UTC')), '61000000-0000-4000-8000-000000000001'::uuid, 'cancellation actor is preserved');
select is((select allocation.status from public.booking_allocations allocation join public.bookings booking on booking.id=allocation.booking_id where booking.starts_at=((current_date + 1 + time '09:00') at time zone 'UTC')), 'released', 'cancelled booking releases its allocation');
select is((select count(*) from public.booking_events where business_id='62000000-0000-4000-8000-000000000001' and event_type='cancelled'), 1::bigint, 'cancellation is audited');

select throws_ok($sql$
  insert into public.booking_events (business_id,booking_id,event_type)
  values ('62000000-0000-4000-8000-000000000001',(select id from public.bookings limit 1),'updated')
$sql$, '42501', null, 'operators cannot forge booking history');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select lives_ok($sql$
  select public.create_admin_booking(
    '62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '13:00') at time zone 'UTC'),60,1,'Staff Client','staff.client@example.test',null,'en','confirmed','',''
  )
$sql$, 'staff can create a booking');
select is((select count(*) from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 3::bigint, 'staff booking is visible in the workspace');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 3::bigint, 'viewer can read workspace bookings');
select ok((select count(*) from public.booking_events where business_id='62000000-0000-4000-8000-000000000001') >= 7, 'viewer can read booking history');
select throws_ok($sql$
  select public.create_admin_booking(
    '62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '14:00') at time zone 'UTC'),60,1,'Viewer Client',null,null,'en','confirmed','',''
  )
$sql$, '42501', 'booking_operation_forbidden', 'viewer cannot create bookings');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.bookings where business_id='62000000-0000-4000-8000-000000000001'), 0::bigint, 'outsider cannot read workspace bookings');
select is((select count(*) from public.booking_events where business_id='62000000-0000-4000-8000-000000000001'), 0::bigint, 'outsider cannot read booking history');
select throws_ok($sql$
  select public.create_admin_booking(
    '62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',
    ((current_date + 1 + time '14:00') at time zone 'UTC'),60,1,'Outsider Client',null,null,'en','confirmed','',''
  )
$sql$, '42501', 'booking_operation_forbidden', 'outsider cannot create workspace bookings');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok($sql$ select * from public.booking_events $sql$, '42501', null, 'anonymous visitors cannot inspect booking history');
select throws_ok($sql$
  select public.get_admin_service_available_slots('62000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',current_date+1,60,1,null)
$sql$, '42501', null, 'anonymous visitors cannot call the admin slot API');

select * from finish();
rollback;
