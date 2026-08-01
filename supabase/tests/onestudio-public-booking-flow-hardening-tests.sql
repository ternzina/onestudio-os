\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

select ok(
  not has_function_privilege(
    'anon',
    'public.create_public_booking(text,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,uuid)',
    'EXECUTE'
  ),
  'anonymous visitors cannot bypass the server-side booking gateway'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.create_public_booking(text,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,uuid)',
    'EXECUTE'
  ),
  'authenticated visitors also use the booking gateway'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.create_public_booking(text,uuid,timestamp with time zone,integer,integer,text,text,text,text,text,uuid)',
    'EXECUTE'
  ),
  'service role may create bookings through the gateway'
);

select ok(
  has_function_privilege(
    'anon',
    'public.get_public_booking_context(text)',
    'EXECUTE'
  ),
  'public booking context stays readable'
);

select ok(
  has_function_privilege(
    'anon',
    'public.get_service_available_slots(uuid,uuid,date,integer,integer)',
    'EXECUTE'
  ),
  'calculated public slots stay readable'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.claim_booking_email_rate_limit(text,integer,integer)',
    'EXECUTE'
  ),
  'service role may claim persistent booking rate limits'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.claim_booking_email_rate_limit(text,integer,integer)',
    'EXECUTE'
  ),
  'anonymous visitors cannot manipulate rate limits'
);

select ok(
  not exists (
    select 1
    from public.business_modules module
    where module.module_key = 'scheduling'
      and coalesce((module.config->>'direct_anonymous_booking_writes')::boolean, true)
  ),
  'scheduling modules record that anonymous writes are disabled'
);

select ok(
  not exists (
    select 1
    from public.business_modules module
    where module.module_key = 'scheduling'
      and coalesce((module.config->>'public_booking_gateway')::boolean, false) = false
  ),
  'scheduling modules advertise the protected booking gateway'
);

select * from finish();
rollback;
