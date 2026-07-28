-- OneStudio OS Client Launch 1.0 hotfix
-- Removes a PL/pgSQL name collision between the launch RPC output field
-- `business_id` and the company_profiles primary-key conflict target.

do $migration$
declare
  v_signature constant regprocedure :=
    'public.launch_first_workspace(jsonb)'::regprocedure;
  v_definition text;
  v_fixed_definition text;
begin
  select pg_get_functiondef(v_signature)
  into v_definition;

  if position(
    'on conflict on constraint company_profiles_pkey do update'
    in v_definition
  ) > 0 then
    return;
  end if;

  v_fixed_definition := replace(
    v_definition,
    'on conflict (business_id) do update',
    'on conflict on constraint company_profiles_pkey do update'
  );

  if v_fixed_definition = v_definition then
    raise exception
      'client_launch_business_id_fix: expected conflict target was not found';
  end if;

  execute v_fixed_definition;
end;
$migration$;

revoke all on function public.launch_first_workspace(jsonb)
  from public, anon, authenticated;
grant execute on function public.launch_first_workspace(jsonb)
  to authenticated, service_role;

comment on function public.launch_first_workspace(jsonb) is
  'Atomically creates the first client-ready workspace, company profile, offer, resource, weekly availability and module selection.';
