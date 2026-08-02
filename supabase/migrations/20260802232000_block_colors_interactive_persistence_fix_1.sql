-- OneStudio OS
-- Block Colors Interactive Persistence Fix 1.0.
--
-- Keeps the existing compatibility save path and explicitly preserves
-- normalized per-section color choices made in the visual editor.

create or replace function public.save_public_site_draft(
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
  v_saved jsonb;
  v_layout_source jsonb := '[]'::jsonb;
  v_layout jsonb := '[]'::jsonb;
  v_template_id text;
  v_brand_name text;
  v_accent text;
  v_dark text;
  v_surface text;
  v_mobile_title_size text;
  v_section_colors jsonb := '{}'::jsonb;
  v_palette_index integer := 0;
begin
  select coalesce(locale_row.draft_content, locale_row.published_content, '{}'::jsonb)
    into v_previous
  from public.public_site_locales locale_row
  where locale_row.business_id = p_business_id
    and locale_row.locale = v_locale
  limit 1;

  v_previous := coalesce(v_previous, '{}'::jsonb);

  v_saved := public.save_public_site_draft_v22(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  v_template_id := lower(trim(coalesce(
    nullif(p_content->>'template_id', ''),
    nullif(v_previous->>'template_id', '')
  )));
  if v_template_id !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    v_template_id := null;
  end if;

  v_brand_name := left(trim(coalesce(
    nullif(p_content->>'brand_name', ''),
    nullif(v_previous->>'brand_name', '')
  )), 160);
  if v_brand_name = '' then
    v_brand_name := null;
  end if;

  v_accent := lower(trim(coalesce(
    nullif(p_content->>'theme_accent', ''),
    nullif(v_previous->>'theme_accent', ''),
    '#9d3151'
  )));
  if v_accent !~ '^#[0-9a-f]{6}$' then
    v_accent := '#9d3151';
  end if;

  v_dark := lower(trim(coalesce(
    nullif(p_content->>'theme_dark', ''),
    nullif(v_previous->>'theme_dark', ''),
    '#321722'
  )));
  if v_dark !~ '^#[0-9a-f]{6}$' then
    v_dark := '#321722';
  end if;

  v_surface := lower(trim(coalesce(
    nullif(p_content->>'theme_surface', ''),
    nullif(v_previous->>'theme_surface', ''),
    '#fff7f5'
  )));
  if v_surface !~ '^#[0-9a-f]{6}$' then
    v_surface := '#fff7f5';
  end if;

  v_mobile_title_size := lower(trim(coalesce(
    nullif(p_content->>'hero_title_mobile_size', ''),
    nullif(v_previous->>'hero_title_mobile_size', ''),
    'medium'
  )));
  if v_mobile_title_size not in ('small', 'medium', 'large') then
    v_mobile_title_size := 'medium';
  end if;

  v_section_colors := public.normalize_public_site_section_colors(
    case
      when jsonb_typeof(p_content->'section_colors') = 'object'
        then p_content->'section_colors'
      when jsonb_typeof(v_previous->'section_colors') = 'object'
        then v_previous->'section_colors'
      else '{}'::jsonb
    end
  );

  if coalesce(p_content->>'palette_index', '') ~ '^[0-9]+$' then
    v_palette_index := least(3, greatest(0, (p_content->>'palette_index')::integer));
  elsif coalesce(v_previous->>'palette_index', '') ~ '^[0-9]+$' then
    v_palette_index := least(3, greatest(0, (v_previous->>'palette_index')::integer));
  end if;

  if jsonb_typeof(p_content->'layout_order') = 'array' then
    v_layout_source := p_content->'layout_order';
  elsif jsonb_typeof(v_previous->'layout_order') = 'array' then
    v_layout_source := v_previous->'layout_order';
  end if;

  select coalesce(jsonb_agg(item order by first_position), '[]'::jsonb)
    into v_layout
  from (
    select item, min(position) as first_position
    from jsonb_array_elements_text(v_layout_source)
      with ordinality as requested(item, position)
    where item ~ '^section:(services|portfolio|booking|team|reviews|membership|gift|faq|safety|about|contact)$'
       or item ~ '^custom:[A-Za-z0-9._:-]{1,160}$'
    group by item
    order by min(position)
    limit 64
  ) ordered_items;

  v_saved := coalesce(v_saved, '{}'::jsonb)
    || jsonb_strip_nulls(jsonb_build_object(
      'template_id', v_template_id,
      'brand_name', v_brand_name,
      'theme_accent', v_accent,
      'theme_dark', v_dark,
      'theme_surface', v_surface,
      'palette_index', v_palette_index,
      'hero_title_mobile_size', v_mobile_title_size,
      'section_colors', v_section_colors,
      'layout_order', v_layout
    ));

  update public.public_site_locales
  set draft_content = v_saved,
      updated_at = now()
  where business_id = p_business_id
    and locale = v_locale;

  if not found then
    raise exception 'public_site_locale_not_found' using errcode = '23503';
  end if;

  return v_saved;
end;
$$;

revoke all on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;

grant execute on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) to authenticated;

comment on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) is
  'Delegates validated fields to save_public_site_draft_v22 and preserves template, palette, layout order, mobile title settings and normalized section colors.';
