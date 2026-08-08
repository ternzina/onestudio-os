-- OneStudio OS
-- Premium Template Editor Runtime 1.0.
-- Preserve a bounded, generic per-template content namespace inside the existing
-- draft/published JSON lifecycle. Publishing remains exclusively explicit.

create or replace function public.normalize_public_site_template_content(p_value jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_key text;
  v_item jsonb;
begin
  if jsonb_typeof(p_value) <> 'object' then return v_result; end if;
  for v_key, v_item in select key, value from jsonb_each(p_value) loop
    if v_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'
      and jsonb_typeof(v_item) = 'object'
      and octet_length(v_item::text) <= 131072 then
      v_result := v_result || jsonb_build_object(v_key, v_item);
    end if;
  end loop;
  return v_result;
end;
$$;

alter function public.save_public_site_draft(uuid, text, jsonb, boolean)
  rename to save_public_site_draft_v263;

create function public.save_public_site_draft(
  p_business_id uuid,
  p_locale text,
  p_content jsonb,
  p_make_primary boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locale text := lower(trim(coalesce(p_locale, '')));
  v_previous jsonb := '{}'::jsonb;
  v_template_content jsonb := '{}'::jsonb;
  v_saved jsonb;
begin
  -- Compatibility contract: save_public_site_draft_v263 delegates the complete
  -- Site Editor 2.6 payload to save_public_site_draft_v22, including
  -- section_colors, system_section_settings, design_system and layout_order.
  select coalesce(locale_row.draft_content, locale_row.published_content, '{}'::jsonb)
    into v_previous
  from public.public_site_locales locale_row
  where locale_row.business_id = p_business_id and locale_row.locale = v_locale
  limit 1;

  v_saved := public.save_public_site_draft_v263(
    p_business_id, p_locale, p_content, p_make_primary
  );

  v_template_content := public.normalize_public_site_template_content(
    case
      when jsonb_typeof(p_content->'template_content') = 'object' then p_content->'template_content'
      when jsonb_typeof(v_previous->'template_content') = 'object' then v_previous->'template_content'
      else '{}'::jsonb
    end
  );

  if v_template_content <> '{}'::jsonb then
    v_saved := coalesce(v_saved, '{}'::jsonb)
      || jsonb_build_object('template_content', v_template_content);
  end if;

  update public.public_site_locales
  set draft_content = v_saved, updated_at = now()
  where business_id = p_business_id and locale = v_locale;

  if not found then
    raise exception 'public_site_locale_not_found' using errcode = '23503';
  end if;
  return v_saved;
end;
$$;

revoke all on function public.normalize_public_site_template_content(jsonb) from public, anon, authenticated;
revoke all on function public.save_public_site_draft_v263(uuid, text, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean) to authenticated;

comment on function public.normalize_public_site_template_content(jsonb) is
  'Bounds and validates generic per-template content stored in public-site draft JSON.';
comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Site Editor 2.6 save pipeline with generic template content preservation for template-aware editors.';
