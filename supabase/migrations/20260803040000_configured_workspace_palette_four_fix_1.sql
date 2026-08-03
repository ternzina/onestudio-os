-- OneStudio OS Configured Workspace Palette Four Fix 1
-- The configurator has four palettes (0..3), but workspace creation still
-- rejected palette index 3 after Bordeaux was added.

do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.create_configured_workspace(jsonb)'::regprocedure
  )
  into v_definition;

  if position('v_palette not between 0 and 3' in v_definition) > 0 then
    return;
  end if;

  if position('v_palette not between 0 and 2' in v_definition) = 0 then
    raise exception 'create_configured_workspace_palette_guard_not_found';
  end if;

  execute replace(
    v_definition,
    'v_palette not between 0 and 2',
    'v_palette not between 0 and 3'
  );
end;
$$;

revoke all on function public.create_configured_workspace(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_configured_workspace(jsonb)
  to authenticated, service_role;
