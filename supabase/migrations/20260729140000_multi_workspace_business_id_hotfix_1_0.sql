-- OneStudio OS Multi-workspace business_id hotfix 1.0
-- Qualifies two columns that collide with the RPC's business_id output field.

do $$
declare
  v_original text;
  v_fixed text;
begin
  select pg_get_functiondef(
    'public.create_configured_workspace(jsonb)'::regprocedure
  )
  into v_original;

  if strpos(
    v_original,
    'update public.public_site_locales
  set published_content = draft_content,
      published_at = now(),
      updated_at = now()
  where business_id = v_business_id'
  ) = 0 then
    raise exception 'public_site_locales business_id hotfix target not found';
  end if;

  if strpos(
    v_original,
    'update public.public_site_settings
  set is_published = true,
      published_at = now(),
      updated_at = now()
  where business_id = v_business_id'
  ) = 0 then
    raise exception 'public_site_settings business_id hotfix target not found';
  end if;

  v_fixed := replace(
    v_original,
    'update public.public_site_locales
  set published_content = draft_content,
      published_at = now(),
      updated_at = now()
  where business_id = v_business_id',
    'update public.public_site_locales as site_locale
  set published_content = site_locale.draft_content,
      published_at = now(),
      updated_at = now()
  where site_locale.business_id = v_business_id'
  );

  v_fixed := replace(
    v_fixed,
    'update public.public_site_settings
  set is_published = true,
      published_at = now(),
      updated_at = now()
  where business_id = v_business_id',
    'update public.public_site_settings as site_setting
  set is_published = true,
      published_at = now(),
      updated_at = now()
  where site_setting.business_id = v_business_id'
  );

  execute v_fixed;
end;
$$;

revoke all on function public.create_configured_workspace(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_configured_workspace(jsonb)
  to authenticated, service_role;
