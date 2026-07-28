-- OneStudio OS Self-service Workspace 1.0 hotfix
-- Keeps the applied migration immutable while fixing its RPC conflict targets
-- and allowing authenticated members to read only their own site locales.

do $$
declare
  v_original text;
  v_fixed text;
begin
  select pg_get_functiondef(
    'public.create_configured_workspace(jsonb)'::regprocedure
  )
  into v_original;

  v_fixed := replace(
    v_original,
    'on conflict (business_id) do update',
    'on conflict on constraint business_launch_profiles_pkey do update'
  );
  v_fixed := replace(
    v_fixed,
    'on conflict (business_id, locale) do update',
    'on conflict on constraint public_site_locales_pkey do update'
  );

  if v_fixed = v_original then
    raise exception 'create_configured_workspace hotfix target not found';
  end if;

  execute v_fixed;
end;
$$;

revoke all on table public.public_site_locales
  from public, anon, authenticated;
grant select on table public.public_site_locales
  to authenticated;
grant all on table public.public_site_locales
  to service_role;

drop policy if exists public_site_locales_member_select
  on public.public_site_locales;
create policy public_site_locales_member_select
on public.public_site_locales
for select
to authenticated
using (public.can_view_business(business_id));

revoke all on function public.create_configured_workspace(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_configured_workspace(jsonb)
  to authenticated, service_role;
