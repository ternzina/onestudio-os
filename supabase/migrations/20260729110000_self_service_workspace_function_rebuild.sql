-- OneStudio OS Self-service Workspace 1.0 function rebuild
-- Replaces the RPC as a complete definition so output-column names cannot
-- conflict with identically named table columns.

create or replace function public.create_configured_workspace(p_configuration jsonb)
returns table (business_id uuid, business_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_business_id uuid := gen_random_uuid();
  v_name text := btrim(coalesce(p_configuration ->> 'business_name', ''));
  v_demo_slug text := lower(btrim(coalesce(p_configuration ->> 'demo_slug', '')));
  v_tagline text := btrim(coalesce(p_configuration ->> 'tagline', ''));
  v_currency text := upper(btrim(coalesce(p_configuration ->> 'currency', 'EUR')));
  v_palette integer := coalesce((p_configuration ->> 'palette_index')::integer, 0);
  v_locales text[];
  v_modules text[];
  v_slug text;
  v_default_locale text;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_configuration, '{}'::jsonb)) <> 'object' then
    raise exception 'configuration_invalid' using errcode = '22023';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'workspace_name_invalid' using errcode = '22023';
  end if;
  if v_demo_slug not in (
    'frame-house', 'lumiere', 'north-flow', 'bloom-room',
    'little-orbit', 'black-ink', 'vow-films', 'paw-club'
  ) then
    raise exception 'demo_invalid' using errcode = '22023';
  end if;
  if char_length(v_tagline) > 160 or v_palette not between 0 and 2 then
    raise exception 'design_configuration_invalid' using errcode = '22023';
  end if;
  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'workspace_currency_invalid' using errcode = '22023';
  end if;
  if exists (
    select 1
    from public.business_members as existing_member
    where existing_member.user_id = v_user_id
      and existing_member.is_active
  ) then
    raise exception 'account_already_has_workspace' using errcode = '23505';
  end if;

  select coalesce(
    array_agg(distinct requested_locale.locale order by requested_locale.locale),
    array['en']::text[]
  )
  into v_locales
  from jsonb_array_elements_text(
    coalesce(p_configuration -> 'locales', '["en"]'::jsonb)
  ) as requested_locale(locale)
  where requested_locale.locale in ('ru', 'en', 'uk', 'pl');

  if cardinality(v_locales) = 0 then
    v_locales := array['en']::text[];
  end if;
  v_default_locale := v_locales[1];

  select coalesce(
    array_agg(distinct requested_module.module_key order by requested_module.module_key),
    array['core']::text[]
  )
  into v_modules
  from jsonb_array_elements_text(
    coalesce(p_configuration -> 'enabled_modules', '["core"]'::jsonb)
  ) as requested_module(module_key)
  where requested_module.module_key in (
    'core', 'media', 'portfolio', 'catalog', 'scheduling',
    'crm', 'payments', 'notifications', 'documents', 'analytics'
  );

  v_modules := array(
    select distinct expanded_module.module_key
    from unnest(
      array['core', 'catalog', 'crm']::text[] || v_modules
      || case
        when 'portfolio' = any(v_modules) then array['media']::text[]
        else '{}'::text[]
      end
      || case
        when 'notifications' = any(v_modules) then array['payments']::text[]
        else '{}'::text[]
      end
      || case
        when 'documents' = any(v_modules) then array['payments', 'notifications']::text[]
        else '{}'::text[]
      end
    ) as expanded_module(module_key)
    order by expanded_module.module_key
  );

  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := v_demo_slug;
  end if;
  v_slug := left(v_slug, 42) || '-' ||
    substr(replace(v_business_id::text, '-', ''), 1, 8);

  insert into public.businesses (
    id, slug, name, timezone, default_locale, default_currency, status
  ) values (
    v_business_id, v_slug, v_name, 'Europe/Kyiv',
    v_default_locale, v_currency, 'active'
  );

  insert into public.business_members (
    business_id, user_id, role, is_active, is_default
  ) values (
    v_business_id, v_user_id, 'owner', true, true
  );

  update public.business_modules as workspace_module
  set enabled = workspace_module.module_key = any(v_modules),
      version = case
        when workspace_module.module_key = any(v_modules) then '1.0.0'
        else workspace_module.version
      end,
      updated_at = now()
  where workspace_module.business_id = v_business_id;

  insert into public.business_launch_profiles (
    business_id, business_type, enabled_modules, completed_at, completed_by,
    demo_slug, tagline, palette_index, locales
  ) values (
    v_business_id,
    case
      when v_demo_slug = 'frame-house' then 'photo_studio'
      when v_demo_slug in ('lumiere', 'black-ink', 'paw-club') then 'beauty_salon'
      when v_demo_slug in ('north-flow', 'little-orbit') then 'school'
      when v_demo_slug in ('bloom-room', 'vow-films') then 'creative_service'
      else 'other'
    end,
    v_modules, now(), v_user_id, v_demo_slug, v_tagline, v_palette, v_locales
  )
  on conflict on constraint business_launch_profiles_pkey do update
  set enabled_modules = excluded.enabled_modules,
      completed_at = excluded.completed_at,
      completed_by = excluded.completed_by,
      demo_slug = excluded.demo_slug,
      tagline = excluded.tagline,
      palette_index = excluded.palette_index,
      locales = excluded.locales,
      updated_at = now();

  insert into public.public_site_locales (
    business_id, locale, draft_content
  )
  select
    v_business_id,
    configured_locale.locale,
    jsonb_build_object(
      'brandName', v_name,
      'heroTitle', coalesce(nullif(v_tagline, ''), v_name),
      'demoSlug', v_demo_slug,
      'paletteIndex', v_palette
    )
  from unnest(v_locales) as configured_locale(locale)
  on conflict on constraint public_site_locales_pkey do update
  set draft_content = excluded.draft_content,
      updated_at = now();

  return query
  select v_business_id, v_slug;
end;
$$;

revoke all on function public.create_configured_workspace(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_configured_workspace(jsonb)
  to authenticated, service_role;

