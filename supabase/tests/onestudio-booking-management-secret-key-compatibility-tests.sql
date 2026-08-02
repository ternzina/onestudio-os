begin;

select plan(12);

select ok(
  has_function_privilege(
    'service_role',
    'public.get_public_booking_management_context(uuid)',
    'EXECUTE'
  ),
  'service_role can call booking management context'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.get_public_booking_management_context(uuid)',
    'EXECUTE'
  ),
  'anon cannot call booking management context'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.get_public_booking_management_context(uuid)',
    'EXECUTE'
  ),
  'authenticated cannot call booking management context'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.get_public_booking_management_slots(uuid, date)',
    'EXECUTE'
  ),
  'service_role can call booking management slots'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.get_public_booking_management_slots(uuid, date)',
    'EXECUTE'
  ),
  'anon cannot call booking management slots'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.get_public_booking_management_slots(uuid, date)',
    'EXECUTE'
  ),
  'authenticated cannot call booking management slots'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.reschedule_public_booking(uuid, timestamptz)',
    'EXECUTE'
  ),
  'service_role can reschedule through a valid token'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.reschedule_public_booking(uuid, timestamptz)',
    'EXECUTE'
  ),
  'anon cannot call reschedule RPC'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.cancel_public_booking(uuid, text)',
    'EXECUTE'
  ),
  'service_role can cancel through a valid token'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.cancel_public_booking(uuid, text)',
    'EXECUTE'
  ),
  'authenticated cannot call cancellation RPC'
);

select set_config('request.jwt.claim.role', '', true);
set local role service_role;

select throws_ok(
  $sql$
    select public.get_public_booking_management_context(
      '00000000-0000-4000-8000-000000000099'::uuid
    )
  $sql$,
  'P0002',
  'booking_management_link_not_found',
  'opaque secret-key style calls are accepted and proceed to token validation'
);

select is(
  public.is_public_booking_management_service(),
  true,
  'service-only compatibility sentinel does not depend on JWT claims'
);

reset role;

select * from finish();
rollback;
