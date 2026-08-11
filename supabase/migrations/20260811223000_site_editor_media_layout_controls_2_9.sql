-- OneStudio OS
-- Site Editor Media & Layout Controls 2.9.
-- Adds a canonical, bounded media-layout contract without publishing drafts.

create function public.normalize_public_site_media_layout(p_value jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
begin
  if jsonb_typeof(p_value) <> 'object' then return v_result; end if;

  if p_value->>'media_size' in ('full','wide','medium','compact') then
    v_result := v_result || jsonb_build_object('media_size', p_value->>'media_size');
  end if;
  if p_value->>'media_aspect' in ('landscape','classic','square','portrait') then
    v_result := v_result || jsonb_build_object('media_aspect', p_value->>'media_aspect');
  end if;
  if p_value->>'media_height' in ('auto','compact','medium','tall') then
    v_result := v_result || jsonb_build_object('media_height', p_value->>'media_height');
  end if;
  if p_value->>'media_fit' in ('cover','contain') then
    v_result := v_result || jsonb_build_object('media_fit', p_value->>'media_fit');
  end if;
  if p_value->>'media_frame' in ('none','line','card') then
    v_result := v_result || jsonb_build_object('media_frame', p_value->>'media_frame');
  end if;
  if p_value->>'media_radius' in ('none','soft','rounded','pill') then
    v_result := v_result || jsonb_build_object('media_radius', p_value->>'media_radius');
  end if;
  if p_value->>'media_gap' in ('none','compact','normal','airy') then
    v_result := v_result || jsonb_build_object('media_gap', p_value->>'media_gap');
  end if;
  if p_value->>'media_columns' in ('2','3','4') then
    v_result := v_result || jsonb_build_object('media_columns', (p_value->>'media_columns')::integer);
  end if;

  if p_value->>'media_mobile_aspect' in ('landscape','classic','square','portrait') then
    v_result := v_result || jsonb_build_object('media_mobile_aspect', p_value->>'media_mobile_aspect');
  end if;
  if p_value->>'media_mobile_height' in ('auto','compact','medium','tall') then
    v_result := v_result || jsonb_build_object('media_mobile_height', p_value->>'media_mobile_height');
  end if;
  if p_value->>'media_mobile_fit' in ('cover','contain') then
    v_result := v_result || jsonb_build_object('media_mobile_fit', p_value->>'media_mobile_fit');
  end if;
  if p_value->>'media_mobile_position' in ('before','after') then
    v_result := v_result || jsonb_build_object('media_mobile_position', p_value->>'media_mobile_position');
  end if;
  if p_value->>'media_mobile_columns' in ('1','2') then
    v_result := v_result || jsonb_build_object('media_mobile_columns', (p_value->>'media_mobile_columns')::integer);
  end if;

  if coalesce(p_value->>'media_focal_x','') ~ '^-?[0-9]+([.][0-9]+)?$' then
    v_result := v_result || jsonb_build_object('media_focal_x', least(100, greatest(0, (p_value->>'media_focal_x')::numeric)));
  end if;
  if coalesce(p_value->>'media_focal_y','') ~ '^-?[0-9]+([.][0-9]+)?$' then
    v_result := v_result || jsonb_build_object('media_focal_y', least(100, greatest(0, (p_value->>'media_focal_y')::numeric)));
  end if;
  if coalesce(p_value->>'media_opacity','') ~ '^-?[0-9]+([.][0-9]+)?$' then
    v_result := v_result || jsonb_build_object('media_opacity', least(100, greatest(0, (p_value->>'media_opacity')::numeric)));
  end if;
  if coalesce(p_value->>'media_overlay','') ~ '^-?[0-9]+([.][0-9]+)?$' then
    v_result := v_result || jsonb_build_object('media_overlay', least(100, greatest(0, (p_value->>'media_overlay')::numeric)));
  end if;
  if coalesce(p_value->>'media_mobile_focal_x','') ~ '^-?[0-9]+([.][0-9]+)?$' then
    v_result := v_result || jsonb_build_object('media_mobile_focal_x', least(100, greatest(0, (p_value->>'media_mobile_focal_x')::numeric)));
  end if;
  if coalesce(p_value->>'media_mobile_focal_y','') ~ '^-?[0-9]+([.][0-9]+)?$' then
    v_result := v_result || jsonb_build_object('media_mobile_focal_y', least(100, greatest(0, (p_value->>'media_mobile_focal_y')::numeric)));
  end if;

  return v_result;
end;
$$;

alter function public.normalize_public_site_custom_blocks(jsonb)
  rename to normalize_public_site_custom_blocks_v29_base;

create function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(public.normalize_public_site_custom_blocks_v29_base(p_blocks)) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_blocks)='array' then p_blocks else '[]'::jsonb end) with ordinality
    where jsonb_typeof(value)='object'
  )
  select coalesce(jsonb_agg(
    normalized.block || public.normalize_public_site_media_layout(coalesce((
      select source.block
      from source
      where left(lower(trim(source.block->>'id')), 72) = normalized.block->>'id'
      order by source.ordinality
      limit 1
    ), '{}'::jsonb))
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized;
$$;

alter function public.normalize_public_site_system_section_settings(jsonb)
  rename to normalize_public_site_system_section_settings_v29_base;

create function public.normalize_public_site_system_section_settings(p_settings jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_base jsonb := public.normalize_public_site_system_section_settings_v29_base(p_settings);
  v_result jsonb := '{}'::jsonb;
  v_section text;
  v_item jsonb;
begin
  if jsonb_typeof(p_settings) <> 'object' then return v_result; end if;
  foreach v_section in array array['hero','services','portfolio','booking','about','team','reviews','membership','gift','faq','safety','contact'] loop
    if not (p_settings ? v_section) or jsonb_typeof(p_settings->v_section) <> 'object' then continue; end if;
    v_item := coalesce(v_base->v_section, '{}'::jsonb)
      || public.normalize_public_site_media_layout(p_settings->v_section);
    if v_item <> '{}'::jsonb then
      v_result := v_result || jsonb_build_object(v_section, v_item);
    end if;
  end loop;
  return v_result;
end;
$$;

revoke all on function public.normalize_public_site_media_layout(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks_v29_base(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_system_section_settings_v29_base(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_system_section_settings(jsonb) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_media_layout(jsonb) is
  'Validates bounded desktop and mobile media-layout tokens for Site Editor 2.9.';
comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Preserves the existing custom-block validator and adds canonical Site Editor 2.9 media-layout tokens.';
comment on function public.normalize_public_site_system_section_settings(jsonb) is
  'Preserves sparse system-section settings and adds canonical Site Editor 2.9 background-media tokens.';
