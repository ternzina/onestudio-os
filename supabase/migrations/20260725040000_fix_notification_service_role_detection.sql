create or replace function public.is_notification_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() ->> 'role',
    current_setting('request.jwt.claim.role', true),
    ''
  ) = 'service_role';
$$;

revoke all on function public.is_notification_service_role()
from public, anon, authenticated;

grant execute on function public.is_notification_service_role()
to service_role;
