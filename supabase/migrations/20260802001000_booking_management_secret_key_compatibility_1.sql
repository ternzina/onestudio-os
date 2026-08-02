-- OneStudio OS Booking Management Secret-Key Compatibility 1.0
-- Supabase sb_secret_* keys are opaque and do not populate
-- request.jwt.claim.role. Authorization for these server-only RPCs is
-- therefore enforced by PostgreSQL EXECUTE grants to service_role.

create or replace function public.is_public_booking_management_service()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select true;
$$;

revoke all on function public.is_public_booking_management_service()
  from public, anon, authenticated;
grant execute on function public.is_public_booking_management_service()
  to service_role;

-- Reassert the real authorization boundary for every customer-management RPC.
revoke all on function public.ensure_public_booking_management_link(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.get_public_booking_management_context(uuid)
  from public, anon, authenticated;
revoke all on function public.get_public_booking_management_slots(uuid, date)
  from public, anon, authenticated;
revoke all on function public.reschedule_public_booking(uuid, timestamptz)
  from public, anon, authenticated;
revoke all on function public.cancel_public_booking(uuid, text)
  from public, anon, authenticated;

grant execute on function public.ensure_public_booking_management_link(uuid, uuid, text)
  to service_role;
grant execute on function public.get_public_booking_management_context(uuid)
  to service_role;
grant execute on function public.get_public_booking_management_slots(uuid, date)
  to service_role;
grant execute on function public.reschedule_public_booking(uuid, timestamptz)
  to service_role;
grant execute on function public.cancel_public_booking(uuid, text)
  to service_role;

comment on function public.is_public_booking_management_service() is
  'Compatibility sentinel for opaque Supabase secret keys. Access is enforced by EXECUTE grants to service_role, not JWT claim inspection.';
